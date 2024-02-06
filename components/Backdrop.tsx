"use client"

import { usePRouter } from "@/utils/router"
import { useEffect } from "react"
import { useHotkeys } from "react-hotkeys-hook"

export default function Backdrop() {
  const router = usePRouter()
  function onClose() {
    router.back()
  }
  useEffect(() => {
    if (window.innerHeight < document.body.scrollHeight) {
      const top = window.scrollY
      document.body.style.position = "fixed"
      document.body.style.overflowY = "scroll"
      document.body.style.width = "100%"
      document.body.style.top = `-${top}px`
    }
    return () => {
      document.body.style.position = "static"
      document.body.style.overflowY = "auto"
      document.body.style.top = "0px"
    }
  }, [])

  useHotkeys("esc", onClose)
  return <div className="z-backdrop absolute w-full h-full bg-[rgba(0,0,0,0.5)]" onClick={onClose}></div>
}
