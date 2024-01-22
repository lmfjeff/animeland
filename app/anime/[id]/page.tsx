import ExternalLink from "@/components/ExternalLink"
import RateButton from "@/components/RateButton"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { notFound } from "next/navigation"

export default async function Anime({ params }) {
  const { id } = params
  return <AnimeDetail id={id} />
}

export async function AnimeDetail({ id }) {
  // todo get session from rootlayout
  const session = await auth()
  async function fetchAnime() {
    const anime = await prisma.media.findUnique({
      where: {
        id: parseInt(id),
      },
    })
    const follows = await prisma.followList.findFirst({
      where: {
        media_id: parseInt(id),
        user_id: session?.user?.id,
      },
    })
    if (anime && follows) {
      anime["watch_status"] = follows.watch_status
      anime["score"] = follows.score
    }
    return anime
  }
  const anime = await fetchAnime()
  if (!anime) {
    notFound()
  }
  return (
    <>
      <div className="flex flex-col p-2 gap-1 grow overflow-auto">
        <div>{anime?.titles.zh}</div>
        <div>{anime?.titles.ja}</div>
        {anime?.synonyms?.length > 0 && (
          <div className="flex flex-col border max-h-[50px] shrink-0 overflow-auto">
            {anime?.synonyms.map(synonym => (
              <div key={synonym} className="px-2">
                {synonym}
              </div>
            ))}
          </div>
        )}
        <div className="flex gap-1">
          {anime?.id_external
            ? Object.entries(anime?.id_external).map(([key, value]) => (
                <ExternalLink
                  key={key}
                  className="px-2 border"
                  href={
                    key === "anilist"
                      ? "https://anilist.co/anime/" + value
                      : key === "mal"
                        ? "https://myanimelist.net/anime/" + value
                        : "/"
                  }
                >
                  {key}
                </ExternalLink>
              ))
            : null}
        </div>
        <div className="flex gap-1">
          {anime?.external_links
            .filter(link => link.site === "Wikipedia")
            .map(link => (
              <ExternalLink key={link.url} href={link.url} className="border px-1">
                {link.url.replace("https://", "").slice(0, 2)} wiki
              </ExternalLink>
            ))}
        </div>
        <div className="border p-2 [&_br]:hidden" dangerouslySetInnerHTML={{ __html: anime?.summary?.en || "" }}></div>
      </div>
      <div className="sticky bottom-0 grid grid-cols-3 border-t border-black">
        <button>{!!anime["watch_status"] ? "unfollow" : "follow"}</button>
        <RateButton score={anime["score"]} />
        <button>{anime["watch_status"] || "status"}</button>
      </div>
    </>
  )
}
