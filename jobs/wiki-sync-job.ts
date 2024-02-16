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
    console.log("🚀 ~ wikiSyncJob ~ year:", year)
    const url = `${wikiBaseUrl}/${year}%E5%B9%B4%E6%97%A5%E6%9C%AC%E5%8B%95%E7%95%AB%E5%88%97%E8%A1%A8`
    const resp = await fetch(url)
    const html = await resp.text()
    // await fs.writeFile(`tmp/wiki-${year}.html`, html)
    // const html = await fs.readFile(`tmp/wiki-${year}.html`, "utf8")
    const $ = cheerio.load(html)
    $(".noprint").remove()

    const allRowList: any[] = []
    $('span[id*="月"]').each((i, el) => {
      const jsonArray = tabletojson.convert("<table>" + $(el).parent().next().html()! + "</table>", {
        stripHtmlFromCells: false,
      })
      if (jsonArray[0]) {
        jsonArray[0][0]
        const zhTitleKey = Object.keys(jsonArray[0][0])[1]
        const jaTitleKey = Object.keys(jsonArray[0][0])[2]
        allRowList.push(
          ...jsonArray[0]
            .filter(row => row[zhTitleKey] && row[jaTitleKey])
            .map(row => ({ season: i + 1, zh: row[zhTitleKey], ja: row[jaTitleKey] }))
        )
      }
    })

    const rawList = allRowList
      .map(row => {
        const zhDom = cheerio.load(row.zh)
        const jaDom = cheerio.load(row.ja)
        zhDom(".reference").remove()
        jaDom(".reference").remove()
        const jaText = jaDom.text().match(regex)?.join("").toLowerCase()
        const zhText = zhDom.text()
        const relativeLink = zhDom("a").attr()?.href
        const link = relativeLink ? wikiBaseUrl + relativeLink.replace("/wiki", "") : null

        return { ...row, jaText, zhText, link }
      })
      .filter(row => row.jaText && row.zhText)

    const dbMedia = await prisma.media.findMany({
      where: {
        year,
        // season,
        day_of_week: {
          not: Prisma.DbNull,
        },
        // time: {
        //   not: Prisma.DbNull,
        // },
        // format: {
        //   in: ["TV", "TV_SHORT", "ONA"],
        // },
      },
    })

    const oldList = dbMedia
      .filter(media => media.titles?.ja)
      .map(media => ({
        ...media,
        jaText: media.titles?.ja.match(regex)?.join("").toLowerCase(),
        enText: media.titles?.en_jp.match(regex)?.join("").toLowerCase(),
      }))
      .filter(media => media.jaText)

    for (const old of oldList) {
      const seasonRawList = rawList.filter(media => media.season === old.season)
      const exactMatched = seasonRawList.filter(media => media.jaText === old.jaText)
      const matched = seasonRawList.filter(
        media => media.jaText === old.jaText || media.jaText.includes(old.jaText) || old.jaText.includes(media.jaText)
      )
      const matchedEn = seasonRawList.filter(media => media.jaText && media.jaText === old.enText)
      if (matched.length === 0 && matchedEn.length === 0) {
        console.log(`no match for wiki: ${old.jaText}`)
        continue
      }
      if (exactMatched.length > 1) {
        console.log(`2+ exact match for wiki: ${old.jaText}, db: ${exactMatched[0].zhText}, ${exactMatched[1].zhText}`)
        continue
      }
      const finalMatched = exactMatched?.[0] || matched?.[0] || matchedEn?.[0]
      console.log(`wiki: ${old.jaText} match db: ${finalMatched.jaText}`)
      const updateInput = newMediaToUpdateInput(
        {
          titles: { zh: finalMatched.zhText },
          external_links: finalMatched.link ? [{ url: finalMatched.link, site: "Wikipedia" }] : [],
        },
        old,
        true
      )
      if (!updateInput) continue
      await prisma.media.update({
        where: {
          id: old.id,
        },
        data: updateInput,
      })
    }
  }
}

wikiSyncJob(2000, 2024)
