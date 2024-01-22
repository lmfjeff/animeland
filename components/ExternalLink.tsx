import { cn } from "@/utils/tw"
import React, { HTMLAttributes } from "react"

export default function ExternalLink({ children, className, ...rest }: React.ComponentPropsWithoutRef<"a">) {
  return (
    <a className={cn(className, "flex items-center gap-1")} rel="noreferrer" target="_blank" {...rest}>
      {children}
      <img src="/external-link.svg" className="size-3" />
    </a>
  )
}
