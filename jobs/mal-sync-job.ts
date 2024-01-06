import prisma from "@/lib/prisma"
import { malObjToMediaDTO, newMediaToUpdateInput } from "./dto"
import { isEmpty } from "ramda"
import { MAL_CLIENT_ID } from "@/constants/env"
import { seasonList } from "@/constants/media"

async function malSyncJob() {
  let year = 2023
  let season = 0
  while (true) {
    try {
      const start = Date.now()
      let nextPage
      let url

      if (!nextPage) {
        url =
          `https://api.myanimelist.net/v2/anime/season/${year}/${seasonList[season % 4]}?` +
          new URLSearchParams({
            limit: "500",
            offset: "0",
            fields:
              "id,title,main_picture,alternative_titles,start_date,end_date,synopsis,mean,rank,popularity,num_list_users,num_scoring_users,nsfw,created_at,updated_at,media_type,status,genres,my_list_status,num_episodes,start_season,broadcast,source,average_episode_duration,rating,pictures,background,related_anime,related_manga,recommendations,studios,statistics",
          })
      }
      const resp = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-MAL-CLIENT-ID": MAL_CLIENT_ID,
        },
      })

      if (resp.status === 404) {
        console.log("season not found")
        return
      }

      const data = await resp.json()

      //   write data to db
      const rawMediaList = data.data
      for (const rawMedia of rawMediaList) {
        const newMedia = malObjToMediaDTO(rawMedia.node)
        const found = await prisma.media.findMany({
          where: {
            id_external: {
              path: ["mal"],
              equals: rawMedia.node.id,
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
      console.log(`season: ${year}-${season % 4}, elapsed: ${(Date.now() - start) / 1000} sec`)

      nextPage = data.paging.next
      if (nextPage) {
        url = nextPage
      } else {
        season += 1
        year += season % 4 === 0 ? 1 : 0
      }
    } catch (e) {
      console.log("🚀 ~ file: malsyncjob.ts:24 ~ malsyncjob ~ e:", e)
      return
    }
    // return
  }
}

malSyncJob()
