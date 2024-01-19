"use client"
import Link from "next/link"
import Button from "./Button"
import { useState } from "react"
import { useClick, useDismiss, useFloating, useInteractions } from "@floating-ui/react"
import { follow, unfollow } from "@/actions/follow"
import { cn } from "@/utils/tw"

export default function AnimeCard({ anime, q }) {
  const { sort } = q
  const [isOpen, setIsOpen] = useState(false)
  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
  })
  const click = useClick(context)
  const dismiss = useDismiss(context)
  const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss])
  const isFollowed = !!anime.watch_status

  return (
    <div className="flex flex-col">
      <div className="relative">
        <div ref={refs.setPositionReference} />
        <Link href={`/anime/${anime.id}`}>
          {q.debug ? (
            <div className="w-full aspect-square border border-gray-400 flex justify-center items-center">
              <img src="/image-slash.svg" alt="no image" className="w-1/3" />
            </div>
          ) : (
            <img src={anime?.images?.[0]?.lg} className="w-full aspect-square object-cover" />
          )}
        </Link>
        {isOpen && (
          <div
            ref={refs.setFloating}
            style={floatingStyles}
            {...getFloatingProps()}
            className="w-full h-full flex flex-col gap-1 p-1 bg-[rgba(0,0,0,0.5)] text-white"
          >
            <Button
              onClick={() => {
                if (isFollowed) {
                  unfollow(anime.id)
                } else {
                  follow(anime.id)
                }
              }}
            >
              {isFollowed ? "unfollow" : "follow"}
            </Button>
            <Button>rate</Button>
            <Button>status</Button>
          </div>
        )}
      </div>

      <div className="bg-blue-100">
        <div className="text-sm line-clamp-1">{anime.titles?.ja}</div>
        <div className="text-sm line-clamp-1 whitespace-pre-wrap flex items-center justify-between">
          <div>
            {(!sort || sort === "day") && `${anime.time?.jp || "\n"}`}
            {sort === "mal-score" && `${anime?.score_external?.mal || "\n"}`}
            {sort === "anilist-score" && `${anime?.score_external?.anilist || "\n"}`}
          </div>
          <img
            src="/plus.svg"
            className={cn("size-4 rounded-full mr-0.5 bg-gray-400", { "bg-green-400": isFollowed })}
            ref={refs.setReference}
            {...getReferenceProps()}
          />
        </div>
      </div>
    </div>
  )
}
