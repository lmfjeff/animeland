import fs from "fs/promises"
import { anilistCreateAnimeDto, anilistUpdateAnimeDto } from "@/jobs/dto"
import { anilistGetAnimeByPageQuery } from "@/jobs/graphql"
import prisma from "@/lib/prisma"

async function anilistSyncJob(stopAt?: number) {
  let page = 1
  const wholeList: any[] = []
  const globalStart = Date.now()
  while (true) {
    try {
      const start = Date.now()
      const resp = await fetch("https://graphql.anilist.co", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: anilistGetAnimeByPageQuery,
          variables: { page, perPage: 50 },
        }),
      })
      const data = await resp.json()

      // write to db
      const rawMediaList = data.data.Page.media
      wholeList.push(...rawMediaList)
      for (const rawMedia of rawMediaList) {
        const found = await prisma.media.findMany({
          where: {
            id_external: {
              path: ["anilist"],
              equals: rawMedia.id,
            },
          },
        })
        if (found.length > 0) {
          const oldMedia = found?.[0]
          const updateInput = anilistUpdateAnimeDto(rawMedia, oldMedia)
          await prisma.media.update({
            where: {
              id: oldMedia.id,
            },
            data: updateInput,
          })
        } else {
          const createInput = anilistCreateAnimeDto(rawMedia)
          await prisma.media.create({
            data: createInput,
          })
        }
      }
      console.log(`page: ${page}, elapsed: ${(Date.now() - start) / 1000} sec`)

      // check if last page
      const hasNextPage = data.data.Page.pageInfo.hasNextPage
      if (!hasNextPage) {
        await fs.writeFile("./anilist.json", JSON.stringify(wholeList, null, 2))
        console.log(`end of fetch: page ${page}, total time: ${(Date.now() - globalStart) / 1000}`)
        return
      }
      // sleep to avoid rate limit
      if (resp.status === 429) {
        const retryAfter = resp.headers.get("Retry-After")
        if (retryAfter) {
          console.log(`rate limited: retry in ${retryAfter} sec`)
          await new Promise(r => setTimeout(r, (Number(retryAfter) + 3) * 1000))
        } else {
          console.log("rate limited: no retryAfter?")
          return
        }
      }
      // manual last page
      if (stopAt && page === stopAt) {
        console.log(`manual end at page ${stopAt}, total time: ${(Date.now() - globalStart) / 1000}`)
        return
      }
      page++
    } catch (e) {
      console.log("🚀 ~ file: test.ts:27 ~ test ~ e:", e)
      return
    }
  }
}

anilistSyncJob()
