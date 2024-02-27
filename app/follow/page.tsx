import React from "react"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"
import FollowImport from "@/components/FollowImport"
import { FOLLOWLIST_SORT_OPTIONS, FOLLOWLIST_WATCH_STATUS_OPTIONS, SEASON_LIST } from "@/constants/media"
import Filter from "@/components/Filter"
import { Prisma } from "@prisma/client"
import Pagination from "@/components/Pagination"
import AnimeRow from "@/components/AnimeRow"
import { RateButton, StatusButton } from "@/components/FollowButton"

export default async function Follow({ searchParams }) {
  const perPage = 100
  const q = {
    ...searchParams,
    page: searchParams.page ? parseInt(searchParams.page) : 1,
    order: searchParams.order ? searchParams.order : "desc",
    sort: searchParams.sort ? searchParams.sort : "updated_at",
  }
  const { page, sort, order, watch_status, format } = q
  const session = await auth()

  if (!session) return <div className="text-center">please login</div>

  async function fetchFollow() {
    // todo validate sort / order
    let orderBy: Prisma.FollowListOrderByWithRelationInput | Prisma.FollowListOrderByWithRelationInput[] = {}
    if (sort === "year") {
      orderBy = [{ media: { year: order } }, { media: { season: order } }, { media: { created_at: order } }]
    } else if (sort === "score") {
      orderBy = [
        {
          score: {
            sort: order,
            nulls: "last",
          },
        },
        { media: { year: order } },
        { media: { season: order } },
        { media: { created_at: order } },
      ]
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
      media: {
        format: {
          in: format ? [format.toUpperCase()] : ["TV", "TV_SHORT", "ONA"],
        },
      },
    }
    const findMany = prisma.followList.findMany({
      where,
      orderBy,
      include: {
        media: {
          include: { relations: true },
        },
      },
      take: perPage,
      skip: perPage * ((page || 1) - 1),
    })
    const count = prisma.followList.count({
      where,
    })
    return await prisma.$transaction([findMany, count])
  }
  let [follows, count] = await fetchFollow()
  follows = follows.map(f => ({
    ...f,
    media: {
      ...f.media,
      watch_status: f.watch_status,
      score: f.score,
    },
  })) as any
  return (
    <div className="p-2 flex flex-col grow">
      <FollowImport />
      <Pagination q={q} count={count} perPage={perPage} />
      <div className="flex p-1 gap-1 flex-wrap">
        <Filter q={q} name="sort" options={FOLLOWLIST_SORT_OPTIONS} hasOrder />
        <Filter q={q} name="watch_status" options={FOLLOWLIST_WATCH_STATUS_OPTIONS} />
      </div>
      <div className="flex flex-col divide-y">
        {follows.map(f => (
          <AnimeRow key={f.media_id} anime={f.media}>
            <div className="line-clamp-1 grow">{f.media.titles?.zh || f.media.titles?.ja}</div>
            <div className="whitespace-nowrap">
              {f.media.year}-{f.media.season}
            </div>
            <div className="min-w-[70px] max-w-[70px] overflow-clip">
              <StatusButton animeId={f.media_id} watchStatus={f.watch_status} />
            </div>
            <div className="min-w-[30px]">
              <RateButton animeId={f.media_id} score={f.score} />
            </div>
          </AnimeRow>
        ))}
      </div>
    </div>
  )
}
