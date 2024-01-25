"use client"
import { useState } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "./Popover"
import { FOLLOW_OPTIONS } from "@/constants/media"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

export default function FollowFilter({ q }) {
  const [open, setOpen] = useState(false)
  const { follow, ...rest } = q
  const search = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger onClick={() => setOpen(v => !v)}>
        <div className="border px-2">
          follow: {FOLLOW_OPTIONS.find(v => v.value === follow)?.text || FOLLOW_OPTIONS[0].text}
        </div>
      </PopoverTrigger>
      <PopoverContent className="bg-white border border-black flex flex-col divide-y">
        {FOLLOW_OPTIONS.map(v => (
          <button
            key={v.value}
            className="p-1"
            onClick={() => {
              const newSearch = new URLSearchParams(search.toString())
              newSearch.set("follow", v.value)
              router.push(`${pathname}?${newSearch.toString()}`)
              setOpen(false)
            }}
          >
            {v.text}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  )
}
