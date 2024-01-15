import Link from "next/link"
import Button from "./Button"
import { useState } from "react"

const NOT_SHOW_IMG = 1

export default function AnimeCard({ anime, sort }) {
  return (
    <div className="border border-gray-300 flex flex-col">
      <div className="border-b relative">
        <Link href={`/anime/${anime.id}`}>
          <img src={NOT_SHOW_IMG ? "" : anime?.images?.[0]?.lg} className="aspect-square object-cover" />
        </Link>
        <div className="absolute top-0 left-0 bottom-0 right-0 flex flex-col">
          <Button>follow</Button>
          <Button>rate</Button>
          <Button>status</Button>
        </div>
      </div>

      <div className="bg-blue-100">
        <div className="text-sm line-clamp-1">{anime.titles?.ja}</div>
        <div className="text-sm line-clamp-1 whitespace-pre-wrap flex items-center justify-between">
          <div>
            {(!sort || sort === "day") && `${anime.time?.jp || "\n"}`}
            {sort === "mal-score" && `${anime?.score_external?.mal || "\n"}`}
            {sort === "anilist-score" && `${anime?.score_external?.anilist || "\n"}`}
          </div>
          <img src="plus.svg" className="size-4 bg-gray-400 rounded-full mr-0.5" />
        </div>
      </div>
    </div>
  )
}
