"use client"
import { createUser } from "@/actions/user"
import { signIn } from "next-auth/react"
import { useState } from "react"
import CustomButton from "./CustomButton"
import { cn } from "@/utils/tw"

export default function LoginForm({ setOpen }) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isLogin, setIsLogin] = useState(true)
  return (
    <div className="flex flex-col gap-2">
      <CustomButton className="border border-gray-500 p-1" onClick={() => signIn("google")}>
        google login
      </CustomButton>
      <div className="flex">
        <CustomButton className={cn("w-full bg-gray-100", { "bg-blue-100": isLogin })} onClick={() => setIsLogin(true)}>
          login
        </CustomButton>
        <CustomButton
          className={cn("w-full bg-gray-100", { "bg-blue-100": !isLogin })}
          onClick={() => setIsLogin(false)}
        >
          register
        </CustomButton>
      </div>
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
      <div className="flex justify-center gap-2">
        {isLogin ? (
          <CustomButton
            className="w-1/2 border border-gray-500 p-1"
            onClick={async () => {
              await signIn("credentials", { username, password })
              setOpen(false)
            }}
          >
            login
          </CustomButton>
        ) : (
          <CustomButton
            className="w-1/2 border border-gray-500 p-1"
            onClick={async () => {
              await createUser(username, password)
              await signIn("credentials", { username, password })
              setOpen(false)
            }}
          >
            register
          </CustomButton>
        )}
      </div>
    </div>
  )
}
