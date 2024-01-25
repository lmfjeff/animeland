"use client"
import { useState } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "./Popover"
import { SORT_OPTIONS } from "@/constants/media"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

export default function SortFilter({ q }) {
  const [open, setOpen] = useState(false)
  const { sort, ...rest } = q
  const search = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger onClick={() => setOpen(v => !v)}>
        <div className="border px-2">
          sort: {SORT_OPTIONS.find(v => v.value === sort)?.text || SORT_OPTIONS[0].text}
        </div>
      </PopoverTrigger>
      <PopoverContent className="bg-white border border-black flex flex-col divide-y">
        {SORT_OPTIONS.map(v => (
          <button
            key={v.value}
            className="p-1"
            onClick={() => {
              const newSearch = new URLSearchParams(search.toString())
              newSearch.set("sort", v.value)
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
