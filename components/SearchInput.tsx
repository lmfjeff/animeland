"use client"
import { useRef, useState } from "react"
import { usePRouter } from "@/utils/router"
import CustomButton from "./CustomButton"

export default function SearchInput() {
  const router = usePRouter()
  const [text, setText] = useState("")
  const inputRef = useRef<any>(null)
  function handleSearch() {
    const url = `/search?q=${encodeURIComponent(text.trim())}`
    router.push(url)
    inputRef?.current?.blur()
    setText("")
  }
  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        className="min-w-[40px] w-full max-w-[100px] h-6 bg-blue-200 focus:outline-none pl-1 pr-6"
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyUp={e => {
          if (e.key === "Enter") {
            handleSearch()
          }
        }}
      />
      <CustomButton onClick={() => handleSearch()}>
        <img src="/search.svg" className="size-4 absolute right-1 top-1/2 -translate-y-1/2" />
      </CustomButton>
    </div>
  )
}
