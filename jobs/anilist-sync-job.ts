import { anilistObjToMediaDTO, newMediaToUpdateInput } from "@/jobs/dto"
import { anilistGetAnimeByIdsQuery, anilistGetSeasonalAnimeQuery } from "@/jobs/graphql"
import { fetchWithRetry } from "@/jobs/utils"
import prisma from "@/lib/prisma"
import { createMediaInputType } from "@/types/prisma"
import { pastSeasons } from "@/utils/date"

const ANILIST_SEASONS = ["WINTER", "SPRING", "SUMMER", "FALL"] as const

function nextSeason(year: number, season: number) {
  if (season === 4) {
    return { year: year + 1, season: 1 }
  }
  return { year, season: season + 1 }
}

async function processAndSaveMedia(rawMediaList: any[]) {
  if (!rawMediaList || rawMediaList.length === 0) return { createdCount: 0, updatedCount: 0 }

  const anilistIds = rawMediaList.map(m => m.id)
  const existingMediaInDb = await prisma.media.findMany({
    where: {
      OR: anilistIds.map((id: number) => ({
        id_external: {
          path: ["anilist"],
          equals: id,
        },
      })),
    },
  })

  const existingMediaMap = new Map<number, (typeof existingMediaInDb)[0]>()
  for (const m of existingMediaInDb) {
    const aId = (m.id_external as any)?.anilist
    if (aId) existingMediaMap.set(aId, m)
  }

  // 2. Batch query all relation targets in 1 single database call (eliminates N+1 relation queries)
  const allRelationSourceIds = rawMediaList
    .flatMap(m => m.relations?.nodes?.map((n: any) => n.id) || [])
    .filter((id): id is number => typeof id === "number")

  const targetMap = new Map<number, number>()
  if (allRelationSourceIds.length > 0) {
    const uniqueSourceIds = Array.from(new Set(allRelationSourceIds))
    const relationTargetsInDb = await prisma.media.findMany({
      where: {
        OR: uniqueSourceIds.map((id: number) => ({
          id_external: {
            path: ["anilist"],
            equals: id,
          },
        })),
      },
      select: { id: true, id_external: true },
    })

    for (const t of relationTargetsInDb) {
      const aId = (t.id_external as any)?.anilist
      if (aId) targetMap.set(aId, t.id)
    }
  }

  let createdCount = 0
  let updatedCount = 0

  for (const rawMedia of rawMediaList) {
    const newMedia = anilistObjToMediaDTO(rawMedia)
    const relations = rawMedia.relations
    const oldMedia = existingMediaMap.get(rawMedia.id)

    if (oldMedia) {
      const updateInput = newMediaToUpdateInput(newMedia, oldMedia, true)
      if (updateInput) {
        await prisma.media.update({
          where: { id: oldMedia.id },
          data: updateInput,
        })
        updatedCount++
      }

      // Update franchise relations using pre-fetched target map
      if (relations && relations.nodes.length > 0) {
        for (let index = 0; index < relations.nodes.length; index++) {
          const sourceId = relations.nodes[index].id
          const targetDbId = targetMap.get(sourceId)

          if (targetDbId) {
            await prisma.relation.upsert({
              where: {
                relation_target_id_relation_source_id: {
                  relation_source_id: targetDbId,
                  relation_target_id: oldMedia.id,
                },
              },
              create: {
                relation_type: relations.edges[index].relationType,
                relation_source_id: targetDbId,
                relation_target_id: oldMedia.id,
              },
              update: {
                relation_type: relations.edges[index].relationType,
              },
            })
          }
        }
      }
    } else {
      await prisma.media.create({
        data: newMedia as createMediaInputType,
      })
      createdCount++
    }
  }

  return { createdCount, updatedCount }
}

