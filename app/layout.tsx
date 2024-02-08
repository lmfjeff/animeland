import type { Metadata } from "next"
import { Noto_Sans_HK } from "next/font/google"
import "./globals.css"
import Nav from "@/components/Nav"
import { auth } from "@/lib/auth"
import { cn } from "@/utils/tw"
import NextTopLoader from "nextjs-toploader"

const Noto = Noto_Sans_HK({ subsets: [] })

export const metadata: Metadata = {
  title: "demo",
  description: "demo",
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  return (
    <html lang="en">
      <body className={cn(Noto.className, "min-h-screen flex flex-col")}>
        <Nav session={session} />
        <NextTopLoader showSpinner={false} color="#67C23A" />
        <div className="grow flex flex-col">{children}</div>
      </body>
    </html>
  )
}
