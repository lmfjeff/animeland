"use client"
import { usePRouter } from "@/utils/router"
import { cn } from "@/utils/tw"
import { usePathname } from "next/navigation"
import { useHotkeys } from "react-hotkeys-hook"
import { range } from "ramda"
import CustomButton from "./CustomButton"
import Select from "react-select"

export default function Pagination({ q, count, perPage }) {
  const router = usePRouter()
  const { page } = q
  const pathname = usePathname()
  const totalPage = Math.ceil(count / perPage)
  const options = range(1, totalPage + 1).map(v => ({ value: v, label: v }))
  const defaultValue = options[options.findIndex(o => o.value === page)]

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
        <Select
          key={page}
          defaultValue={defaultValue}
          options={options}
          onChange={v => handleJump(v?.value)}
          instanceId={"page-select"}
          className="w-[70px]"
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
