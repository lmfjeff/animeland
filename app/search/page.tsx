import { search } from "@/actions/media"
import AnimeRow from "@/components/AnimeRow"
import CustomLink from "@/components/CustomLink"
import Pagination from "@/components/Pagination"
import { auth } from "@/lib/auth"
import Link from "next/link"
import prisma from "@/lib/prisma"

export default async function Search({ searchParams }) {
  const p = {
    page: searchParams.page ? parseInt(searchParams.page) : 1,
    q: searchParams.q ? searchParams.q : "",
  }
  const { page, q } = p
  const session = await auth()
  const [animes, count]: any = await search(q, page)
  if (session) {
    const follows = await prisma.followList.findMany({
      where: {
        media_id: { in: animes.map(anime => anime.id) },
        user_id: session?.user?.id,
      },
    })
    animes.forEach(anime => {
      const found = follows.find(follow => follow.media_id === anime.id)
      if (found) {
        anime["watch_status"] = found.watch_status
        anime["score"] = found.score
      }
    })
  }

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
