import React from "react"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"
import Link from "next/link"
import { cn } from "@/utils/tw"
import FollowImport from "@/components/FollowImport"

export default async function Follow({ searchParams }) {
  let { page } = searchParams
  page = page ? parseInt(page) : 1
  const session = await auth()
  async function fetchFollow() {
    const findMany = prisma.followList.findMany({
      where: {
        user_id: session?.user?.id,
      },
      orderBy: {
        updated_at: "desc",
      },
      include: {
        media: true,
      },
      take: 100,
      skip: 100 * ((page || 1) - 1),
    })
    const count = prisma.followList.count({
      where: {
        user_id: session?.user?.id,
      },
    })
    return await prisma.$transaction([findMany, count])
  }
  const [follows, count] = await fetchFollow()
  return (
    <>
      <FollowImport />
      <div className="flex justify-between">
        <Link
          href={{
            pathname: "/follow",
            query: {
              page: page - 1,
            },
          }}
          className={cn({ invisible: page <= 1 })}
        >
          prev
        </Link>
        <div>
          total: {Math.ceil(count / 100)}/{page}
        </div>
        <Link
          href={{
            pathname: "/follow",
            query: {
              page: page + 1,
            },
          }}
          className={cn({ invisible: page >= Math.ceil(count / 100) })}
        >
          next
        </Link>
      </div>
      <div className="flex flex-col">
        {follows.map(follow => (
          <div key={follow.media_id}>
            <div>{follow.media.titles?.ja}</div>
          </div>
        ))}
      </div>
    </>
  )
}