export async function anilistSyncJob(startAt?: number) {
  const globalStart = Date.now()
  console.log(`[AniList Sync] Starting seasonal and status sync job...`)

  await prisma.syncCheckpoint.upsert({
    where: { job_name: "anilist" },
    create: { job_name: "anilist", last_page: 1, status: "running" },
    update: { status: "running" },
  })

  try {
    // 1. Determine target seasons (past 2 seasons, current season, next season)
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentSeasonNum = Math.floor(now.getMonth() / 3) + 1

    const seasonsToSync = [
      { year: currentYear, season: currentSeasonNum },
      ...pastSeasons(currentYear, currentSeasonNum, 1),
      nextSeason(currentYear, currentSeasonNum),
    ]

    for (const { year, season } of seasonsToSync) {
      const seasonName = ANILIST_SEASONS[season - 1]
      console.log(`[AniList Sync] Fetching ${year} ${seasonName}...`)
      let page = 1

      while (true) {
        const start = Date.now()
        const resp = await fetchWithRetry("https://graphql.anilist.co", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: anilistGetSeasonalAnimeQuery,
            variables: { page, perPage: 50, season: seasonName, seasonYear: year },
          }),
        })

        const data = await resp.json()
        const rawMediaList = data?.data?.Page?.media || []
        if (rawMediaList.length === 0) break

        const result = await processAndSaveMedia(rawMediaList)
        const elapsed = Date.now() - start
        console.log(
          `[AniList Sync] ${year} ${seasonName} page ${page} synced (${result.createdCount} created, ${result.updatedCount} updated) in ${(elapsed / 1000).toFixed(2)}s`
        )

        const hasNextPage = data?.data?.Page?.pageInfo?.hasNextPage
        if (!hasNextPage) break

        page++
        if (elapsed < 650) {
          await new Promise(r => setTimeout(r, 650 - elapsed))
        }
      }
    }

    // 2. Refresh any active RELEASING anime in our DB to ensure status flips to FINISHED
    console.log(`[AniList Sync] Checking for any active RELEASING anime in DB...`)
    const releasingInDb = await prisma.media.findMany({
      where: {
        status: "RELEASING",
        year: { gte: currentYear - 1 },
      },
      select: { id: true, id_external: true },
    })

    const anilistIds = releasingInDb
      .map(m => (m.id_external as any)?.anilist)
      .filter((id): id is number => typeof id === "number")

    console.log(`[AniList Sync] Found ${anilistIds.length} RELEASING anime in DB to refresh.`)

    const chunkSize = 50
    for (let i = 0; i < anilistIds.length; i += chunkSize) {
      const start = Date.now()
      const chunk = anilistIds.slice(i, i + chunkSize)
      const resp = await fetchWithRetry("https://graphql.anilist.co", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: anilistGetAnimeByIdsQuery,
          variables: { ids: chunk, page: 1, perPage: 50 },
        }),
      })

      const data = await resp.json()
      const rawMediaList = data?.data?.Page?.media || []
      if (rawMediaList.length > 0) {
        const result = await processAndSaveMedia(rawMediaList)
        const elapsed = Date.now() - start
        console.log(
          `[AniList Sync] Status refresh batch ${Math.floor(i / chunkSize) + 1}/${Math.ceil(anilistIds.length / chunkSize)} (${result.updatedCount} updated) in ${(elapsed / 1000).toFixed(2)}s`
        )
      }

      await new Promise(r => setTimeout(r, 650))
    }

    const totalElapsed = (Date.now() - globalStart) / 1000
    console.log(`[AniList Sync] Successfully completed seasonal & status sync in ${totalElapsed.toFixed(1)}s`)

    await prisma.syncCheckpoint.upsert({
      where: { job_name: "anilist" },
      create: { job_name: "anilist", last_page: 1, status: "completed" },
      update: { last_page: 1, status: "completed" },
    })
  } catch (e) {
    console.error(`[AniList Sync Error] Job failed:`, e)
    await prisma.syncCheckpoint.upsert({
      where: { job_name: "anilist" },
      create: { job_name: "anilist", last_page: 1, status: "error" },
      update: { status: "error" },
    })
  }
}

