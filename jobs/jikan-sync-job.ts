import { jikanObjToMediaDTO } from "./dto"
import { fetchWithRetry } from "./utils"
import prisma from "@/lib/prisma"
import { equals, identity, isEmpty, pickBy } from "ramda"

async function processJikanPage(rawMediaList: any[]) {
  if (!rawMediaList || rawMediaList.length === 0) return 0

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

  return updatedCount
}

export async function jikanSyncJob(_startAt?: number) {
  const globalStart = Date.now()
  console.log(`[Jikan Sync] Starting seasonal sync (now & upcoming)...`)

  await prisma.syncCheckpoint.upsert({
    where: { job_name: "jikan" },
    create: { job_name: "jikan", last_page: 1, status: "running" },
    update: { status: "running" },
  })

  const endpoints = [
    { name: "seasons/now", url: "https://api.jikan.moe/v4/seasons/now" },
    { name: "seasons/upcoming", url: "https://api.jikan.moe/v4/seasons/upcoming" },
  ]

  try {
    for (const endpoint of endpoints) {
      let page = 1
      console.log(`[Jikan Sync] Fetching ${endpoint.name}...`)

      while (true) {
        const start = Date.now()
        const url = `${endpoint.url}?page=${page}`
        let resp: Response
        try {
          resp = await fetchWithRetry(url, {}, 4, 1500)
        } catch (fetchErr) {
          console.warn(`[Jikan Sync] Page ${page} failed after retries for ${endpoint.name}:`, fetchErr)
          break
        }
        if (!resp.ok) {
          console.warn(`[Jikan Sync] ${endpoint.name} returned HTTP ${resp.status} on page ${page}`)
          break
        }
        const data = await resp.json()
        const rawMediaList = data?.data || []

        if (rawMediaList.length === 0) break

        const updatedCount = await processJikanPage(rawMediaList)
        const elapsed = Date.now() - start
        console.log(
          `[Jikan Sync] ${endpoint.name} page ${page} synced (${updatedCount}/${rawMediaList.length} updated in DB) in ${(elapsed / 1000).toFixed(2)}s`
        )

        const hasNextPage = data?.pagination?.has_next_page
        if (!hasNextPage) break

        page++
        if (elapsed < 1100) {
          await new Promise(r => setTimeout(r, 1100 - elapsed))
        }
      }
    }

    const globalPassed = (Date.now() - globalStart) / 1000
    console.log(`[Jikan Sync] Successfully finished seasonal sync in ${globalPassed.toFixed(1)}s`)

    await prisma.syncCheckpoint.upsert({
      where: { job_name: "jikan" },
      create: { job_name: "jikan", last_page: 1, status: "completed" },
      update: { last_page: 1, status: "completed" },
    })
  } catch (e) {
    console.error(`[Jikan Sync Error] Failed:`, e)
    await prisma.syncCheckpoint.upsert({
      where: { job_name: "jikan" },
      create: { job_name: "jikan", last_page: 1, status: "error" },
      update: { status: "error" },
    })
  }
}

