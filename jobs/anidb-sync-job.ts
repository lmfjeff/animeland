import { XMLParser } from "fast-xml-parser"
import fs from "fs/promises"
import prisma from "@/lib/prisma"

async function anidbSyncJob() {
  //   const start = Date.now()
  //   const resp = await fetch("http://anidb.net/api/anime-titles.dat.gz")
  //   const data = await resp.text()
  //   const lines = data.split("\n")
  //   const titles = lines
  //     .filter((line) => line.startsWith("1"))
  //     .map((line) => {
  //       const [_, id, lang, type, title] = line.split("|")
  //       return {
  //         id: Number(id),
  //         lang,
  //         type,
  //         title,
  //       }
  //     })
  //   await fs.writeFile("./anidb.json", JSON.stringify(titles, null, 2))
  //   console.log(`total time: ${(Date.now() - start) / 1000} sec`)
  const parser = new XMLParser({
    ignoreAttributes: false,
  })
  const XMLdata = await fs.readFile("./anidb.xml", "utf8")
  let jObj = parser.parse(XMLdata)
  console.log("🚀 ~ file: anidb-sync-job.ts:24 ~ anidbSyncJob ~ jObj:", jObj.animetitles.anime.length)

  let count = 0
  let zhCount = 0
  let wholeList: any[] = []
  for (const anime of jObj.animetitles.anime) {
    // anime['@_aid']
    // anime.title[0]['#text']
    // anime.title[0]['@_type']
    // anime.title[0]['@_xml:lang']
    if (!Array.isArray(anime.title)) continue

    const orList: any[] = []
    let en
    const enOfficialTitle = anime.title.find(t => t["@_xml:lang"].includes("en") && t["@_type"] === "official")
    if (!enOfficialTitle) {
      const enSynTitle = anime.title.find(t => t["@_xml:lang"].includes("en"))
      if (enSynTitle) en = enSynTitle["#text"]
    } else {
      en = enOfficialTitle["#text"]
    }

    let ja
    const jaOfficialTitle = anime.title.find(t => t["@_xml:lang"].includes("ja") && t["@_type"] === "official")
    if (!jaOfficialTitle) {
      const jaSynTitle = anime.title.find(t => t["@_xml:lang"].includes("ja"))
      if (jaSynTitle) ja = jaSynTitle["#text"]
    } else {
      ja = jaOfficialTitle["#text"]
    }

    let enjp
    const mainOfficialTitle = anime.title.find(t => t["@_type"] === "main")
    if (mainOfficialTitle) enjp = mainOfficialTitle["#text"]

    if (!en && !ja && !enjp) continue

    const zhTitles = anime.title.filter(t => t["@_xml:lang"].includes("zh"))

    if (en) {
      orList.push({
        titles: {
          path: ["en"],
          equals: en,
        },
      })
    }
    if (ja) {
      orList.push({
        titles: {
          path: ["ja"],
          equals: ja,
        },
      })
    }
    if (enjp) {
      orList.push({
        titles: {
          path: ["en_jp"],
          equals: enjp,
        },
      })
    }

    const found = await prisma.media.findMany({
      where: {
        OR: orList,
      },
    })
    if (found.length > 0) {
      if (zhTitles.length > 0) {
        zhCount++
        wholeList.push(zhTitles)
      }
      console.log("🚀 ~ file: anidb-sync-job.ts:66 ~ anidbSyncJob ~ count:", count)
      count++
    }
  }

  console.log("🚀 ~ file: anidb-sync-job.ts:93 ~ anidbSyncJob ~ zhCount:", zhCount)
  await fs.writeFile("./anidb.json", JSON.stringify(wholeList, null, 2))
  // console.log("🚀 ~ file: anidb-sync-job.ts:34 ~ anidbSyncJob ~ jObj.animetitles.anime:", jObj.animetitles.anime)
  // const tmp = jObj.animetitles.anime.filter(anime => {
  //   if (!Array.isArray(anime.title)) return false
  //   return anime.title.some(t => t["@_xml:lang"].includes("en"))
  // })
  // console.log("🚀 ~ file: anidb-sync-job.ts:38 ~ tmp ~ tmp:", tmp.length)
}
anidbSyncJob()
