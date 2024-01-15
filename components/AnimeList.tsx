import Link from "next/link"

const NOT_SHOW_IMG = true

export default function AnimeList({ animes, sort }) {
  if (animes?.[0]?.animes) {
    return (
      <>
        {animes.map(({ day, animes }) => (
          <div key={day}>
            <div className="text-xl">{day}</div>
            <AnimeSubList animes={animes} sort={sort} />
          </div>
        ))}
      </>
    )
  } else {
    return <AnimeSubList animes={animes} sort={sort} />
  }

  //             {anime.external_links
  //               .filter(link => link.site === "Wikipedia")
  //               .map(link => (
  //                 <a key={link.url} href={link.url} className="border px-1" rel="noreferrer" target="_blank">
  //                   {link.url.replace("https://", "").slice(0, 2)} wiki
  //                 </a>
  //               ))}
}

function AnimeSubList({ animes, sort }) {
  return (
    <>
      <div className="grid gap-1 grid-cols-[repeat(auto-fill,minmax(100px,1fr))]">
        {animes.map(anime => (
          <Link href={`/anime/${anime.id}`} key={anime.id} className="border border-gray-300 flex flex-col">
            <img src={NOT_SHOW_IMG ? "" : anime?.images?.[0]?.lg} className="aspect-square border-b object-cover" />
            <div className="bg-blue-100">
              <div className="text-sm line-clamp-1">{anime.titles?.ja}</div>
              <div className="text-sm line-clamp-1 whitespace-pre-wrap">
                {!sort || (sort === "day" && `${anime?.day_of_week?.jp?.slice(0, 3)} ${anime.time?.jp}`)}
                {sort === "mal-score" && `${anime?.score_external?.mal || "\n"}`}
                {sort === "anilist-score" && `${anime?.score_external?.anilist || "\n"}`}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </>
  )
}
