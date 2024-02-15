import prisma from "@/lib/prisma"
import { Prisma } from "@prisma/client"
import * as cheerio from "cheerio"
import { range } from "ramda"
import fs from "fs/promises"
import { tabletojson } from "tabletojson"
import unicode from "unicode-regex"
import { newMediaToUpdateInput } from "./dto"

const regex = unicode({ Script: ["Hiragana", "Katakana", "Han", "Latin"] }).toRegExp("g")
const wikiBaseUrl = "https://zh.wikipedia.org/zh-hk"

export async function wikiSyncJob(start, end) {
  const yearList = range(start, end + 1)
  for (const year of yearList) {
    const url = `${wikiBaseUrl}/${year}%E5%B9%B4%E6%97%A5%E6%9C%AC%E5%8B%95%E7%95%AB%E5%88%97%E8%A1%A8`
    const resp = await fetch(url)
    const html = await resp.text()
    // await fs.writeFile(`tmp/wiki-${year}.html`, html)
    // const html = await fs.readFile(`tmp/wiki-${year}.html`, "utf8")
    const $ = cheerio.load(html)
    $(".noprint").remove()

    const seasonList: any[] = []
    $('span[id*="月"]').each((i, el) => {
      const jsonArray = tabletojson.convert("<table>" + $(el).parent().next().html()! + "</table>", {
        stripHtmlFromCells: false,
      })
      if (jsonArray[0]) seasonList.push(jsonArray[0])
    })

    let season = 1
    for (const rowList of seasonList) {
      const zhTitleKey = Object.keys(rowList[0])[1]
      const jaTitleKey = Object.keys(rowList[0])[2]
      // console.log(`${year}-${season}`)

      const rawList = rowList
        .filter(row => row[jaTitleKey])
        .map(row => {
          const zhDom = cheerio.load(row[zhTitleKey])
          const jaDom = cheerio.load(row[jaTitleKey])
          zhDom(".reference").remove()
          jaDom(".reference").remove()
          const text = jaDom.text().match(regex)?.join("").toLowerCase()
          const zhText = zhDom.text()
          const relativeLink = zhDom("a").attr()?.href
          const link = relativeLink ? wikiBaseUrl + relativeLink.replace("/wiki", "") : null

          return { ...row, text, zhText, link }
        })
        .filter(row => row.text)
      // await fs.writeFile(`tmp/test.json`, JSON.stringify(rawList, null, 2))
      // return

      const dbMedia = await prisma.media.findMany({
        where: {
          year,
          // season,
          nsfw: false,
          // day_of_week: {
          //   not: Prisma.DbNull,
          // },
          // time: {
          //   not: Prisma.DbNull,
          // },
          format: {
            in: ["TV", "TV_SHORT", "ONA"],
          },
        },
      })

      const oldList = dbMedia
        .filter(media => media.titles?.ja)
        .map(media => ({ ...media, text: media.titles?.ja.match(regex)?.join("").toLowerCase() }))
        .filter(media => media.text)

      for (const raw of rawList) {
        const exactMatched = oldList.filter(media => media.text === raw.text)
        const matched = oldList.filter(
          media => media.text === raw.text || media.text.includes(raw.text) || raw.text.includes(media.text)
        )
        if (matched.length === 0) {
          console.log(`no match for wiki: ${raw.text}`)
          continue
        }
        if (matched.length > 1 && exactMatched.length > 1) {
          console.log(`2+ match for wiki: ${raw.text}, db: ${matched[0].text}, ${matched[1].text}`)
          continue
        }
        console.log(`wiki: ${raw.text} match db: ${matched[0].text}`)
        const updateInput = newMediaToUpdateInput(
          { titles: { zh: raw.zhText }, external_links: [{ url: raw.link, site: "Wikipedia" }] },
          exactMatched?.[0] || matched[0],
          true
        )
        if (!updateInput) continue
        await prisma.media.update({
          where: {
            id: exactMatched?.[0]?.id || matched[0].id,
          },
          data: updateInput,
        })
      }
      season++
    }
  }
}

wikiSyncJob(2000, 2024)
