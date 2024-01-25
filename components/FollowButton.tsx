"use client"
import { follow, unfollow } from "@/actions/follow"
import { WATCH_STATUS_OPTIONS } from "@/constants/media"
import { FloatingFocusManager, useClick, useDismiss, useFloating, useInteractions } from "@floating-ui/react"
import { range } from "ramda"
import { useState } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "./Popover"

export function FollowButton({ animeId, isFollowed }) {
  return (
    <button
      onClick={() => {
        if (isFollowed) {
          unfollow(animeId)
        } else {
          follow(animeId)
        }
      }}
    >
      {isFollowed ? "unfollow" : "follow"}
    </button>
  )
}

export function RateButton({ animeId, score }) {
  const [open, setOpen] = useState(false)
  return (
    <Popover open={open} onOpenChange={setOpen} placement="top">
      <PopoverTrigger onClick={() => setOpen(v => !v)}>{score || "rate"}</PopoverTrigger>
      <PopoverContent className="bg-white border border-black w-1/3 grid grid-cols-2">
        {range(0, 21).map(n => (
          <button
            key={n}
            className="py-1 border border-black"
            onClick={() => {
              follow(animeId, n / 2, undefined)
            }}
          >
            {n / 2}
          </button>
        ))}
        <button
          className="py-1 border border-black"
          onClick={() => {
            follow(animeId, null, undefined)
          }}
        >
          X
        </button>
      </PopoverContent>
    </Popover>
  )
}

export function StatusButton({ animeId, watchStatus }) {
  const [open, setOpen] = useState(false)
  return (
    <Popover open={open} onOpenChange={setOpen} placement="top">
      <PopoverTrigger onClick={() => setOpen(v => !v)}>{watchStatus || "status"}</PopoverTrigger>
      <PopoverContent className="bg-white border border-black w-1/3 grid">
        {WATCH_STATUS_OPTIONS.map(s => (
          <button
            key={s}
            className="py-1 border border-black"
            onClick={() => {
              follow(animeId, undefined, s)
            }}
          >
            {s}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  )
}
