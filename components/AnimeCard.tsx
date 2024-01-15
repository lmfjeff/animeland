"use client"
import Link from "next/link"
import Button from "./Button"
import { useState } from "react"
import { useClick, useDismiss, useFloating, useInteractions } from "@floating-ui/react"
import { follow } from "@/actions/follow"

const NOT_SHOW_IMG = 1

export default function AnimeCard({ anime, sort }) {
  const [isOpen, setIsOpen] = useState(false)
  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
  })
  const click = useClick(context)
  const dismiss = useDismiss(context)
  const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss])

  return (
    <div className="flex flex-col">
      <div className="relative">
        <div ref={refs.setPositionReference} />
        <Link href={`/anime/${anime.id}`}>
          {NOT_SHOW_IMG ? (
            <div className="w-full aspect-square border border-gray-400"></div>
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
                follow(anime.id)
              }}
            >
              follow
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
            src="plus.svg"
            className="size-4 bg-gray-400 rounded-full mr-0.5"
            ref={refs.setReference}
            {...getReferenceProps()}
          />
        </div>
      </div>
    </div>
  )
}
