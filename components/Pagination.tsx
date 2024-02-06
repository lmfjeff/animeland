"use client"
import { usePRouter } from "@/utils/router"
import { cn } from "@/utils/tw"
import { usePathname } from "next/navigation"
import { useHotkeys } from "react-hotkeys-hook"

export default function Pagination({ q, count, perPage }) {
  const router = usePRouter()
  const { page } = q
  const pathname = usePathname()
  const totalPage = Math.ceil(count / perPage)

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
        <div>
          page: {page}/{totalPage}
        </div>
        <div
          className={cn(
            "size-8 cursor-pointer bg-black",
            "mask-[url(/right.svg)] mask-no-repeat mask-position-center mask-size-contain",
            { "bg-gray-500": page === totalPage }
          )}
          onClick={handleRight}
        />
        <div>
          ({page === totalPage ? count % perPage : perPage} out of {count})
        </div>
      </div>
    </>
  )
}
