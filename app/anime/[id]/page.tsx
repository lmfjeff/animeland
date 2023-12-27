import prisma from "@/lib/prisma"

export default async function Anime({ params, searchParams }) {
  const { id } = params
  async function fetchAnime() {
    return await prisma.media.findUnique({
      where: {
        id: parseInt(id),
      },
    })
  }
  const anime = await fetchAnime()
  return (
    <div className="flex flex-col p-2 gap-1">
      <div>{anime?.titles.zh}</div>
      <div>{anime?.titles.ja}</div>
      <div className="flex gap-1 border divide-x">
        {anime?.synonyms.map(synonym => (
          <div key={synonym} className="px-2">
            {synonym}
          </div>
        ))}
      </div>
      <div className="flex gap-1">
        {anime?.id_external
          ? Object.entries(anime?.id_external).map(([key, value]) => (
              <a
                key={key}
                className="px-2 border"
                rel="noreferrer"
                target="_blank"
                href={
                  key === "anilist"
                    ? "https://anilist.co/anime/" + value
                    : key === "mal"
                      ? "https://myanimelist.net/anime/" + value
                      : "/"
                }
              >
                {key}
              </a>
            ))
          : null}
      </div>
      <div className="flex gap-1">
        {anime?.external_links
          .filter(link => link.site === "Wikipedia")
          .map(link => (
            <a key={link.url} href={link.url} className="border px-1" rel="noreferrer" target="_blank">
              {link.url.replace("https://", "").slice(0, 2)} wiki
            </a>
          ))}
      </div>
      <div>{anime?.summary?.en}</div>
    </div>
  )
}
