import Link from "next/link"

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
          <Link href={`/anime/${anime.id}`} key={anime.id} className="border flex flex-col">
            <img src={"anime?.images?.[0]?.lg"} className="aspect-square border-b object-cover" />
            <div className="text-sm line-clamp-1">{anime.titles?.ja}</div>
            {!sort ||
              (sort === "day" && (
                <div className="text-sm line-clamp-1">
                  {anime?.day_of_week?.jp?.slice(0, 3)} {anime.time?.jp}
                </div>
              ))}
            {sort === "mal-score" && <div className="text-sm line-clamp-1">{anime?.score_external?.mal}</div>}
            {sort === "anilist-score" && <div className="text-sm line-clamp-1">{anime?.score_external?.anilist}</div>}
          </Link>
        ))}
      </div>
    </>
  )
}