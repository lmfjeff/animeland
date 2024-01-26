"use client"
import { usePathname, useRouter } from "next/navigation"
import { useHotkeys } from "react-hotkeys-hook"

export default function SeasonPagination({ q }) {
  const router = useRouter()
  const { year, season } = q
  const pathname = usePathname()
  function handleLeft() {
    router.push(
      pathname +
        "?" +
        new URLSearchParams({
          ...q,
          year: season === 1 ? year - 1 : year,
          season: season === 1 ? 4 : season - 1,
        })
    )
  }
  function handleRight() {
    router.push(
      pathname +
        "?" +
        new URLSearchParams({
          ...q,
          year: season === 4 ? year + 1 : year,
          season: season === 4 ? 1 : season + 1,
        })
    )
  }
  useHotkeys("left,a", handleLeft)
  useHotkeys("right,d", handleRight)
  return (
    <div className="flex items-center">
      <img src="left.svg" className="size-8 cursor-pointer" onClick={handleLeft} />
      <div>
        {year}-{season}
      </div>
      <img src="right.svg" className="size-8 cursor-pointer" onClick={handleRight} />
    </div>
  )
}
