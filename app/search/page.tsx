import { search } from "@/actions/media"
import AnimeRow from "@/components/AnimeRow"
import CustomLink from "@/components/CustomLink"
import Pagination from "@/components/Pagination"
import Link from "next/link"

export default async function Search({ searchParams }) {
  const p = {
    page: searchParams.page ? parseInt(searchParams.page) : 1,
    q: searchParams.q ? searchParams.q : "",
  }
  const { page, q } = p
  // todo include relaitons also
  const [animes, count]: any = await search(q, page)

  return (
    <div className="p-1">
      <Pagination q={p} count={count} perPage={20} />
      <div className="flex flex-col divide-y">
        {animes.map(anime => (
          <AnimeRow key={anime.id} anime={anime}>
            <div className="line-clamp-1 grow py-1">{anime.titles?.zh || anime.titles?.ja || "??"}</div>
            <div className="min-w-[60px] text-center">
              {anime.year}
              {anime.season ? `-${anime.season}` : ``}
            </div>
            <div className="min-w-[90px] text-center">{anime.format}</div>
          </AnimeRow>
        ))}
      </div>
    </div>
  )
}
