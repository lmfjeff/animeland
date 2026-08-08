import { jikanObjToMediaDTO } from "./dto"
import { fetchWithRetry } from "./utils"
import prisma from "@/lib/prisma"
import { equals, identity, isEmpty, pickBy } from "ramda"

export async function jikanSyncJob(startAt?: number) {
  let page = startAt
  if (!page) {
    const checkpoint = await prisma.syncCheckpoint.findUnique({
      where: { job_name: "jikan" },
    })
    page = checkpoint?.last_page || 1
  }

  const globalStart = Date.now()
  console.log(`[Jikan Sync] Starting sync from page ${page}...`)

  while (true) {
    try {
      const start = Date.now()
      const url = `https://api.jikan.moe/v4/anime?page=${page}`

      const resp = await fetchWithRetry(url, {}, 4, 1200)
      const data = await resp.json()
      const rawMediaList = data?.data || []

      if (rawMediaList.length === 0) {
        console.log(`[Jikan Sync] No more media returned. Finished at page ${page}.`)
        await prisma.syncCheckpoint.upsert({
          where: { job_name: "jikan" },
          create: { job_name: "jikan", last_page: 1, status: "completed" },
          update: { last_page: 1, status: "completed" },
        })
        return
      }

      // Batch query all records by MAL external ID in a single query
      const malIds = rawMediaList.map(m => m.mal_id).filter(Boolean)
      const existingDbMedia = await prisma.media.findMany({
        where: {
          OR: malIds.map((id: number) => ({
            id_external: {
              path: ["mal"],
              equals: id,
            },
          })),
        },
      })

      const existingMap = new Map<number, (typeof existingDbMedia)[0]>()
      for (const m of existingDbMedia) {
        const mId = (m.id_external as any)?.mal
        if (mId) existingMap.set(mId, m)
      }

      // Update air times and scores
      let updatedCount = 0
      for (const rawMedia of rawMediaList) {
        const newMedia = jikanObjToMediaDTO(rawMedia) as any
        const oldMedia = existingMap.get(rawMedia.mal_id)

        if (oldMedia) {
          let updateInput: any = {}
          if (!equals(oldMedia.day_of_week, newMedia.day_of_week)) {
            updateInput["day_of_week"] = newMedia.day_of_week
          }
          if (!equals(oldMedia.time, newMedia.time)) {
            updateInput["time"] = newMedia.time
          }
          if (!equals(oldMedia.score_external?.mal, newMedia.score_external?.mal)) {
            updateInput["score_external"] = {
              ...(oldMedia.score_external as any),
              mal: newMedia.score_external?.mal,
            }
          }
          updateInput = pickBy(identity, updateInput)
          if (!updateInput || isEmpty(updateInput)) continue

          await prisma.media.update({
            where: { id: oldMedia.id },
            data: updateInput,
          })
          updatedCount++
        }
      }

      const elapsed = Date.now() - start
      console.log(
        `[Jikan Sync] Page ${page} synced (${updatedCount}/${rawMediaList.length} updated) in ${(elapsed / 1000).toFixed(2)}s`
      )

      // Checkpoint progress
      await prisma.syncCheckpoint.upsert({
        where: { job_name: "jikan" },
        create: { job_name: "jikan", last_page: page, status: "running" },
        update: { last_page: page, status: "running" },
      })

      // Strict pacing for Jikan 3 req/sec limit
      if (elapsed < 1100) {
        await new Promise(r => setTimeout(r, 1100 - elapsed))
      }

      const hasNextPage = data?.pagination?.has_next_page
      const globalPassed = (Date.now() - globalStart) / 1000

      if (!hasNextPage) {
        console.log(`[Jikan Sync] Finished all pages at page ${page}. Total time: ${globalPassed.toFixed(1)}s`)
        await prisma.syncCheckpoint.upsert({
          where: { job_name: "jikan" },
          create: { job_name: "jikan", last_page: 1, status: "completed" },
          update: { last_page: 1, status: "completed" },
        })
        return
      }

      page++

      if (globalPassed > 850 && !!process.env.LAMBDA_TASK_ROOT) {
        console.log(
          `[Jikan Sync] Lambda timeout approaching. Saved checkpoint at page ${page}. Total time: ${globalPassed.toFixed(1)}s`
        )
        return page
      }
    } catch (e) {
      console.error(`[Jikan Sync Error] Page ${page} failed:`, e)
      return
    }
  }
}

// jikanSyncJob()
