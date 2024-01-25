"use client"
import { useState } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "./Popover"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

export default function Filter({ q, name, options }) {
  const [open, setOpen] = useState(false)
  const currentValue = q[name]
  const search = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger onClick={() => setOpen(v => !v)}>
        <div className="border px-2">
          {name}: {options.find(v => v.value === currentValue)?.text || options[0].text}
        </div>
      </PopoverTrigger>
      <PopoverContent className="bg-white border border-black flex flex-col divide-y">
        {options.map(v => (
          <button
            key={v.value}
            className="p-1"
            onClick={() => {
              const newSearch = new URLSearchParams(search.toString())
              if (v.value === "all") {
                newSearch.delete(name)
              } else {
                newSearch.set(name, v.value)
              }
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
