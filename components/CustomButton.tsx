import { cn } from "@/utils/tw"
import React from "react"

const CustomButton = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  function CustomButton({ className, children, ...props }, ref) {
    return (
      <button ref={ref} {...props} className={cn(className, "active:opacity-50")}>
        {children}
      </button>
    )
  }
)

export default CustomButton
