import { SEASON_LIST } from "@/constants/media"
import ExternalLink from "./ExternalLink"
import { FollowButton, RateButton, StatusButton } from "./FollowButton"

export function AnimeDetail({ anime }) {
  const {
    titles,
    synonyms,
    id_external,
    external_links,
    id,
    summary,
    score_external,
    year,
    season,
    trailers,
    episodes,
  } = anime
  const isFollowed = !!anime["watch_status"]
  const ytTrailers = trailers.filter(t => t.site === "youtube")
  const wikiLinks = external_links.filter(link => link.site === "Wikipedia")
  return (
    <>
      <div className="flex flex-col p-2 gap-1 grow overflow-auto">
        <div>{titles.zh}</div>
        <div>{titles.ja}</div>
        <div className="text-sm">
          {year} {SEASON_LIST[season - 1]}
        </div>
        {synonyms?.length > 0 && (
          <div className="flex flex-col border max-h-[50px] shrink-0 overflow-auto">
            {synonyms.map(synonym => (
              <div key={synonym} className="px-2">
                {synonym}
              </div>
            ))}
          </div>
        )}
        <div className="flex gap-1">
          {id_external
            ? Object.entries(id_external).map(([key, value]) => (
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
                  {key} {score_external[key]}
                </ExternalLink>
              ))
            : null}
        </div>
        {wikiLinks.length > 0 && (
          <div className="flex gap-1">
            {wikiLinks.map(link => (
              <ExternalLink key={link.url} href={link.url} className="border px-2">
                {link.url.replace("https://", "").slice(0, 2)} wiki
              </ExternalLink>
            ))}
          </div>
        )}
        {ytTrailers.length > 0 && (
          <div className="flex gap-1">
            {ytTrailers.map((t, index) => (
              <ExternalLink key={t.id} href={`https://www.youtube.com/watch?v=${t.id}`} className="border px-1">
                trailer {index + 1}
              </ExternalLink>
            ))}
          </div>
        )}
        {episodes && <div>episode: {episodes}</div>}
        <div className="border p-2 [&_br]:hidden" dangerouslySetInnerHTML={{ __html: summary?.en || "" }}></div>
      </div>
      <div className="bg-blue-200 sticky bottom-0 grid grid-cols-3 border-t border-black">
        <FollowButton animeId={id} isFollowed={isFollowed} />
        <RateButton animeId={id} score={anime["score"]} />
        <StatusButton animeId={id} watchStatus={anime["watch_status"]} />
      </div>
    </>
  )
}
