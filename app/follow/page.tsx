import React from "react"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"
import Link from "next/link"
import { cn } from "@/utils/tw"
import FollowImport from "@/components/FollowImport"
import { FOLLOWLIST_SORT_OPTIONS, FOLLOWLIST_WATCH_STATUS_OPTIONS } from "@/constants/media"
import Filter from "@/components/Filter"
import { Prisma } from "@prisma/client"
import { RateButton, StatusButton } from "@/components/FollowButton"
import Pagination from "@/components/Pagination"

export default async function Follow({ searchParams }) {
  const perPage = 100
  const q = {
    ...searchParams,
    page: searchParams.page ? parseInt(searchParams.page) : 1,
  }
  const { page, sort, order, watch_status } = q
  const session = await auth()

  if (!session) return <div className="text-center">please login</div>

  async function fetchFollow() {
    const defaultSort = "updated_at"
    const finalSort = sort ? (FOLLOWLIST_SORT_OPTIONS.find(v => v.value === sort) ? sort : defaultSort) : defaultSort
    const sortInput: Prisma.FollowListOrderByWithRelationInput | Prisma.FollowListOrderByWithRelationInput[] = {}
    if (["score"].includes(finalSort)) {
      sortInput[finalSort] = {
        sort: order === "asc" ? "asc" : "desc",
        nulls: "last",
      }
    } else {
      sortInput[finalSort] = order === "asc" ? "asc" : "desc"
    }
    const where = {
      user_id: session?.user?.id,
      watch_status,
    }
    const findMany = prisma.followList.findMany({
      where,
      orderBy: sortInput,
      include: {
        media: true,
      },
      take: perPage,
      skip: perPage * ((page || 1) - 1),
    })
    const count = prisma.followList.count({
      where,
    })
    return await prisma.$transaction([findMany, count])
  }
  const [follows, count] = await fetchFollow()
  return (
    <div className="p-2 flex flex-col gap-2 grow">
      <FollowImport />
      <Pagination q={q} count={count} perPage={perPage} />
      <div className="flex p-1 gap-2 flex-wrap">
        <Filter q={searchParams} name="sort" options={FOLLOWLIST_SORT_OPTIONS} />
        <Filter q={searchParams} name="watch_status" options={FOLLOWLIST_WATCH_STATUS_OPTIONS} />
      </div>
      <div className="flex flex-col divide-y">
        {follows.map(f => (
          <div key={f.media_id} className="flex items-center gap-1">
            <Link href={`/anime/${f.media.id}`} className="line-clamp-1">
              {f.media.titles?.ja}
            </Link>
            <div className="ml-auto min-w-[70px] max-w-[70px] overflow-clip">
              <StatusButton animeId={f.media_id} watchStatus={f.watch_status} />
            </div>
            <div className="min-w-[30px]">
              <RateButton animeId={f.media_id} score={f.score} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
