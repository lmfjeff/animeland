"use client"
import Link from "next/link"
import { cn } from "@/utils/tw"
import { useEffect, useState } from "react"
import { Modal, ModalContent } from "./Modal"
import LoginForm from "./LoginForm"
import SearchInput from "./SearchInput"
import { usePathname, useSearchParams } from "next/navigation"
import NProgress from "nprogress"
import CustomLink from "./CustomLink"
import CustomButton from "./CustomButton"
import ExtraPageButton from "./ExtraPageButton"
import UserDetail from "./UserDetail"

export default function Nav({ session }) {
  const [loginModalOpen, setLoginModalOpen] = useState(false)
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    NProgress.done()
  }, [pathname, searchParams])

  return (
    <div className={cn("sticky top-0 z-sticky bg-blue-300 w-full", "flex justify-between p-1 gap-2 items-center")}>
      <CustomLink href="/anime">
        <img src="/home.svg" className="size-8 min-w-8" />
      </CustomLink>
      <div className="flex gap-4 items-center">
        <SearchInput />
        <ExtraPageButton />
        <CustomLink href="/follow">
          <img src="/heart.svg" className="size-8 min-w-8" />
        </CustomLink>
        <CustomButton>
          <img
            src={session?.user?.image || "/user.svg"}
            className={cn("min-w-8 size-8 mr-2", { "rounded-full": session?.user?.image })}
            onClick={() => setLoginModalOpen(!loginModalOpen)}
          />
        </CustomButton>
      </div>
      <Modal open={loginModalOpen} onOpenChange={setLoginModalOpen}>
        <ModalContent className="bg-white w-full max-w-[300px] max-h-1/2 p-4">
          {session ? (
            <UserDetail session={session} setOpen={setLoginModalOpen} />
          ) : (
            <LoginForm setOpen={setLoginModalOpen} />
          )}
        </ModalContent>
      </Modal>
    </div>
  )
}
