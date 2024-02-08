import fs from "fs/promises"
import prisma from "@/lib/prisma"
import { Prisma } from "@prisma/client"
import { OpenCC } from "opencc"

async function checkExternalJson() {
  const allExternals = JSON.parse(await fs.readFile("tmp/external.json", "utf8"))
  const c = allExternals.map(a => a.data.filter(b => b.name === "Wikipedia")).filter(v => v.length > 1)
  console.log("🚀 ~ jikanLinkSyncJob ~ c:", c.length)
  return
}

async function fetchWiki() {
  const d = JSON.parse(await fs.readFile("tmp/external.json", "utf8"))
  for (const data of d) {
  }
}

async function jikanLinkSyncJob(year, season) {
  const converter: OpenCC = new OpenCC("s2t.json")
  let count = 0
  const animes = await prisma.media.findMany({
    where: {
      // year,
      // season,
      day_of_week: {
        not: Prisma.DbNull,
      },
    },
  })
  console.log("🚀 ~ file: jikan-link-sync-job.ts:11 ~ jikanLinkSyncJob ~ animes:", animes.length)
  for (const anime of animes) {
    const start = Date.now()
    const malId = anime?.id_external?.mal
    if (!malId) continue
    const url = `https://api.jikan.moe/v4/anime/${malId}/external`
    const resp = await fetch(url, {
      method: "GET",
    })
    const data = await resp.json()

    const d = JSON.parse(await fs.readFile("tmp/external.json", "utf8"))
    d.push({ ...data, mal: malId })
    await fs.writeFile("tmp/external.json", JSON.stringify(d, null, 2))

    const links = data.data.filter(link => link.name === "Wikipedia")
    if (links.length === 0) continue

    let zhWikiLink
    let zhTitle
    for (const link of links) {
      let api
      if (link.url.includes("en.wikipedia.org")) {
        const slug = link.url.split("/").pop().split("#")[0]
        api =
          "https://en.wikipedia.org/w/api.php?action=query&format=json&prop=langlinks&formatversion=2&&lllang=zh&llprop=url&titles=" +
          slug
      } else if (link.url.includes("ja.wikipedia.org")) {
        const slug = link.url.split("/").pop().split("#")[0]
        api =
          "https://ja.wikipedia.org/w/api.php?action=query&format=json&prop=langlinks&formatversion=2&&lllang=zh&llprop=url&titles=" +
          slug
      }
      if (api) {
        const resp = await fetch(api, {
          method: "GET",
        })
        const data = await resp.json()
        const langlinks = data?.query?.pages?.[0]?.langlinks
        if (langlinks) {
          const zhLink = langlinks.find(langlink => langlink.lang === "zh")
          if (zhLink) {
            zhWikiLink = {
              site: "Wikipedia",
              url: zhLink.url,
            }
            zhTitle = await converter.convertPromise(zhLink.title)
          }
          break
        }
      }
    }

    await prisma.media.update({
      where: {
        id: anime.id,
      },
      data: {
        titles: {
          ...anime.titles,
          ...(zhTitle ? { zh: zhTitle } : {}),
        },
        external_links: [
          ...anime.external_links.filter(link => link.site !== "Wikipedia"),
          ...links.map(link => ({
            site: link.name,
            url: link.url,
          })),
          ...(zhWikiLink ? [zhWikiLink] : []),
        ],
      },
    })
    const elapsed = Date.now() - start
    console.log(`count: ${count++}, elapsed: ${elapsed / 1000} sec`)
    if (elapsed < 1000) {
      await new Promise(resolve => setTimeout(resolve, 1000 - elapsed + 100))
    }
  }
}

jikanLinkSyncJob(2023, 3)
