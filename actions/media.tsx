"use server"
import prisma from "@/lib/prisma"
import { Prisma } from "@prisma/client"
import { revalidatePath } from "next/cache"

export async function search(q, page) {
  const perPage = 20
  const offset = page ? (page - 1) * perPage : 0
  const p = "%" + q + "%"
  const selectSql = Prisma.sql`SELECT id FROM public.media where array_to_string(synonyms,'','') ILIKE ${p} OR (titles#>>ARRAY['en']::text[] ILIKE ${p}) OR (titles#>>ARRAY['ja']::text[] ILIKE ${p}) OR (titles#>>ARRAY['en_jp']::text[] ILIKE ${p}) OR (titles#>>ARRAY['zh']::text[] ILIKE ${p}) limit ${perPage} offset ${offset}`
  const countSql = Prisma.sql`SELECT COUNT(*) FROM public.media where array_to_string(synonyms,'','') ILIKE ${p} OR (titles#>>ARRAY['en']::text[] ILIKE ${p}) OR (titles#>>ARRAY['ja']::text[] ILIKE ${p}) OR (titles#>>ARRAY['en_jp']::text[] ILIKE ${p}) OR (titles#>>ARRAY['zh']::text[] ILIKE ${p})`
  const ids: any[] = await prisma.$queryRaw`${selectSql}`
  const count = await prisma.$queryRaw`${countSql}`
  const resp = await prisma.media.findMany({
    where: {
      id: {
        in: ids.map(v => v.id),
      },
    },
    include: { relations: true },
  })
  return [resp, Number(count?.[0]?.count)]
}

// todo integrate into page
export async function findManyBySeason(year, season) {
  await prisma.media.findMany({
    where: {},
  })
}

export async function findMany(page) {
  const perPage = 100
  const media = prisma.media.findMany({
    where: {
      day_of_week: {
        not: Prisma.DbNull,
      },
    },
    orderBy: [{ year: "asc" }, { season: "asc" }, { created_at: "asc" }],
    take: perPage,
    skip: perPage * ((page || 1) - 1),
  })
  const count = prisma.media.count({
    where: {
      day_of_week: {
        not: Prisma.DbNull,
      },
    },
  })
  return await prisma.$transaction([media, count])
}

export async function update(batch) {
  for (const b of batch) {
    const { id, titles } = b
    await prisma.media.update({
      where: { id },
      data: { titles },
    })
  }
  revalidatePath("/edit")
}

// todo integrate into page
export async function findOne(id) {
  return await prisma.media.findUnique({
    where: {
      id,
    },
  })
}
