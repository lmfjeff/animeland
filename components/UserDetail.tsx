"use client"
import { useState } from "react"
import CustomButton from "./CustomButton"
import { signIn, signOut } from "next-auth/react"
import { cn } from "@/utils/tw"
import { setUsernameForUser } from "@/actions/user"

export default function UserDetail({ session, setOpen }) {
  const [tab, setTab] = useState("user")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const oldUsername = session?.user?.username
  return (
    <>
      {tab === "user" && (
        <div className="flex flex-col gap-2">
          <div>email: {session?.user?.email}</div>
          <div className="flex items-center gap-2">
            <div>username: </div>
            {oldUsername ? (
              <div>{oldUsername}</div>
            ) : (
              <CustomButton className="border" onClick={() => setTab("set_username")}>
                set username
              </CustomButton>
            )}
          </div>
          <CustomButton
            className="border border-gray-500 p-1"
            onClick={async () => {
              await signOut()
              setOpen(false)
            }}
          >
            log out
          </CustomButton>
        </div>
      )}
      {tab === "set_username" && (
        <div className="flex flex-col gap-2">
          <input
            autoFocus
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
          <CustomButton
            className="border border-gray-500 p-1"
            onClick={async () => {
              await setUsernameForUser(username, password)
              await signIn("credentials", { username, password })
            }}
          >
            set username & pw
          </CustomButton>
        </div>
      )}
    </>
  )
}
