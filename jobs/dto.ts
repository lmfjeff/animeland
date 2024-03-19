// import { Media } from "@prisma/client"
import { concat, equals, identity, mergeDeepRight, mergeDeepWith, pick, pickBy, uniqWith } from "ramda"
import slugify from "slugify"
import { anilistDateToString } from "@/jobs/utils"
import { createMediaInputType, updateMediaInputType } from "@/types/prisma"
import { SEASON_LIST } from "@/constants/media"

export function newMediaToUpdateInput(newMedia, oldMedia, isReplace = false) {
  // todo deal with genres for newMedia
  const keys = Object.keys(newMedia)
  const merged = mergeDeepWith(
    (a, b) => {
      if (Array.isArray(a) && Array.isArray(b)) {
        return uniqWith((x, y) => {
          return equals(x, y)
        })(concat(b, a))
      }
      if (isReplace) {
        return a
      }
      return b
    },
    pick(keys, oldMedia),
    pick(keys, newMedia)
  )
  const diffKeys = keys.filter(key => !equals(merged[key], oldMedia[key]))
  if (diffKeys.length < 1) return null

  const input = pick(diffKeys, merged)
  return input
}

export function anilistObjToMediaDTO(rawmedia) {
  const {
    title,
    countryOfOrigin,
    endDate,
    episodes,
    format,
    id,
    idMal,
    coverImage,
    externalLinks,
    isAdult,
    averageScore,
    season,
    source,
    startDate,
    status,
    studios,
    description,
    synonyms,
    type,
    seasonYear,
    genres,
    trailer,
  } = rawmedia

  const toBeSlug = countryOfOrigin === "JP" ? title.romaji ?? title.english : title.english
  const jaTitle = countryOfOrigin === "JP" ? { en_jp: title.romaji, ja: title.native } : {}
  const seasonIndex = SEASON_LIST.indexOf(season?.toLowerCase())
  const seasonNum = seasonIndex > 0 ? seasonIndex + 1 : undefined

  const input: createMediaInputType | updateMediaInputType = {
    titles: { en: title.english, ...jaTitle },
    country: countryOfOrigin,
    end_date: { jp: anilistDateToString(endDate) },
    episodes,
    format,
    id_external: { anilist: id, mal: idMal },
    images: [{ md: coverImage.medium, lg: coverImage.large, xl: coverImage.extraLarge }],
    nsfw: isAdult,
    score_external: { anilist: averageScore },
    season: seasonNum,
    source,
    start_date: { jp: anilistDateToString(startDate) },
    status,
    studios: studios.nodes.map(v => v.name),
    summary: { en: description },
    synonyms,
    type,
    year: seasonYear,
    external_links: externalLinks.map(v => ({ url: v.url, site: v.site })),
    trailers: trailer ? [{ id: trailer.id, site: trailer.site }] : undefined,
    slug: toBeSlug ? slugify(toBeSlug, { lower: true }) : undefined,
    // todo disconnect genres if no longer exist?
    genres: {
      connectOrCreate: genres.map(g => ({
        where: { key: g },
        create: { key: g, name: { en: g } },
      })),
    },
  }
  const cleanedInput = pickBy(identity, input)
  return cleanedInput
}

export function malObjToMediaDTO(rawmedia) {
  const {
    alternative_titles,
    start_date,
    synopsis,
    mean,
    status,
    genres,
    num_episodes,
    start_season,
    broadcast,
    studio,
  } = rawmedia

  const input: createMediaInputType | updateMediaInputType = {
    day_of_week: broadcast?.day_of_the_week ? { jp: broadcast?.day_of_the_week } : undefined,
    time: broadcast?.start_time ? { jp: broadcast?.start_time } : undefined,
    score_external: mean ? { mal: mean } : undefined,
  }
  const cleanedInput = pickBy(identity, input)
  return cleanedInput
}

export function jikanObjToMediaDTO(rawMedia) {
  const { mal_id, score, broadcast } = rawMedia
  const time = broadcast?.time
  const day = broadcast?.day ? `${broadcast?.day}` : undefined
  const input: createMediaInputType | updateMediaInputType = {
    day_of_week: day ? { jp: day.toLowerCase().slice(0, -1) } : undefined,
    time: broadcast?.time && broadcast?.timezone === "Asia/Tokyo" ? { jp: time } : undefined,
    score_external: score ? { mal: score } : undefined,
  }
  const cleanedInput = pickBy(identity, input)
  return cleanedInput
}
