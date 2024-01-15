import AnimeCard from "./AnimeCard"

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
      <div className="grid gap-1 grid-cols-[repeat(auto-fill,minmax(100px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(150px,1fr))]">
        {animes.map(anime => (
          <AnimeCard key={anime.id} anime={anime} sort={sort} />
        ))}
      </div>
    </>
  )
}
