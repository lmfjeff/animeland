import fs from "fs/promises"
import prisma from "@/lib/prisma"
import { jikanUpdateAnimeDto, malUpdateAnimeDto } from "./dto"
import { isEmpty } from "ramda"
import { seasonList } from "@/constants/media"

async function jikanSyncJob() {
  let page = 1
  const wholeList: any[] = []
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
      wholeList.push(...rawMediaList)
      for (const rawMedia of rawMediaList) {
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
          const updateInput = jikanUpdateAnimeDto(rawMedia, oldMedia)
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
      if (!hasNextPage) {
        await fs.writeFile("./jikan.json", JSON.stringify(wholeList, null, 2))
        console.log(`end of fetch: page ${page}, total time: ${(Date.now() - globalStart) / 1000}`)
        return
      }
      page++
    } catch (e) {
      console.log("🚀 ~ file: jikan-sync-job.ts:57 ~ jikanSyncJob ~ e:", e)
      return
    }
  }
}

jikanSyncJob()
