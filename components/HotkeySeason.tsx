"use client"
import { useRouter } from "next/navigation"
import { useHotkeys } from "react-hotkeys-hook"

export default function HotkeySeason({ q }) {
  const router = useRouter()
  const { year, season } = q
  useHotkeys("left", () => {
    router.push(
      "/anime?" +
        new URLSearchParams({
          ...q,
          year: season === 1 ? year - 1 : year,
          season: season === 1 ? 4 : season - 1,
        })
    )
  })
  useHotkeys("right", () => {
    router.push(
      "/anime?" +
        new URLSearchParams({
          ...q,
          year: season === 4 ? year + 1 : year,
          season: season === 4 ? 1 : season + 1,
        })
    )
  })
  return <></>
}
