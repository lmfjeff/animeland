import LoginButton from "@/components/LoginButton"
import LogoutButton from "@/components/LogoutButton"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import Link from "next/link"
import { Prisma } from "@prisma/client"

export default async function Animes({ params, searchParams }) {
  let { year, season } = searchParams
  year = year ? parseInt(year) : new Date().getFullYear()
  season = season ? parseInt(season) : Math.floor(new Date().getMonth() / 3) + 1
  const session = await auth()
  async function test() {
    return await prisma.user.findFirst()
  }
  const firstUser = await test()
  async function fetchAnimes() {
    return await prisma.media.findMany({
      where: {
        season: season,
        year: year,
        day_of_week: {
          not: Prisma.DbNull,
        },
      },
    })
  }
  const animes = await fetchAnimes()

  return (
    <div className="h-screen flex divide-x">
      <div className="flex flex-col gap-2 items-start w-full max-w-[200px] overflow-hidden">
        <Link href="/">wellcome</Link>
        {/* <a href="/api/auth/signin">sign in</a>
        <a href="/api/auth/signout">sign out</a> */}
        <LoginButton />
        <LogoutButton />
        <div className="border p-1">date: {new Date().toUTCString()}</div>
        <div className="border p-1">env: {process.env.NEXT_PUBLIC_DOTENV}</div>
        <div className="border p-1">first user: {firstUser?.email}</div>
        <pre className="border p-1">session: {JSON.stringify(session, null, 2)}</pre>
      </div>
      <div>
        <div className="flex items-center gap-2 p-1">
          <Link
            href={{
              pathname: "/anime",
              query: {
                year: season === 1 ? year - 1 : year,
                season: season === 1 ? 4 : season - 1,
              },
            }}
            className="border px-1"
          >
            prev
          </Link>
          <div>
            {year}-{season}
          </div>
          <Link
            href={{
              pathname: "/anime",
              query: {
                year: season === 4 ? year + 1 : year,
                season: season === 4 ? 1 : season + 1,
              },
            }}
            className="border px-1"
          >
            next
          </Link>
        </div>
        <div>{animes.length}</div>
        <div className="divide-y">
          {animes.map(anime => (
            <div key={anime.id} className="grid grid-cols-3">
              <div className="flex gap-1">
                {anime.external_links
                  .filter(link => link.site === "Wikipedia")
                  .map(link => (
                    <a key={link.url} href={link.url} className="border px-1" rel="noreferrer" target="_blank">
                      {link.url.replace("https://", "").slice(0, 2)} wiki
                    </a>
                  ))}
              </div>
              <Link className="line-clamp-1" href={`/anime/${anime.id}`}>
                {anime.titles.ja}
              </Link>
              <div className="line-clamp-1">{anime.titles.zh}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
