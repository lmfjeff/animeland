"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { useHotkeys } from "react-hotkeys-hook"
import { useLockBodyScroll } from "react-use"

export default function Backdrop() {
  const router = useRouter()
  function onClose() {
    router.back()
  }
  // todo lock scroll but show scrollbar to prevent layout shift
  useLockBodyScroll()

  useHotkeys("esc", onClose)
  return <div className="z-backdrop absolute w-full h-full bg-[rgba(0,0,0,0.5)]" onClick={onClose}></div>
}
