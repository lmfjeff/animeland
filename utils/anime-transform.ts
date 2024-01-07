import { weekdayOption } from "@/constants/media"
import dayjs from "dayjs"
import customParseFormat from "dayjs/plugin/customParseFormat"
import utc from "dayjs/plugin/utc"
import timezone from "dayjs/plugin/timezone"
dayjs.extend(customParseFormat)
dayjs.extend(utc)
dayjs.extend(timezone)

// todo transform start end date
export function transformAnimeDay(anime) {
  const jpTime = anime?.time?.jp
  const jpDay = anime?.day_of_week?.jp
  if (!jpTime || !jpDay) return anime

  const dayNum = weekdayOption.indexOf(jpDay)
  const dayjsJP = dayjs.tz(jpTime, "HH:mm", "Japan")?.day(dayNum)
  const dayjsHK = dayjsJP?.tz("Asia/Hong_Kong")
  if (!dayjsHK) return anime

  if (dayjsHK.hour() <= 5) {
    anime.time.jp = `${dayjsHK.hour() + 24}:${dayjsHK.format("mm")}`
    anime.day_of_week.jp = weekdayOption[dayjsHK.subtract(1, "day").day()]
  } else {
    anime.time.jp = dayjsHK.format("HH:mm")
    anime.day_of_week.jp = weekdayOption[dayjsHK.day()]
  }

  return anime
}
