"use client"
import Link from "next/link"
import { cn } from "@/utils/tw"
import { useEffect, useState } from "react"
import DebugButton from "./DebugButton"
import { Modal, ModalContent } from "./Modal"
import LoginForm from "./LoginForm"
import SearchInput from "./SearchInput"
import { usePathname, useSearchParams } from "next/navigation"
import NProgress from "nprogress"

export default function Nav({ session }) {
  const [loginModalOpen, setLoginModalOpen] = useState(false)
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    NProgress.done()
  }, [pathname, searchParams])

  return (
    <div className={cn("sticky top-0 z-sticky bg-blue-300 w-full", "flex justify-between p-1 gap-2 items-center")}>
      <Link href="/anime">
        <img src="/home.svg" className="size-8" />
      </Link>
      <div className="flex gap-4 items-center">
        <SearchInput />
        <DebugButton />
        <Link href="/follow">
          <img src="/heart.svg" className="size-8" />
        </Link>
        <img
          src={session?.user?.image || "/user.svg"}
          className="size-8 mr-2"
          onClick={() => setLoginModalOpen(!loginModalOpen)}
        />
      </div>
      <Modal open={loginModalOpen} onOpenChange={setLoginModalOpen}>
        <ModalContent>
          <LoginForm session={session} setOpen={setLoginModalOpen} />
        </ModalContent>
      </Modal>
    </div>
  )
}
