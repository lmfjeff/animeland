"use client"
import Link from "next/link"
import { cn } from "@/utils/tw"
import { useEffect, useState } from "react"
import { Modal, ModalContent } from "./Modal"
import LoginForm from "./LoginForm"
import SearchInput from "./SearchInput"
import { usePathname, useSearchParams, useRouter } from "next/navigation"
import NProgress from "nprogress"
import CustomLink from "./CustomLink"
import CustomButton from "./CustomButton"
import ExtraPageButton from "./ExtraPageButton"
import UserDetail from "./UserDetail"
import { Popover, PopoverContent, PopoverTrigger } from "./Popover"
import { LANGUAGE_LABELS, LANGUAGE_ORDER, normalizeLanguage } from "@/utils/title"

export default function Nav({ session }) {
  const [loginModalOpen, setLoginModalOpen] = useState(false)
  const [languageOpen, setLanguageOpen] = useState(false)
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()
  const currentLang = normalizeLanguage(searchParams?.get("lang"))

  useEffect(() => {
    NProgress.done()
  }, [pathname, searchParams])

  const setLanguage = (lang: string) => {
    const params = new URLSearchParams(searchParams?.toString() || "")
    params.set("lang", lang)
    const search = params.toString()
    setLanguageOpen(false)
    router.replace(pathname + (search ? `?${search}` : ""))
  }

  return (
    <div className={cn("sticky top-0 z-sticky bg-blue-300 w-full", "flex justify-between p-1 gap-2 items-center")}>
      <CustomLink href={currentLang ? `/anime?lang=${currentLang}` : "/anime"}>
        <img src="/home.svg" className="size-8 min-w-8" />
      </CustomLink>
      <div className="flex gap-4 items-center">
        <SearchInput />
        <ExtraPageButton />
        <Popover placement="bottom-end" open={languageOpen} onOpenChange={setLanguageOpen}>
          <PopoverTrigger asChild>
            <CustomButton
              className="p-0 bg-transparent rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500"
              aria-label="Switch language"
            >
              <span className="w-8 h-8 inline-flex items-center justify-center rounded-full text-cyan-700 hover:bg-slate-100 hover:text-cyan-900">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  className="w-6 h-6 stroke-current"
                  fill="none"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="9" />
                  <path d="M3 12h18" />
                  <path d="M12 3c2.5 4 2.5 16 0 18" />
                  <path d="M12 3c-2.5 4-2.5 16 0 18" />
                  <path d="M6.34 6.34c3.6-.94 7.4-.94 11 0" />
                  <path d="M6.34 17.66c3.6.94 7.4.94 11 0" />
                </svg>
              </span>
            </CustomButton>
          </PopoverTrigger>
          <PopoverContent className="rounded border bg-white shadow-lg p-1 min-w-[120px]">
            {LANGUAGE_ORDER.map(lang => (
              <button
                key={lang}
                type="button"
                onClick={() => setLanguage(lang)}
                className={cn(
                  "w-full text-left px-3 py-2 text-sm hover:bg-slate-100",
                  lang === currentLang ? "font-semibold" : "font-normal"
                )}
              >
                {LANGUAGE_LABELS[lang]}
              </button>
            ))}
          </PopoverContent>
        </Popover>
        <CustomLink href={currentLang ? `/follow?lang=${currentLang}` : "/follow"}>
          <img src="/heart.svg" className="size-8 min-w-8" />
        </CustomLink>
        <CustomButton onClick={() => setLoginModalOpen(!loginModalOpen)}>
          <img
            src={session?.user?.image || "/user.svg"}
            className={cn("min-w-8 size-8 mr-2", { "rounded-full": session?.user?.image })}
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
