import React from "react"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"
import Link from "next/link"
import { cn } from "@/utils/tw"
import FollowImport from "@/components/FollowImport"
import { FOLLOWLIST_SORT_OPTIONS, FOLLOWLIST_WATCH_STATUS_OPTIONS, SEASON_LIST } from "@/constants/media"
import Filter from "@/components/Filter"
import { Prisma } from "@prisma/client"
import { RateButton, StatusButton } from "@/components/FollowButton"
import Pagination from "@/components/Pagination"

export default async function Follow({ searchParams }) {
  const perPage = 100
  const q = {
    ...searchParams,
    page: searchParams.page ? parseInt(searchParams.page) : 1,
    order: searchParams.order ? searchParams.order : "desc",
    sort: searchParams.sort ? searchParams.sort : "updated_at",
  }
  const { page, sort, order, watch_status } = q
  const session = await auth()

  if (!session) return <div className="text-center">please login</div>

  async function fetchFollow() {
    // todo validate sort / order
    let orderBy: Prisma.FollowListOrderByWithRelationInput | Prisma.FollowListOrderByWithRelationInput[] = {}
    if (sort === "year") {
      orderBy = [{ media: { year: order } }, { media: { season: order } }, { media: { created_at: order } }]
    } else if (sort === "score") {
      orderBy = {
        score: {
          sort: order,
          nulls: "last",
        },
      }
    } else if (sort === "created_at") {
      orderBy = {
        created_at: order,
      }
    } else {
      orderBy = {
        updated_at: order,
      }
    }
    const where = {
      user_id: session?.user?.id,
      watch_status,
    }
    const findMany = prisma.followList.findMany({
      where,
      orderBy,
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
        <Filter q={q} name="sort" options={FOLLOWLIST_SORT_OPTIONS} hasOrder />
        <Filter q={q} name="watch_status" options={FOLLOWLIST_WATCH_STATUS_OPTIONS} />
      </div>
      <div className="flex flex-col divide-y">
        {follows.map(f => (
          <div key={f.media_id} className="flex items-center gap-1">
            <Link href={`/anime/${f.media.id}`} className="line-clamp-1">
              {f.media.titles?.ja}
            </Link>
            <div className="ml-auto">
              {f.media.year}-{f.media.season}
            </div>
            <div className="min-w-[70px] max-w-[70px] overflow-clip">
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
