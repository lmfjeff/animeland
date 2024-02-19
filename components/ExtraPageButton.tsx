"use client"
import { useState } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "./Popover"
import { cn } from "@/utils/tw"
import CustomLink from "./CustomLink"

export default function ExtraPageButton() {
  const [open, setOpen] = useState(false)
  return (
    <Popover open={open} onOpenChange={setOpen} placement="bottom">
      <PopoverTrigger onClick={() => setOpen(v => !v)} className="text-center">
        <img src="/menu.svg" className="size-8 min-w-8" />
      </PopoverTrigger>
      <PopoverContent
        className={cn(
          "bg-white border border-black divide-y divide-black grid",
          "max-h-[300px] overflow-auto scrollbar-hide w-[100px] text-center"
        )}
        onClick={() => {
          setOpen(false)
        }}
      >
        <CustomLink href="/anime?format=movie">
          <div className="p-1 hover:bg-blue-100">MOVIE</div>
        </CustomLink>
        <CustomLink href="/anime?format=ova">
          <div className="p-1 hover:bg-blue-100">OVA</div>
        </CustomLink>
        <CustomLink href="/edit">
          <div className="p-1 hover:bg-blue-100">EDIT</div>
        </CustomLink>
      </PopoverContent>
    </Popover>
  )
}
