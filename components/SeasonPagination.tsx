"use client"
import { SEASON_LIST } from "@/constants/media"
import { usePRouter } from "@/utils/router"
import { usePathname } from "next/navigation"
import { useHotkeys } from "react-hotkeys-hook"
import CustomButton from "./CustomButton"
import { range } from "ramda"
import { cn } from "@/utils/tw"
import Select from "react-select"

export default function SeasonPagination({ q, nowYear, nowSeason }) {
  const router = usePRouter()
  let { year, season } = q
  year = year ?? nowYear
  season = season ?? nowSeason
  const pathname = usePathname()
  const options = range(2000, nowYear + 1)
    .map(yr => range(1, 5).map(sn => ({ value: { year: yr, season: sn }, label: `${yr} ${SEASON_LIST[sn - 1]}` })))
    .flat()
  const defaultValue = options[options.findIndex(o => o.value.year === year && o.value.season === season)]

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
      <Select
        key={`${year}-${season}`}
        defaultValue={defaultValue}
        options={options}
        onChange={v => handleJump(v?.value?.year, v?.value?.season)}
        instanceId={"season-select"}
        className="w-[145px]"
        isSearchable={false}
        components={{ IndicatorSeparator: () => <></> }}
        styles={{
          dropdownIndicator(base, props) {
            return { ...base, paddingLeft: 0 }
          },
          valueContainer(base, props) {
            return { ...base, paddingRight: 0 }
          },
        }}
      />
      <CustomButton>
        <img src="/right.svg" className="size-8 cursor-pointer" onClick={handleRight} />
      </CustomButton>
    </div>
  )
}
