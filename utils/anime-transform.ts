import { WEEKDAY_LIST } from "@/constants/media"
import dayjs from "dayjs"
import customParseFormat from "dayjs/plugin/customParseFormat"
import utc from "dayjs/plugin/utc"
import timezone from "dayjs/plugin/timezone"
dayjs.extend(customParseFormat)
dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.tz.setDefault("Asia/Hong_Kong")

// todo transform start end date
export function transformAnimeDay(anime) {
  const jpTime = anime?.time?.jp
  const jpDay = anime?.day_of_week?.jp
  if (!jpTime || !jpDay) return anime

  const dayNum = WEEKDAY_LIST.indexOf(jpDay)
  const dayjsJP = dayjs.tz(jpTime, "HH:mm", "Japan")?.day(dayNum)
  const dayjsHK = dayjsJP?.tz()
  if (!dayjsHK) return anime

  if (dayjsHK.hour() <= 5) {
    anime.time.jp = `${dayjsHK.hour() + 24}:${dayjsHK.format("mm")}`
    anime.day_of_week.jp = WEEKDAY_LIST[dayjsHK.subtract(1, "day").day()]
  } else {
    anime.time.jp = dayjsHK.format("HH:mm")
    anime.day_of_week.jp = WEEKDAY_LIST[dayjsHK.day()]
  }

  return anime
}

export function sortByTime(a, b) {
  return a.time?.jp?.localeCompare(b.time?.jp)
}

export function createAnimeGroupByDay(animes) {
  const today = gethkNow().day()
  const weekdayOrder = [...WEEKDAY_LIST.slice(today), ...WEEKDAY_LIST.slice(0, today)]
  const animeGroup: any[] = weekdayOrder.map(day => ({ day, animes: [] }))
  animes.forEach(anime => {
    const day = anime?.day_of_week?.jp
    const index = weekdayOrder.indexOf(day)
    animeGroup[index].animes.push(anime)
  })
  return animeGroup
}

export function gethkNow() {
  return dayjs.tz()
}
