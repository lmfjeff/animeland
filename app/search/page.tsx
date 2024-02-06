import { search } from "@/actions/media"
import Pagination from "@/components/Pagination"
import Link from "next/link"

export default async function Search({ searchParams }) {
  const p = {
    page: searchParams.page ? parseInt(searchParams.page) : 1,
    q: searchParams.q ? searchParams.q : "",
  }
  const { page, q } = p
  const [animes, count]: any = await search(q, page)

  return (
    <div className="p-1">
      <Pagination q={p} count={count} perPage={20} />
      <div className="flex flex-col divide-y">
        {animes.map(anime => (
          <div key={anime.id} className="py-1 gap-1 flex items-center">
            <Link href={`/anime/${anime.id}`} className="line-clamp-1 grow">
              {anime.titles?.zh || anime.titles?.ja || "??"}
            </Link>
            <div>
              {anime.year}
              {anime.season ? `-${anime.season}` : ``}
            </div>
            <div className="min-w-[80px] text-center">{anime.format}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
