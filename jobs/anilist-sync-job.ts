import { anilistObjToMediaDTO, newMediaToUpdateInput } from "@/jobs/dto"
import { anilistGetAnimeByPageQuery } from "@/jobs/graphql"
import prisma from "@/lib/prisma"
import { createMediaInputType } from "@/types/prisma"

export async function anilistSyncJob(startAt?: number) {
  let page = startAt || 1
  const globalStart = Date.now()
  while (true) {
    let rawData
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

      // sleep to avoid rate limit
      if (resp.status === 429) {
        const retryAfter = resp.headers.get("Retry-After")
        if (retryAfter) {
          console.log(`rate limited: retry in ${retryAfter} sec`)
          await new Promise(r => setTimeout(r, (Number(retryAfter) + 3) * 1000))
          continue
        } else {
          console.log("rate limited: no retryAfter?")
          return
        }
      }

      // write to db
      rawData = data
      const rawMediaList = data.data.Page.media
      for (const rawMedia of rawMediaList) {
        const newMedia = anilistObjToMediaDTO(rawMedia)
        const relations = rawMedia.relations
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
          const updateInput = newMediaToUpdateInput(newMedia, oldMedia, true)
          if (!updateInput) continue
          await prisma.media.update({
            where: {
              id: oldMedia.id,
            },
            data: updateInput,
          })

          // create relations
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
      console.log(`page: ${page}, elapsed: ${elapsed / 1000} sec`)
      if (elapsed < 700) {
        await new Promise(resolve => setTimeout(resolve, 700 - elapsed + 100))
      }

      // check if last page
      const hasNextPage = data.data.Page.pageInfo.hasNextPage
      const globalPassed = (Date.now() - globalStart) / 1000
      if (!hasNextPage) {
        console.log(`end of fetch: page ${page}, total time: ${globalPassed}`)
        return
      }
      page++

      if (globalPassed > 850 && !!process.env.LAMBDA_TASK_ROOT) {
        console.log(`almost timeout, continue in next job: page ${page}, total time: ${globalPassed}`)
        return page
      }
    } catch (e) {
      console.log("🚀 ~ file: test.ts:27 ~ test ~ e:", e)
      console.log("rawData: ", JSON.stringify(rawData))
      return
    }
  }
}

// anilistSyncJob()
