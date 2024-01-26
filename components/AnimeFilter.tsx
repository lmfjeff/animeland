"use client"
import Filter from "./Filter"
import { FOLLOW_OPTIONS, SORT_OPTIONS } from "@/constants/media"
import { useState } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "./Popover"

export default function AnimeFilter({ q }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger onClick={() => setOpen(v => !v)}>
          <img src="menu.svg" className="size-8" />
        </PopoverTrigger>
        <PopoverContent className="w-[90%] max-w-[350px] bg-white border border-black shadow-lg flex flex-col gap-1 p-2">
          <Filter q={q} name="follow" options={FOLLOW_OPTIONS} />
          <Filter q={q} name="sort" options={SORT_OPTIONS} />
        </PopoverContent>
      </Popover>
    </>
  )
}
