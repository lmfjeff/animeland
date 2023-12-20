import LoginButton from "@/components/LoginButton"
import LogoutButton from "@/components/LogoutButton"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export default async function Home() {
  const session = await auth()
  async function test() {
    return await prisma.user.findFirst()
  }
  const firstUser = await test()
  return (
    <div className="h-screen flex flex-col gap-2 justify-center items-center">
      <div>wellcome</div>
      {/* <a href="/api/auth/signin">sign in</a>
      <a href="/api/auth/signout">sign out</a> */}
      <LoginButton />
      <LogoutButton />
      <div className="border p-1">date: {new Date().toUTCString()}</div>
      <div className="border p-1">env: {process.env.NEXT_PUBLIC_DOTENV}</div>
      <pre className="border p-1">first user: {firstUser?.email}</pre>
      <pre className="border p-1">session: {JSON.stringify(session, null, 2)}</pre>
    </div>
  )
}
