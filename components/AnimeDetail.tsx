import ExternalLink from "./ExternalLink"
import { FollowButton, RateButton, StatusButton } from "./FollowButton"

export function AnimeDetail({ anime }) {
  const isFollowed = !!anime["watch_status"]
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
      <div className="bg-blue-200 sticky bottom-0 grid grid-cols-3 border-t border-black">
        <FollowButton animeId={anime.id} isFollowed={isFollowed} />
        <RateButton animeId={anime.id} score={anime["score"]} />
        <StatusButton animeId={anime.id} watchStatus={anime["watch_status"]} />
      </div>
    </>
  )
}
