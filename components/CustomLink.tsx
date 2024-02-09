import { cn } from "@/utils/tw"
import Link, { LinkProps } from "next/link"

export default function CustomLink({
  className,
  children,
  ...props
}: LinkProps & React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <Link {...props} prefetch={false} className={cn(className, "active:opacity-50")}>
      {children}
    </Link>
  )
}
