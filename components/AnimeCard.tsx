"use client"
import Link from "next/link"
import Button from "./Button"
import { useEffect, useState } from "react"
import { useClick, useDismiss, useFloating, useInteractions } from "@floating-ui/react"
import { follow, unfollow } from "@/actions/follow"
import { cn } from "@/utils/tw"
import { Modal, ModalContent } from "./Modal"
import { AnimeDetail } from "./AnimeDetail"
import { WATCH_STATUS_COLOR } from "@/constants/media"

export default function AnimeCard({ anime, q }) {
  const [open, setOpen] = useState(false)
  const { sort } = q
  const isFollowed = !!anime.watch_status
  const statusColor = isFollowed ? WATCH_STATUS_COLOR[anime.watch_status] : ""

  return (
    <>
      <div className="flex flex-col cursor-pointer" onClick={() => setOpen(!open)}>
        <>
          {q.debug ? (
            <div className="w-full aspect-square border border-gray-400 flex justify-center items-center">
              <img src="/image-slash.svg" alt="no image" className="w-1/3" />
            </div>
          ) : (
            <img src={anime?.images?.[0]?.lg} className="w-full aspect-square object-cover" />
          )}
        </>
        <div className="border-b border-x border-gray-500">
          <div className="text-sm line-clamp-1">{anime.titles?.ja}</div>
          <div className="text-sm line-clamp-1 whitespace-pre-wrap flex items-center justify-between">
            <div>
              {(!sort || sort === "day") && `${anime.time?.jp || "\n"}`}
              {sort === "mal-score" && `${anime?.score_external?.mal || "\n"}`}
              {sort === "anilist-score" && `${anime?.score_external?.anilist || "\n"}`}
            </div>
            <div className={cn("size-2 rounded-full mr-1")} style={{ background: statusColor || "gray" }} />
          </div>
        </div>
      </div>
      <Modal open={open} onOpenChange={setOpen}>
        <ModalContent className="bg-white h-1/2 flex flex-col">
          <AnimeDetail anime={anime} />
        </ModalContent>
      </Modal>
    </>
  )
}
