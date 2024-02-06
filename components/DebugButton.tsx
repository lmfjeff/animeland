"use client"

import { usePRouter } from "@/utils/router"
import { usePathname, useSearchParams } from "next/navigation"

export default function DebugButton() {
  const search = useSearchParams()
  const pathname = usePathname()
  const router = usePRouter()
  return (
    <img
      src="/debug.svg"
      className="size-8 cursor-pointer"
      onClick={() => {
        const old = search.get("debug")
        const newSearch = new URLSearchParams(search.toString())
        if (old) {
          newSearch.delete("debug")
        } else {
          newSearch.set("debug", "1")
        }
        router.push(`${pathname}?${newSearch.toString()}`)
      }}
    />
  )
}
