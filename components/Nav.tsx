"use client"
import Link from "next/link"
import LoginButton from "./LoginButton"
import LogoutButton from "./LogoutButton"
import { signIn, signOut } from "next-auth/react"
import { cn } from "@/utils/tw"

export default function Nav({ session }) {
  return (
    <div className={cn("sticky top-0 bg-blue-300 w-full", "flex justify-between p-1 gap-2 items-center")}>
      <Link href="/">wellcome</Link>
      {/* <a href="/api/auth/signin">sign in</a>
        <a href="/api/auth/signout">sign out</a> */}
      {/* <LoginButton />
      <LogoutButton /> */}
      <img
        src={session?.user?.image || "user.svg"}
        className="size-8 border rounded-full"
        onClick={() => {
          if (session) {
            signOut()
          } else {
            signIn("google")
          }
        }}
      />
    </div>
  )
}
