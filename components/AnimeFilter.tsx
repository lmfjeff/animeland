import Link from "next/link"
import HotkeySeason from "./HotkeySeason"
import FollowFilter from "./FollowFilter"
import SortFilter from "./SortFilter"

export default function AnimeFilter({ q }) {
  const { year, season } = q
  return (
    <>
      <HotkeySeason q={q} />
      <div className="flex items-center gap-2 p-1">
        <Link
          href={{
            pathname: "/anime",
            query: {
              ...q,
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
              ...q,
              year: season === 4 ? year + 1 : year,
              season: season === 4 ? 1 : season + 1,
            },
          }}
          className="border px-1"
        >
          next
        </Link>
      </div>
      <div className="flex p-1 gap-2">
        <FollowFilter q={q} />
        <SortFilter q={q} />
      </div>
    </>
  )
}
