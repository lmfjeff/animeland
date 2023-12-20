export const anilistGetAnimeByPageQuery = `query ($page: Int, $perPage: Int) {
  Page(perPage: $perPage, page: $page) {
    pageInfo {
      total
      perPage
      currentPage
      lastPage
      hasNextPage
    }
    media(type: ANIME) {
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
    }
  }
}`
