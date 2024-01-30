"use client"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { cn } from "@/utils/tw"

export default function Filter({ q, name, options }) {
  const currentValue = q[name]
  const search = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div>{name}</div>
      {options.map(v => (
        <button
          key={v.value}
          className={cn("p-1 border border-black", {
            "bg-blue-500 text-white": v.value === currentValue,
          })}
          onClick={() => {
            const newSearch = new URLSearchParams(search.toString())
            const oldValue = newSearch.get(name)
            if (v.value === oldValue) {
              newSearch.delete(name)
            } else {
              newSearch.set(name, v.value)
            }
            router.push(`${pathname}?${newSearch.toString()}`)
          }}
        >
          {v.text}
        </button>
      ))}
    </div>
  )
}
