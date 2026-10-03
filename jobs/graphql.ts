const anilistMediaFields = `
  id
  idMal
  title {
    romaji(stylised: true)
    english(stylised: true)
    native(stylised: true)
    userPreferred
  }
  type
  format
  status(version: 1)
  description(asHtml: true)
  startDate {
    year
    month
    day
  }
  endDate {
    year
    month
    day
  }
  season
  seasonYear
  seasonInt
  episodes
  duration
  chapters
  volumes
  countryOfOrigin
  isLicensed
  source(version: 1)
  hashtag
  trailer {
    id
    site
    thumbnail
  }
  nextAiringEpisode {
    airingAt
    timeUntilAiring
    episode
  }
  airingSchedule(perPage: 1) {
    nodes {
      airingAt
      episode
    }
  }
  updatedAt
  coverImage {
    extraLarge
    large
    medium
    color
  }
  bannerImage
  genres
  synonyms
  averageScore
  meanScore
  popularity
  isLocked
  trending
  favourites
  tags {
    id
    name
    description
    category
    rank
    isGeneralSpoiler
    isMediaSpoiler
    isAdult
    userId
  }
  relations {
    edges {
      relationType(version: 1)
    }
    nodes {
      id
      title {
        romaji(stylised: true)
        english(stylised: true)
        native(stylised: true)
        userPreferred
      }
    }
  }
  studios(sort: [ID], isMain: true) {
    nodes {
      id
      name
      isAnimationStudio
      siteUrl
      isFavourite
      favourites
    }
  }
  isAdult
  externalLinks {
    id
    url
    site
    siteId
    type
    language
    color
    icon
    notes
    isDisabled
  }
  siteUrl
`

export const anilistGetAnimeByPageQuery = `query ($page: Int, $perPage: Int) {
  Page(perPage: $perPage, page: $page) {
    pageInfo {
      total
      perPage
      currentPage
      lastPage
      hasNextPage
    }
    media {
      ${anilistMediaFields}
    }
  }
}`

export const anilistGetSeasonalAnimeQuery = `query ($page: Int, $perPage: Int, $season: MediaSeason, $seasonYear: Int) {
  Page(perPage: $perPage, page: $page) {
    pageInfo {
      total
      perPage
      currentPage
      lastPage
      hasNextPage
    }
    media(season: $season, seasonYear: $seasonYear, type: ANIME, sort: [POPULARITY_DESC]) {
      ${anilistMediaFields}
    }
  }
}`

export const anilistGetAnimeByIdsQuery = `query ($ids: [Int], $page: Int, $perPage: Int) {
  Page(perPage: $perPage, page: $page) {
    pageInfo {
      total
      perPage
      currentPage
      lastPage
      hasNextPage
    }
    media(id_in: $ids, type: ANIME) {
      ${anilistMediaFields}
    }
  }
}`

