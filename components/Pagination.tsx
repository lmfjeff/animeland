"use client"
import { usePRouter } from "@/utils/router"
import { cn } from "@/utils/tw"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "./Popover"
import { useHotkeys } from "react-hotkeys-hook"
import { range } from "ramda"
import CustomButton from "./CustomButton"

export default function Pagination({ q, count, perPage }) {
  const [open, setOpen] = useState(false)
  const router = usePRouter()
  const { page } = q
  const pathname = usePathname()
  const totalPage = Math.ceil(count / perPage)

  function handleJump(page) {
    router.push(
      pathname +
        "?" +
        new URLSearchParams({
          ...q,
          page,
        })
    )
  }

  function handleLeft() {
    if (page === 1) return
    router.push(
      pathname +
        "?" +
        new URLSearchParams({
          ...q,
          page: page - 1,
        })
    )
  }
  function handleRight() {
    if (page === totalPage) return
    router.push(
      pathname +
        "?" +
        new URLSearchParams({
          ...q,
          page: page + 1,
        })
    )
  }
  useHotkeys("left,a", handleLeft)
  useHotkeys("right,d", handleRight)

  return (
    <>
      <div className="flex items-center">
        <div
          className={cn(
            "size-8 cursor-pointer bg-black",
            "mask-[url(/left.svg)] mask-no-repeat mask-position-center mask-size-contain",
            { "bg-gray-500": page === 1 }
          )}
          onClick={handleLeft}
        />
        <Popover open={open} onOpenChange={setOpen} placement="top">
          <PopoverTrigger onClick={() => setOpen(v => !v)} className="text-center">
            page: {page}/{totalPage}
          </PopoverTrigger>
          <PopoverContent
            className={cn(
              "bg-white border border-black divide-y divide-black grid",
              "w-[100px] h-[300px] overflow-auto scrollbar-hide"
            )}
          >
            {range(1, totalPage + 1).map(n => (
              <CustomButton
                key={n}
                className="py-[2px] hover:bg-blue-100"
                onClick={() => {
                  handleJump(n)
                  setOpen(false)
                }}
              >
                {n}
              </CustomButton>
            ))}
          </PopoverContent>
        </Popover>
        <div
          className={cn(
            "size-8 cursor-pointer bg-black",
            "mask-[url(/right.svg)] mask-no-repeat mask-position-center mask-size-contain",
            { "bg-gray-500": page === totalPage }
          )}
          onClick={handleRight}
        />
        <div>
          ({page === totalPage ? count - (totalPage - 1) * perPage : perPage} out of {count})
        </div>
      </div>
    </>
  )
}
