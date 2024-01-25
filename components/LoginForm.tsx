"use client"
import { createUser } from "@/actions/user"
import { signIn, signOut } from "next-auth/react"
import { useState } from "react"

export default function LoginForm({ session, setOpen }) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  return (
    <div className="bg-white p-4 flex flex-col gap-2">
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
                setOpen(false)
              }}
            >
              login
            </button>
            <button
              className="w-full border border-gray-500 p-1"
              onClick={async () => {
                await createUser(username, password)
                await signIn("credentials", { username, password })
                setOpen(false)
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
              setOpen(false)
            }}
          >
            log out
          </button>
        </>
      )}
    </div>
  )
}
