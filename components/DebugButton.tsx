"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"

export default function DebugButton() {
  const search = useSearchParams()
  const newSearch = new URLSearchParams(search.toString())
  newSearch.append("debug", "1")
  const pathname = usePathname()
  const router = useRouter()
  return (
    <img
      src="/debug.svg"
      className="size-8 cursor-pointer"
      onClick={() => {
        router.push(`${pathname}?${newSearch.toString()}`)
      }}
    />
  )
}
