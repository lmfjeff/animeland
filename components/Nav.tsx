"use client"
import Link from "next/link"
import { signIn, signOut } from "next-auth/react"
import { cn } from "@/utils/tw"
import {
  FloatingFocusManager,
  FloatingOverlay,
  FloatingPortal,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
} from "@floating-ui/react"
import { useState } from "react"
import { createUser } from "@/actions/user"
import DebugButton from "./DebugButton"

export default function Nav({ session }) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const { refs, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
  })
  const click = useClick(context)
  const dismiss = useDismiss(context, { outsidePressEvent: "mousedown" })
  const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss])

  return (
    <div className={cn("sticky top-0 z-sticky bg-blue-300 w-full", "flex justify-between p-1 gap-2 items-center")}>
      <Link href="/anime">
        <img src="home.svg" className="size-8" />
      </Link>
      <div className="flex gap-4">
        <DebugButton />
        <Link href="/follow">
          <img src="heart.svg" className="size-8" />
        </Link>
        <img
          src={session?.user?.image || "user.svg"}
          className="size-8"
          ref={refs.setReference}
          {...getReferenceProps()}
        />
      </div>
      <>
        {isOpen && (
          <FloatingPortal>
            <FloatingOverlay className="bg-[rgba(0,0,0,0.8)] flex justify-center items-center">
              <FloatingFocusManager context={context}>
                <div ref={refs.setFloating} {...getFloatingProps()} className="bg-white p-4 flex flex-col gap-2">
                  {!session && (
                    <>
                      <button className="border border-gray-500 p-1" onClick={() => signIn("google")}>
                        google login
                      </button>
                      <input
                        className="border border-gray-500 p-1"
                        placeholder="username"
                        name="username"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                      />
                      <input
                        className="border border-gray-500 p-1"
                        placeholder="password"
                        name="password"
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                      />
                      <div className="flex gap-2">
                        <button
                          className="w-full border border-gray-500 p-1"
                          onClick={async () => {
                            await signIn("credentials", { username, password })
                            setIsOpen(false)
                          }}
                        >
                          login
                        </button>
                        <button
                          className="w-full border border-gray-500 p-1"
                          onClick={async () => {
                            await createUser(username, password)
                            await signIn("credentials", { username, password })
                            setIsOpen(false)
                          }}
                        >
                          register
                        </button>
                      </div>
                    </>
                  )}
                  {session && (
                    <>
                      <div>email: {session?.user?.email}</div>
                      <div>username: {session?.user?.username}</div>
                      <button
                        className="border border-gray-500 p-1"
                        onClick={async () => {
                          await signOut()
                          setIsOpen(false)
                        }}
                      >
                        log out
                      </button>
                    </>
                  )}
                </div>
              </FloatingFocusManager>
            </FloatingOverlay>
          </FloatingPortal>
        )}
      </>
    </div>
  )
}
