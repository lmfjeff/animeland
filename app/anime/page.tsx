import prisma from "@/lib/prisma"
import { Prisma } from "@prisma/client"
import AnimeFilter from "@/components/AnimeFilter"
import AnimeList from "@/components/AnimeList"
import { createAnimeGroupByDay, gethkNow, sortByTime, transformAnimeDay } from "@/utils/anime-transform"
import { auth } from "@/lib/auth"

export default async function Animes({ params, searchParams }) {
  const nowDayjs = gethkNow()
  const q = {
    ...searchParams,
    year: searchParams.year ? parseInt(searchParams.year) : nowDayjs.year(),
    season: searchParams.season ? parseInt(searchParams.season) : Math.floor(nowDayjs.month() / 3) + 1,
  }
  const { year, season, sort } = q

  // todo get session from rootlayout
  const session = await auth()
  async function fetchAnimes() {
    // todo also include current airing past animes
    let animes = await prisma.media.findMany({
      where: {
        season: season,
        year: year,
        day_of_week: {
          not: Prisma.DbNull,
        },
      },
    })
    const follows = await prisma.followList.findMany({
      where: {
        media: {
          season: season,
          year: year,
          day_of_week: {
            not: Prisma.DbNull,
          },
        },
        user_id: session?.user?.id,
      },
    })
    animes.forEach(anime => {
      const found = follows.find(follow => follow.media_id === anime.id)
      if (found) {
        anime["watch_status"] = found.watch_status
        anime["score"] = found.score
      }
    })
    // transform time/dayofweek (jp to hk) & 30hr, sort time, group by day of week
    animes = animes.map(transformAnimeDay).sort(sortByTime)
    if (!sort || sort === "day") {
      animes = createAnimeGroupByDay(animes)
    }
    if (sort === "mal-score") {
      animes = animes.sort((a, b) => {
        return (b?.score_external?.mal || -1) - (a?.score_external?.mal || -1)
      })
    }
    if (sort === "anilist-score") {
      animes = animes.sort((a, b) => {
        return (b?.score_external?.anilist || -1) - (a?.score_external?.anilist || -1)
      })
    }
    return animes
  }
  const animes = await fetchAnimes()

  return (
    <div className="p-2">
      <div>date: {gethkNow().format("YYYY-MM-DD HH:mm:ss")}</div>
      <AnimeFilter q={q} />
      <AnimeList animes={animes} q={q} />
    </div>
  )
}
