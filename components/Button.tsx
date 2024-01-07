import { cn } from "@/utils/tw"
import React from "react"

export default function Button(props: React.ComponentPropsWithRef<"button">) {
  const { className, ...propsWithoutClassname } = props
  return (
    <button className={cn("border p-1", className)} {...propsWithoutClassname}>
      {props.children}
    </button>
  )
}
