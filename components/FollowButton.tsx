"use client"
import { follow, unfollow } from "@/actions/follow"
import { FOLLOWLIST_WATCH_STATUS_OPTIONS } from "@/constants/media"
import { FloatingFocusManager, useClick, useDismiss, useFloating, useInteractions } from "@floating-ui/react"
import { range } from "ramda"
import { useState } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "./Popover"
import CustomButton from "./CustomButton"

export function FollowButton({ animeId, isFollowed }) {
  return (
    <CustomButton
      onClick={() => {
        if (isFollowed) {
          unfollow(animeId)
        } else {
          follow(animeId)
        }
      }}
      className="py-1 text-center border"
    >
      {isFollowed ? "unfollow" : "follow"}
    </CustomButton>
  )
}

export function RateButton({ animeId, score }) {
  const [open, setOpen] = useState(false)
  return (
    <Popover open={open} onOpenChange={setOpen} placement="top">
      <PopoverTrigger
        onClick={e => {
          e.stopPropagation()
          setOpen(v => !v)
        }}
        className="py-1 text-center border w-full"
      >
        {score?.toString() || "rate"}
      </PopoverTrigger>
      <PopoverContent className="bg-white border border-black w-1/3 grid grid-cols-2">
        {range(0, 21).map(n => (
          <CustomButton
            key={n}
            className="py-1 border border-black"
            onClick={() => {
              follow(animeId, n / 2, undefined)
              setOpen(false)
            }}
          >
            {n / 2}
          </CustomButton>
        ))}
        <CustomButton
          className="py-1 border border-black"
          onClick={() => {
            follow(animeId, null, undefined)
            setOpen(false)
          }}
        >
          X
        </CustomButton>
      </PopoverContent>
    </Popover>
  )
}

export function StatusButton({ animeId, watchStatus }) {
  const [open, setOpen] = useState(false)
  return (
    <Popover open={open} onOpenChange={setOpen} placement="top">
      <PopoverTrigger
        onClick={e => {
          e.stopPropagation()
          setOpen(v => !v)
        }}
        className="py-1 text-center border w-full"
      >
        {FOLLOWLIST_WATCH_STATUS_OPTIONS.find(v => v.value === watchStatus)?.text || "status"}
      </PopoverTrigger>
      <PopoverContent className="bg-white border border-black w-1/3 grid">
        {FOLLOWLIST_WATCH_STATUS_OPTIONS.map(s => (
          <CustomButton
            key={s.value}
            className="py-1 border border-black"
            onClick={() => {
              follow(animeId, undefined, s.value)
              setOpen(false)
            }}
          >
            {s.text}
          </CustomButton>
        ))}
      </PopoverContent>
    </Popover>
  )
}
