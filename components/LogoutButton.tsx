"use client"
import React from "react"
import Button from "./Button"
import { signOut } from "next-auth/react"

export default function LogoutButton() {
  return <Button onClick={() => signOut()}>Logout</Button>
}
