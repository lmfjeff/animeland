"use client"
import { follow, unfollow } from "@/actions/follow"
import { FOLLOWLIST_WATCH_STATUS_OPTIONS } from "@/constants/media"
import { range } from "ramda"
import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Popover, PopoverContent, PopoverTrigger } from "./Popover"
import CustomButton from "./CustomButton"

export function FollowButton({ animeId, isFollowed: initialFollowed }) {
  const [isFollowed, setIsFollowed] = useState(initialFollowed)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  return (
    <CustomButton
      onClick={async () => {
        const nextState = !isFollowed
        setIsFollowed(nextState)
        const res = nextState ? await follow(animeId) : await unfollow(animeId)
        if (res?.error === "unauthorized") {
          setIsFollowed(!nextState)
          alert("Please sign in first to follow anime!")
          return
        }
        startTransition(() => {
          router.refresh()
        })
      }}
      className="py-1 text-center border font-medium hover:bg-blue-100 transition-colors"
    >
      {isFollowed ? "unfollow" : "follow"}
    </CustomButton>
  )
}

export function RateButton({ animeId, score: initialScore }) {
  const [score, setScore] = useState<number | null | undefined>(initialScore)
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  return (
    <Popover open={open} onOpenChange={setOpen} placement="top">
      <PopoverTrigger asChild>
        <CustomButton
          type="button"
          className="py-1 text-center border w-full font-medium hover:bg-blue-100 transition-colors"
        >
          {score != null ? score.toString() : "rate"}
        </CustomButton>
      </PopoverTrigger>
      <PopoverContent className="bg-white border border-gray-400 rounded shadow-2xl w-48 max-h-60 overflow-y-auto grid grid-cols-2 p-1">
        {range(0, 21).map(n => {
          const val = n / 2
          return (
            <CustomButton
              key={n}
              className="py-1 m-0.5 border border-gray-200 hover:bg-blue-200 text-xs text-center rounded transition-colors"
              onClick={async () => {
                setScore(val)
                setOpen(false)
                const res = await follow(animeId, val, undefined)
                if (res?.error === "unauthorized") {
                  setScore(initialScore)
                  alert("Please sign in first to rate anime!")
                  return
                }
                startTransition(() => {
                  router.refresh()
                })
              }}
            >
              {val}
            </CustomButton>
          )
        })}
        <CustomButton
          className="py-1 m-0.5 border border-red-200 hover:bg-red-100 text-xs text-center col-span-2 font-bold text-red-600 rounded transition-colors"
          onClick={async () => {
            setScore(null)
            setOpen(false)
            const res = await follow(animeId, null, undefined)
            if (res?.error === "unauthorized") {
              setScore(initialScore)
              alert("Please sign in first to rate anime!")
              return
            }
            startTransition(() => {
              router.refresh()
            })
          }}
        >
          Clear Rating (X)
        </CustomButton>
      </PopoverContent>
    </Popover>
  )
}

export function StatusButton({ animeId, watchStatus: initialStatus }) {
  const [watchStatus, setWatchStatus] = useState(initialStatus)
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  return (
    <Popover open={open} onOpenChange={setOpen} placement="top">
      <PopoverTrigger asChild>
        <CustomButton
          type="button"
          className="py-1 text-center border w-full font-medium hover:bg-blue-100 transition-colors"
        >
          {FOLLOWLIST_WATCH_STATUS_OPTIONS.find(v => v.value === watchStatus)?.text || "status"}
        </CustomButton>
      </PopoverTrigger>
      <PopoverContent className="bg-white border border-gray-400 rounded shadow-2xl w-40 flex flex-col gap-1 p-1">
        {FOLLOWLIST_WATCH_STATUS_OPTIONS.map(s => (
          <CustomButton
            key={s.value}
            className="py-1.5 px-2 border border-gray-200 hover:bg-blue-200 text-xs text-left rounded transition-colors"
            onClick={async () => {
              setWatchStatus(s.value)
              setOpen(false)
              const res = await follow(animeId, undefined, s.value)
              if (res?.error === "unauthorized") {
                setWatchStatus(initialStatus)
                alert("Please sign in first to update watch status!")
                return
              }
              startTransition(() => {
                router.refresh()
              })
            }}
          >
            {s.text}
          </CustomButton>
        ))}
      </PopoverContent>
    </Popover>
  )
}
