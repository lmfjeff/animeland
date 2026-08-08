import { anilistObjToMediaDTO, newMediaToUpdateInput } from "@/jobs/dto"
import { anilistGetAnimeByPageQuery } from "@/jobs/graphql"
import { fetchWithRetry } from "@/jobs/utils"
import prisma from "@/lib/prisma"
import { createMediaInputType } from "@/types/prisma"

export async function anilistSyncJob(startAt?: number) {
  // Load checkpoint if no explicit startAt was provided
  let page = startAt
  if (!page) {
    const checkpoint = await prisma.syncCheckpoint.findUnique({
      where: { job_name: "anilist" },
    })
    page = checkpoint?.last_page || 1
  }

  const globalStart = Date.now()
  console.log(`[AniList Sync] Starting job at page ${page}...`)

  while (true) {
    try {
      const start = Date.now()
      const resp = await fetchWithRetry("https://graphql.anilist.co", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: anilistGetAnimeByPageQuery,
          variables: { page, perPage: 50 },
        }),
      })

      const data = await resp.json()
      const rawMediaList = data?.data?.Page?.media || []
      if (rawMediaList.length === 0) {
        console.log(`[AniList Sync] No more media returned. Finished at page ${page}.`)
        await prisma.syncCheckpoint.upsert({
          where: { job_name: "anilist" },
          create: { job_name: "anilist", last_page: 1, status: "completed" },
          update: { last_page: 1, status: "completed" },
        })
        return
      }

      // Batch query all existing media for this page in 1 single database call (N+1 eliminated)
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

      // Process and upsert media
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
          }

          // Update franchise relations
          if (relations && relations.nodes.length > 0) {
            const rawRelations = relations.nodes.map((n, index) => ({
              relation_type: relations.edges[index].relationType,
              relation_source_id_anilist: n.id,
            }))

            for (const r of rawRelations) {
              const targets = await prisma.media.findMany({
                where: {
                  id_external: {
                    path: ["anilist"],
                    equals: r.relation_source_id_anilist,
                  },
                },
                select: { id: true },
                take: 1,
              })

              if (targets.length > 0) {
                await prisma.relation.upsert({
                  where: {
                    relation_target_id_relation_source_id: {
                      relation_source_id: targets[0].id,
                      relation_target_id: oldMedia.id,
                    },
                  },
                  create: {
                    relation_type: r.relation_type,
                    relation_source_id: targets[0].id,
                    relation_target_id: oldMedia.id,
                  },
                  update: {
                    relation_type: r.relation_type,
                  },
                })
              }
            }
          }
        } else {
          await prisma.media.create({
            data: newMedia as createMediaInputType,
          })
        }
      }

      const elapsed = Date.now() - start
      console.log(
        `[AniList Sync] Page ${page} synced (${rawMediaList.length} items) in ${(elapsed / 1000).toFixed(2)}s`
      )

      // Save cursor checkpoint
      await prisma.syncCheckpoint.upsert({
        where: { job_name: "anilist" },
        create: { job_name: "anilist", last_page: page, status: "running" },
        update: { last_page: page, status: "running" },
      })

      // Pacing to avoid hitting 90 req/min API ceiling
      if (elapsed < 600) {
        await new Promise(r => setTimeout(r, 600 - elapsed))
      }

      const hasNextPage = data?.data?.Page?.pageInfo?.hasNextPage
      const globalPassed = (Date.now() - globalStart) / 1000

      if (!hasNextPage) {
        console.log(`[AniList Sync] Reached end of catalog at page ${page}. Total runtime: ${globalPassed.toFixed(1)}s`)
        await prisma.syncCheckpoint.upsert({
          where: { job_name: "anilist" },
          create: { job_name: "anilist", last_page: 1, status: "completed" },
          update: { last_page: 1, status: "completed" },
        })
        return
      }

      page++

      // Lambda execution window safety check
      if (globalPassed > 850 && !!process.env.LAMBDA_TASK_ROOT) {
        console.log(
          `[AniList Sync] Lambda timeout approaching. Checkpoint saved at page ${page}. Total time: ${globalPassed.toFixed(1)}s`
        )
        return page
      }
    } catch (e) {
      console.error(`[AniList Sync Error] Page ${page} failed:`, e)
      return
    }
  }
}

// anilistSyncJob()
