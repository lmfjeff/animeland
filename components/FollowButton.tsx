"use client"
import { follow, unfollow } from "@/actions/follow"
import { FloatingFocusManager, useClick, useDismiss, useFloating, useInteractions } from "@floating-ui/react"
import { range } from "ramda"
import { useState } from "react"

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

function PopupButton({ text, className, children }) {
  const [isOpen, setIsOpen] = useState(false)
  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement: "top",
  })
  const click = useClick(context)
  const dismiss = useDismiss(context)
  const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss])

  return (
    <>
      <button ref={refs.setReference} {...getReferenceProps()}>
        {text}
      </button>
      {isOpen && (
        <FloatingFocusManager context={context} modal={false}>
          <div
            ref={refs.setFloating}
            style={floatingStyles}
            {...getFloatingProps()}
            className={className}
            // className="w-1/3 grid grid-cols-2 border border-black bg-white shadow"
          >
            {children}
          </div>
        </FloatingFocusManager>
      )}
    </>
  )
}

export function RateButton({ animeId, score }) {
  return (
    <PopupButton text={score || "rate"} className="w-1/3 grid grid-cols-2 border border-black bg-white shadow">
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
    </PopupButton>
  )
}

export function StatusButton({ animeId, watchStatus }) {
  return (
    <PopupButton text={watchStatus || "status"} className="w-1/3 grid border border-black bg-white shadow">
      {["to watch", "watching", "watched", "dropped"].map(s => (
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
    </PopupButton>
  )
}
