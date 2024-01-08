import { weekdayOption } from "@/constants/media"
import dayjs from "dayjs"
import Link from "next/link"

// todo change to server component
export default function AnimeList({ animes }) {
  // todo any
  const sortedAnimes = Object.entries(animes).sort((a, b) => {
    const today = dayjs().day()
    const weekdayOrder = [...weekdayOption.slice(today + 1), ...weekdayOption.slice(0, today)]
    return weekdayOrder.indexOf(a[0]) - weekdayOrder.indexOf(b[0])
  }) as any

  return (
    <>
      {sortedAnimes.map(([day, animes]) => (
        <div key={day}>
          <div className="text-xl">{day}</div>
          <div className="grid gap-1 grid-cols-[repeat(auto-fill,minmax(100px,1fr))]">
            {animes.map(anime => (
              <Link href={`/anime/${anime.id}`} key={anime.id} className="border flex flex-col">
                <img src={"anime?.images?.[0]?.lg"} className="aspect-square border-b object-cover" />
                <div className="text-sm line-clamp-1">{anime.titles.ja}</div>
                <div className="text-sm line-clamp-1">
                  {anime?.day_of_week?.jp?.slice(0, 3)} {anime.time?.jp}
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </>
  )
  //             {anime.external_links
  //               .filter(link => link.site === "Wikipedia")
  //               .map(link => (
  //                 <a key={link.url} href={link.url} className="border px-1" rel="noreferrer" target="_blank">
  //                   {link.url.replace("https://", "").slice(0, 2)} wiki
  //                 </a>
  //               ))}
}
