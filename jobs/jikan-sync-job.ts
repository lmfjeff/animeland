import prisma from "@/lib/prisma"
import { jikanObjToMediaDTO, newMediaToUpdateInput } from "./dto"

export async function jikanSyncJob(startAt?: number) {
  let page = startAt || 1
  const globalStart = Date.now()

  while (true) {
    try {
      const start = Date.now()
      const url =
        `https://api.jikan.moe/v4/anime?` +
        new URLSearchParams({
          page: page.toString(),
        })
      const resp = await fetch(url, {
        method: "GET",
      })
      const data = await resp.json()

      //   write data to db
      const rawMediaList = data.data
      for (const rawMedia of rawMediaList) {
        const newMedia = jikanObjToMediaDTO(rawMedia)
        const found = await prisma.media.findMany({
          where: {
            id_external: {
              path: ["mal"],
              equals: rawMedia.mal_id,
            },
          },
        })
        if (found.length > 0) {
          const oldMedia = found?.[0]
          const updateInput = newMediaToUpdateInput(newMedia, oldMedia)
          if (!updateInput) continue
          await prisma.media.update({
            where: {
              id: oldMedia.id,
            },
            data: updateInput,
          })
        }
      }
      const elapsed = Date.now() - start
      console.log(`page: ${page}, elapsed: ${elapsed / 1000} sec`)
      if (elapsed < 1000) {
        await new Promise(resolve => setTimeout(resolve, 1000 - elapsed + 100))
      }

      const hasNextPage = data.pagination.has_next_page
      const globalPassed = (Date.now() - globalStart) / 1000
      if (!hasNextPage) {
        console.log(`end of fetch: page ${page}, total time: ${globalPassed}`)
        return
      }
      page++

      if (globalPassed > 850) {
        console.log(`almost timeout, continue in next job: page ${page}, total time: ${globalPassed}`)
        return page
      }
    } catch (e) {
      console.log("🚀 ~ file: jikan-sync-job.ts:57 ~ jikanSyncJob ~ e:", e)
      return
    }
  }
}

// jikanSyncJob()
