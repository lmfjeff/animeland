"use client"
import { usePathname } from "next/navigation"
import { cn } from "@/utils/tw"
import { usePRouter } from "@/utils/router"
import CustomButton from "./CustomButton"

export default function Filter({ q, name, options, hasOrder = false }) {
  const currentValue = q[name]
  const currentOrder = q.order
  const pathname = usePathname()
  const router = usePRouter()
  return (
    <div className="flex items-center gap-1 flex-wrap">
      <div>{name}</div>
      {options.map(v => (
        <CustomButton
          key={v.value}
          className={cn("p-1 border border-black", {
            "bg-blue-500 text-white": v.value === currentValue,
          })}
          onClick={() => {
            const newSearch = new URLSearchParams(q)
            if (!hasOrder) {
              if (v.value === currentValue) {
                newSearch.delete(name)
              } else {
                newSearch.set(name, v.value)
              }
            } else {
              if (v.value === currentValue) {
                newSearch.set("order", currentOrder === "desc" ? "asc" : "desc")
              } else {
                newSearch.set(name, v.value)
                newSearch.set("order", "desc")
              }
            }
            router.push(`${pathname}?${newSearch.toString()}`)
          }}
        >
          {v.text}
        </CustomButton>
      ))}
      {hasOrder && <div>{currentOrder === "desc" ? "↓" : "↑"}</div>}
    </div>
  )
}
