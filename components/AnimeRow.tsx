"use client"
import React, { useState } from "react"
import { Modal, ModalContent } from "./Modal"
import { AnimeDetail } from "./AnimeDetail"

export default function AnimeRow({ anime, children }) {
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  return (
    <>
      <div className="flex items-center gap-1 cursor-pointer" onClick={() => setDetailModalOpen(true)}>
        {children}
      </div>
      <Modal open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <ModalContent className="bg-white w-full max-w-[650px] h-1/2 flex flex-col">
          <AnimeDetail anime={anime} />
        </ModalContent>
      </Modal>
    </>
  )
}
