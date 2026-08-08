import prisma from "@/lib/prisma"
import { Prisma } from "@prisma/client"
import * as cheerio from "cheerio"
import { range } from "ramda"
import { tabletojson } from "tabletojson"
import unicode from "unicode-regex"
import { newMediaToUpdateInput } from "./dto"
import { calculateStringSimilarity } from "./utils"
import { pastSeasons } from "@/utils/date"

const regex = unicode({ Script: ["Hiragana", "Katakana", "Han", "Latin"] }).toRegExp("g")
const wikiBaseUrl = "https://zh.wikipedia.org/zh-hk"

export async function wikiSyncJob() {
  const startYear = 2000
  const endYear = new Date().getFullYear()
  const yearList = range(startYear, endYear + 1)
  let totalMatchedCount = 0

  console.log(`[Wikipedia Sync] Starting Wikipedia scraping from ${startYear} to ${endYear}...`)

  for (const year of yearList) {
    try {
      console.log(`[Wikipedia Sync] Processing year ${year}...`)
      const url = `${wikiBaseUrl}/${year}%E5%B9%B4%E6%97%A5%E6%9C%AC%E5%8B%95%E7%95%AB%E5%88%97%E8%A1%A8`
      const resp = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 Animeland/1.0 (WikipediaSyncBot)",
        },
      })
      if (!resp.ok) continue

      const html = await resp.text()
      const $ = cheerio.load(html)
      $(".noprint").remove()

      const allRowList: any[] = []
      const tables = $("table.wikitable").toArray()
      tables.forEach((tableEl, i) => {
        const tableHtml = "<table>" + $(tableEl).html() + "</table>"
        const jsonArray = tabletojson.convert(tableHtml, {
          stripHtmlFromCells: false,
        })
        if (jsonArray[0] && jsonArray[0][0]) {
          const zhTitleKey = Object.keys(jsonArray[0][0])[1]
          const jaTitleKey = Object.keys(jsonArray[0][0])[2]
          if (zhTitleKey && jaTitleKey) {
            allRowList.push(
              ...jsonArray[0]
                .filter(row => row[zhTitleKey] && row[jaTitleKey])
                .map(row => ({ year, season: (i % 4) + 1, zh: row[zhTitleKey], ja: row[jaTitleKey] }))
            )
          }
        }
      })

      const rawList = allRowList
        .map(row => {
          const zhDom = cheerio.load(row.zh)
          const jaDom = cheerio.load(row.ja)
          zhDom(".reference").remove()
          jaDom(".reference").remove()
          const jaText = jaDom.text().match(regex)?.join("").toLowerCase()
          const zhText = zhDom
            .text()
            .replace(/\[\d+\]/g, "")
            .trim()
          const relativeLink = zhDom("a").attr("href")
          const link = relativeLink ? wikiBaseUrl + relativeLink.replace("/wiki", "") : null

          return { ...row, jaText, zhText, link }
        })
        .filter(row => row.jaText && row.zhText)

      // Query database records for the year
      const dbMedia = await prisma.media.findMany({
        where: {
          year,
          day_of_week: { not: Prisma.DbNull },
        },
      })

      const oldList = dbMedia
        .filter(media => (media.titles as any)?.ja || (media.titles as any)?.en_jp)
        .map(media => ({
          ...media,
          jaText: (media.titles as any)?.ja?.match(regex)?.join("").toLowerCase(),
          enText: (media.titles as any)?.en_jp?.match(regex)?.join("").toLowerCase(),
        }))
        .filter(media => media.jaText || media.enText)

      let yearMatches = 0
      for (const old of oldList) {
        // Find best match using exact match or high string similarity (>= 0.85)
        let bestMatch: (typeof rawList)[0] | null = null
        let bestSimilarity = 0

        for (const item of rawList) {
          if (old.jaText && item.jaText === old.jaText) {
            bestMatch = item
            bestSimilarity = 1.0
            break
          }
          if (old.enText && item.jaText === old.enText) {
            bestMatch = item
            bestSimilarity = 1.0
            break
          }
          if (old.jaText) {
            const sim = calculateStringSimilarity(item.jaText, old.jaText)
            if (sim > bestSimilarity && sim >= 0.85) {
              bestSimilarity = sim
              bestMatch = item
            }
          }
        }

        if (bestMatch) {
          const updateInput = newMediaToUpdateInput(
            {
              titles: { zh: bestMatch.zhText },
              external_links: bestMatch.link ? [{ url: bestMatch.link, site: "Wikipedia" }] : [],
            },
            old,
            true
          )

          if (updateInput) {
            await prisma.media.update({
              where: { id: old.id },
              data: updateInput,
            })
            totalMatchedCount++
            yearMatches++
          }
        }
      }

      console.log(`[Wikipedia Sync] Year ${year}: ${yearMatches} anime matched & updated.`)

      // Checkpoint progress
      await prisma.syncCheckpoint.upsert({
        where: { job_name: "wiki" },
        create: { job_name: "wiki", last_page: year, status: "running" },
        update: { last_page: year, status: "running" },
      })
    } catch (err) {
      console.error(`[Wikipedia Sync Error] Year ${year} failed:`, err)
    }
  }

  console.log(`[Wikipedia Sync] Finished. Total matched and updated: ${totalMatchedCount}`)
  await prisma.syncCheckpoint.upsert({
    where: { job_name: "wiki" },
    create: { job_name: "wiki", last_page: endYear, status: "completed" },
    update: { last_page: endYear, status: "completed" },
  })
}

// wikiSyncJob()
