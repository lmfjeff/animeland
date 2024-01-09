import prisma from "@/lib/prisma"
import { Prisma } from "@prisma/client"
import AnimeFilter from "@/components/AnimeFilter"
import { groupBy } from "ramda"
import AnimeList from "@/components/AnimeList"
import { transformAnimeDay } from "@/utils/anime-transform"
import dayjs from "dayjs"
import { weekdayOption } from "@/constants/media"

export default async function Animes({ params, searchParams }) {
  let { year, season, sort } = searchParams
  year = year ? parseInt(year) : new Date().getFullYear()
  season = season ? parseInt(season) : Math.floor(new Date().getMonth() / 3) + 1

  async function test() {
    return await prisma.user.findFirst()
  }
  const firstUser = await test()
  async function fetchAnimes() {
    let animes = await prisma.media.findMany({
      where: {
        season: season,
        year: year,
        day_of_week: {
          not: Prisma.DbNull,
        },
      },
    })
    // transform time/dayofweek (jp to hk) & 30hr
    // sort time
    // group by day of week
    // todo any
    animes = animes.map(transformAnimeDay).sort((a, b) => {
      return a.time?.jp.localeCompare(b.time?.jp)
    })
    if (!sort || sort === "day") {
      const today = dayjs().day()
      const weekdayOrder = [...weekdayOption.slice(today), ...weekdayOption.slice(0, today)]
      const animeGroup: any[] = weekdayOrder.map(day => ({ day, animes: [] }))
      animes.forEach(anime => {
        const day = anime?.day_of_week?.jp
        const index = weekdayOrder.indexOf(day)
        animeGroup[index].animes.push(anime)
      })
      return animeGroup
    }
    return animes
  }
  const animes = await fetchAnimes()

  return (
    <div>
      <div className="">date: {new Date().toUTCString()}</div>
      <AnimeFilter year={year} season={season} />
      <AnimeList animes={animes} />
    </div>
  )
}
