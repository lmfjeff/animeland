import Link from "next/link"

export default function AnimeFilter({ year, season, sort }) {
  return (
    <>
      <div className="flex items-center gap-2 p-1">
        <Link
          href={{
            pathname: "/anime",
            query: {
              year: season === 1 ? year - 1 : year,
              season: season === 1 ? 4 : season - 1,
            },
          }}
          className="border px-1"
        >
          prev
        </Link>
        <div>
          {year}-{season}
        </div>
        <Link
          href={{
            pathname: "/anime",
            query: {
              year: season === 4 ? year + 1 : year,
              season: season === 4 ? 1 : season + 1,
            },
          }}
          className="border px-1"
        >
          next
        </Link>
      </div>
      <div className="flex items-center gap-2 p-1">
        <div>sort: </div>
        {["none", "day", "mal-score", "anilist-score"].map(sort => (
          <Link
            href={{
              pathname: "/anime",
              query: {
                year,
                season,
                sort: sort,
              },
            }}
            className="border px-1"
          >
            {sort}
          </Link>
        ))}
      </div>
    </>
  )
}