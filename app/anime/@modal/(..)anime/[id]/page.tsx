import { AnimeDetail } from "@/app/anime/[id]/page"
import prisma from "@/lib/prisma"
import { notFound } from "next/navigation"

export default async function AnimeModal({ params }) {
  const { id } = params
  return (
    <div className="fixed z-fixed top-0 left-0 right-0 bottom-0 bg-[rgba(0,0,0,0.5)] flex items-center">
      <div className="h-1/3 w-full bg-white overflow-auto">
        <AnimeDetail id={id} />
      </div>
    </div>
  )
}
