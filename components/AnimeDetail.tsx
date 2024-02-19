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
    day_of_week,
    time,
    start_date,
    end_date,
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
          {year} {SEASON_LIST[season - 1]} | {day_of_week?.jp} {time?.jp}
        </div>
        <div className="text-sm">
          {start_date?.jp} - {end_date?.jp}
        </div>
        <div className="flex gap-1 items-center flex-wrap">
          {Object.entries(id_external).map(([key, value]) => (
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
          ))}
          {wikiLinks.map(link => (
            <ExternalLink key={link.url} href={link.url} className="border px-2">
              {link.url.replace("https://", "").slice(0, 2)} wiki
            </ExternalLink>
          ))}
          {ytTrailers.map((t, index) => (
            <ExternalLink key={t.id} href={`https://www.youtube.com/watch?v=${t.id}`} className="border px-1">
              trailer {index + 1}
            </ExternalLink>
          ))}
        </div>
        {episodes && <div>episode: {episodes}</div>}
        <div className="flex items-center gap-1 flex-wrap">
          {anime.relations?.map(r => (
            <a key={r.relation_source_id} href={`/anime/${r.relation_source_id}`} className="border">
              {r.relation_type}
            </a>
          ))}
        </div>
        <div className="border p-2 [&_br]:hidden" dangerouslySetInnerHTML={{ __html: summary?.en || "" }}></div>
        <div>Other name:</div>
        <div className="text-sm">{titles.en}</div>
        <div className="text-sm">{titles.en_jp}</div>
        {synonyms?.length > 0 && (
          <div className="border max-h-[100px] shrink-0 overflow-auto text-sm">
            {synonyms.map(synonym => (
              <div key={synonym} className="">
                {synonym}
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="bg-blue-200 sticky bottom-0 grid grid-cols-3 border-t border-black">
        <FollowButton animeId={id} isFollowed={isFollowed} />
        <RateButton animeId={id} score={anime["score"]} />
        <StatusButton animeId={id} watchStatus={anime["watch_status"]} />
      </div>
    </>
  )
}
