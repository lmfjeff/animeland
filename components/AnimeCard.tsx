"use client"
import { useState } from "react"
import { cn } from "@/utils/tw"
import { Modal, ModalContent } from "./Modal"
import { AnimeDetail } from "./AnimeDetail"
import { WATCH_STATUS_COLOR } from "@/constants/media"

export default function AnimeCard({ anime, q }) {
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const { sort } = q
  const isFollowed = !!anime.watch_status
  const statusColor = isFollowed ? WATCH_STATUS_COLOR[anime.watch_status] : ""

  return (
    <>
      <div
        className="flex flex-col cursor-pointer border border-gray-500 divide-y divide-gray-500"
        onClick={() => setDetailModalOpen(!detailModalOpen)}
      >
        {q.debug ? (
          <div className="w-full aspect-square flex justify-center items-center">
            <img src="/image-slash.svg" alt="no image" className="w-1/3" />
          </div>
        ) : (
          <img src={anime?.images?.[0]?.lg} className="w-full aspect-square object-cover" />
        )}
        <div>
          <div className="text-sm line-clamp-1">{anime.titles?.zh || anime.titles?.ja || "??"}</div>
          <div className="text-xs line-clamp-1 whitespace-pre-wrap flex items-center justify-between">
            <div>
              {(!sort || sort === "day") && `${anime.time?.jp || "\n"}`}
              {sort === "mal-score" && `${anime?.score_external?.mal || "\n"}`}
              {sort === "anilist-score" && `${anime?.score_external?.anilist || "\n"}`}
            </div>
            <div className="flex items-center gap-1">
              <div>{anime.score || " "}</div>
              <div className={cn("size-2 rounded-full mr-1")} style={{ background: statusColor }} />
            </div>
          </div>
        </div>
      </div>
      <Modal open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <ModalContent className="bg-white w-full max-w-[650px] h-1/2 flex flex-col">
          <AnimeDetail anime={anime} />
        </ModalContent>
      </Modal>
    </>
  )
}
