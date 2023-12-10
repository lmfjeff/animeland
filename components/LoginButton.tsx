"use client"
import React from "react"
import Button from "./Button"
import { signIn } from "next-auth/react"

export default function LoginButton() {
  return <Button onClick={() => signIn("google")}>Login</Button>
}
