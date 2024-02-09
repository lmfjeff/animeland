import { cn } from "@/utils/tw"
import React from "react"

export default function CustomButton({ className, children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button {...props} className={cn(className, "active:opacity-50")}>
      {children}
    </button>
  )
}
