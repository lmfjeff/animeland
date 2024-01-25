import React from "react"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"
import Link from "next/link"
import { cn } from "@/utils/tw"
import FollowImport from "@/components/FollowImport"
import { FOLLOWLIST_SORT_OPTIONS, FOLLOWLIST_WATCH_STATUS_OPTIONS } from "@/constants/media"
import Filter from "@/components/Filter"

export default async function Follow({ searchParams }) {
  let { page, sort, order, watch_status } = searchParams
  page = page ? parseInt(page) : 1
  const session = await auth()
  async function fetchFollow() {
    const defaultSort = FOLLOWLIST_SORT_OPTIONS[0].value
    const finalSort = sort ? (FOLLOWLIST_SORT_OPTIONS.find(v => v.value === sort) ? sort : defaultSort) : defaultSort
    const findMany = prisma.followList.findMany({
      where: {
        user_id: session?.user?.id,
        watch_status,
      },
      orderBy: {
        [finalSort]: {
          sort: order === "asc" ? "asc" : "desc",
          nulls: "last",
        },
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
    <div className="p-2 flex flex-col gap-2 grow">
      <FollowImport />
      <div className="flex gap-2">
        <Link
          href={{
            pathname: "/follow",
            query: {
              ...searchParams,
              page: page - 1,
            },
          }}
          className={cn("border", { "bg-gray-300": page <= 1 })}
        >
          prev
        </Link>
        <div>
          page: {page}/{Math.ceil(count / 100)}
        </div>
        <Link
          href={{
            pathname: "/follow",
            query: {
              ...searchParams,
              page: page + 1,
            },
          }}
          className={cn("border", { "bg-gray-300": page >= Math.ceil(count / 100) })}
        >
          next
        </Link>
        <div>(total: {count})</div>
      </div>
      <div className="flex p-1 gap-2">
        <Filter q={searchParams} name="sort" options={FOLLOWLIST_SORT_OPTIONS} />
        <Filter q={searchParams} name="watch_status" options={FOLLOWLIST_WATCH_STATUS_OPTIONS} />
      </div>
      <div className="flex flex-col divide-y">
        {follows.map(follow => (
          <div key={follow.media_id} className="flex">
            <div>{follow.media.titles?.ja}</div>
            <div className="ml-auto">{follow.score}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
