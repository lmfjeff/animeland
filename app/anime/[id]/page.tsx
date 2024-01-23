import { AnimeDetail } from "@/components/AnimeDetail"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { notFound } from "next/navigation"

export default async function Anime({ params }) {
  const { id } = params

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
  return <AnimeDetail anime={anime} />
}
