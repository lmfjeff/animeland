import prisma from "@/lib/prisma"
import { Prisma } from "@prisma/client"
import AnimeList from "@/components/AnimeList"
import { createAnimeGroupByDay, gethkNow, sortByTime, transformAnimeDay } from "@/utils/anime-transform"
import { auth } from "@/lib/auth"
import SeasonPagination from "@/components/SeasonPagination"
import { pastSeasons } from "@/utils/date"
import Filter from "@/components/Filter"
import { FOLLOW_OPTIONS, SORT_OPTIONS } from "@/constants/media"

export default async function Animes({ params, searchParams }) {
  const nowDayjs = gethkNow()
  const nowYear = nowDayjs.year()
  const nowSeason = Math.floor(nowDayjs.month() / 3) + 1
  const q = {
    ...searchParams,
    year: searchParams.year ? parseInt(searchParams.year) : nowYear,
    season: searchParams.season ? parseInt(searchParams.season) : nowSeason,
  }
  const { year, season, sort, follow } = q

  // todo get session from rootlayout
  const session = await auth()
  async function fetchAnimes() {
    const mediaWhere: Prisma.MediaWhereInput = {
      OR: [
        {
          season: season,
          year: year,
        },
        ...(year === nowYear && season === nowSeason
          ? [
              {
                status: "RELEASING",
                OR: pastSeasons(year, season, 3),
              },
            ]
          : []),
      ],
      day_of_week: {
        not: Prisma.DbNull,
      },
      time: {
        not: Prisma.DbNull,
      },
    }
    let animes = await prisma.media.findMany({
      where: mediaWhere,
      include: { relations: true },
    })
    if (session) {
      const follows = await prisma.followList.findMany({
        where: {
          media: mediaWhere,
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
    }
    if (follow === "show") {
      animes = animes.filter(anime => !!anime["watch_status"])
    } else if (follow === "hide") {
      animes = animes.filter(anime => !anime["watch_status"])
    }
    // transform time/dayofweek (jp to hk) & 30hr, sort time, group by day of week
    animes = animes.map(transformAnimeDay).sort(sortByTime)
    if (!sort) {
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
      {/* <div>{gethkNow().format("MM-DD HH:mm:ss")}</div> */}
      <div className="flex items-center flex-wrap gap-y-1 gap-x-3 mb-2">
        <SeasonPagination q={q} />
        {session && <Filter q={q} name="follow" options={FOLLOW_OPTIONS} />}
        <Filter q={q} name="sort" options={SORT_OPTIONS} />
      </div>
      <AnimeList animes={animes} q={q} />
    </div>
  )
}
