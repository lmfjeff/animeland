"use client"
import { SEASON_LIST } from "@/constants/media"
import { usePRouter } from "@/utils/router"
import { usePathname } from "next/navigation"
import { useHotkeys } from "react-hotkeys-hook"
import CustomButton from "./CustomButton"
import { useState } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "./Popover"
import { range } from "ramda"
import { cn } from "@/utils/tw"

export default function SeasonPagination({ q, nowYear, nowSeason }) {
  const [open, setOpen] = useState(false)
  const router = usePRouter()
  const { year, season } = q
  const pathname = usePathname()

  function handleJump(year, season) {
    router.push(
      pathname +
        "?" +
        new URLSearchParams({
          ...q,
          year,
          season,
        })
    )
  }

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
      <CustomButton>
        <img src="/left.svg" className="size-8 cursor-pointer" onClick={handleLeft} />
      </CustomButton>
      {/* <div>
        {year} {SEASON_LIST[season - 1]}
      </div> */}
      <Popover open={open} onOpenChange={setOpen} placement="bottom">
        <PopoverTrigger onClick={() => setOpen(v => !v)} className="text-center">
          {year} {SEASON_LIST[season - 1]}
        </PopoverTrigger>
        <PopoverContent
          className={cn(
            "bg-white border border-black divide-y divide-black grid",
            "w-[120px] h-[300px] overflow-auto scrollbar-hide"
          )}
        >
          {range(2000, nowYear + 1).map(yr =>
            range(1, 5).map(sn => (
              <CustomButton
                key={`${yr}-${sn}`}
                className="py-[2px] hover:bg-blue-100 text-left px-1"
                onClick={() => {
                  handleJump(yr, sn)
                  setOpen(false)
                }}
              >
                {yr} {SEASON_LIST[sn - 1]}
              </CustomButton>
            ))
          )}
        </PopoverContent>
      </Popover>
      <CustomButton>
        <img src="/right.svg" className="size-8 cursor-pointer" onClick={handleRight} />
      </CustomButton>
    </div>
  )
}
