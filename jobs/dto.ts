import { Media } from "@prisma/client"
import { equals, identity, mergeDeepRight, pick, pickBy } from "ramda"
import slugify from "slugify"
import { anilistDateToString } from "@/jobs/utils"
import { createMediaInputType, updateMediaInputType } from "@/types/prisma"
import { seasonIntMap } from "@/constants/media"

function anilistObjToMedia(rawmedia) {
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
  let native = {}
  if (countryOfOrigin) {
    if (countryOfOrigin === "JP") {
      native["en_jp"] = title.romaji
      native["ja"] = title.native
    }
  }
  const createinput: createMediaInputType = {
    titles: { en: title.english, ...native },
    country: countryOfOrigin,
    end_date: { jp: anilistDateToString(endDate) },
    episodes,
    format,
    id_external: { anilist: id, mal: idMal },
    images: [{ md: coverImage.medium, lg: coverImage.large, xl: coverImage.extraLarge }],
    nsfw: isAdult,
    score_external: { anilist: averageScore },
    season: seasonIntMap[season],
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
    slug: native["en_jp"] ? native["en_jp"] : title.english ? slugify(title.english) : undefined,
    genres: {
      connectOrCreate: genres.map(g => ({
        where: { key: g },
        create: { key: g, name: { en: g } },
      })),
    },
  }
  return pickBy(identity, createinput)
}

export function anilistCreateAnimeDto(rawmedia) {
  return anilistObjToMedia(rawmedia) as createMediaInputType
}

// TODO WIP handle json[] merge instead of replace
export function anilistUpdateAnimeDto(rawmedia, olddata) {
  return {}
  const newmedia = anilistObjToMedia(rawmedia) as Partial<Media>
  // const updateinput: updateMediaInputType = {}
  // if (newmedia.country !== olddata.country) {
  //   updateinput.country = newmedia.country
  // }
  const updateinput = mergeDeepRight(pick(Object.keys(newmedia), olddata), newmedia)
  return updateinput
}

function malObjToMedia(rawmedia) {
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
  } = rawmedia.node

  const updateinput: updateMediaInputType = {
    day_of_week: broadcast?.day_of_the_week ? { jp: broadcast?.day_of_the_week } : undefined,
    time: broadcast?.start_time ? { jp: broadcast?.start_time } : undefined,
    score_external: mean ? { mal: mean } : undefined,
  }
  return pickBy(identity, updateinput)
}

export function malUpdateAnimeDto(rawmedia, olddata) {
  const newmedia = malObjToMedia(rawmedia) as Partial<Media>
  const old = pick(Object.keys(newmedia), olddata)
  const updateinput = mergeDeepRight(old, newmedia)
  if (equals(updateinput, old)) {
    return {}
  }
  return updateinput
}

function jikanObjToMedia(rawMedia) {
  const { mal_id, score, broadcast } = rawMedia
  const time = broadcast?.time
  const day = broadcast?.day ? `${broadcast?.day}` : undefined
  const updateinput: updateMediaInputType = {
    day_of_week: day ? { jp: day.toLowerCase().slice(0, -1) } : undefined,
    time: broadcast?.time && broadcast?.timezone === "Asia/Tokyo" ? { jp: time } : undefined,
    score_external: score ? { mal: score } : undefined,
  }
  return pickBy(identity, updateinput)
}

export function jikanUpdateAnimeDto(rawmedia, olddata) {
  const newmedia = jikanObjToMedia(rawmedia) as Partial<Media>
  const old = pick(Object.keys(newmedia), olddata)
  const updateinput = mergeDeepRight(old, newmedia)
  if (equals(updateinput, old)) {
    return {}
  }
  return updateinput
}
