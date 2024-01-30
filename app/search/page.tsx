import { search } from "@/actions/media"
import Pagination from "@/components/Pagination"
import Link from "next/link"

export default async function Search({ searchParams }) {
  const p = {
    page: searchParams.page ? parseInt(searchParams.page) : 1,
    q: searchParams.q ? searchParams.q : "",
  }
  const { page, q } = p
  const animes = await search(q, page)
  return (
    <div className="p-1">
      <Pagination q={p} count={1000} perPage={20} />
      <div className="flex flex-col divide-y">
        {animes.map(anime => (
          <Link href={`/anime/${anime.id}`} key={anime.id} className="line-clamp-1 py-1">
            {anime.titles?.ja}
          </Link>
        ))}
      </div>
    </div>
  )
}
