import prisma from "@/lib/prisma"
import { Prisma } from "@prisma/client"
import * as cheerio from "cheerio"
import { range } from "ramda"
import fs from "fs/promises"
import { tabletojson } from "tabletojson"
import unicode from "unicode-regex"

const regex = unicode({ Script: ["Hiragana", "Katakana", "Han", "Latin"] }).toRegExp("g")

export async function testJob() {
  const yearList = range(2000, 2001)
  for (const year of yearList) {
    // const url = `https://zh.wikipedia.org/wiki/${year}%E5%B9%B4%E6%97%A5%E6%9C%AC%E5%8B%95%E7%95%AB%E5%88%97%E8%A1%A8`
    // const resp = await fetch(url)
    // const html = await resp.text()
    // await fs.writeFile(`tmp/wiki-${year}.html`, html)

    const html = await fs.readFile(`tmp/wiki-${year}.html`, "utf8")
    const $ = cheerio.load(html)
    $(".noprint").remove()
    // const json = tabletojson.convert($.html())
    console.log(year)

    const seasonList: any[] = []
    $('span[id*="月"]').each((i, el) => {
      const jsonArray = tabletojson.convert("<table>" + $(el).parent().next().html()! + "</table>")
      if (jsonArray[0]) seasonList.push(jsonArray[0])
    })

    let season = 1
    for (const rowList of seasonList) {
      const zhTitleKey = Object.keys(rowList[0])[1]
      const jaTitleKey = Object.keys(rowList[0])[2]
      console.log("🚀 ~ testJob ~ season:", season)

      console.log(
        "🚀 ~ testJob ~ rowList:",
        rowList
          .filter(row => row[jaTitleKey])
          .map(row => row[jaTitleKey].match(regex)?.join(""))
          .join("\n")
      )

      const dbMedia = await prisma.media.findMany({
        where: {
          year,
          season,
          nsfw: false,
          // day_of_week: {
          //   not: Prisma.DbNull,
          // },
          // time: {
          //   not: Prisma.DbNull,
          // },
        },
      })
      console.log(
        "🚀 ~ testJob ~ dbMedia:",
        dbMedia
          .filter(media => media.titles?.ja)
          .map(media => media.titles?.ja.match(regex)?.join(""))
          .join("\n")
      )
      season++

      for (const row of rowList) {
        const zh = row[zhTitleKey]
        const ja = row[jaTitleKey]
      }
    }
  }
}

testJob()
