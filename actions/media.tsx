"use server"
import prisma from "@/lib/prisma"
import { Prisma } from "@prisma/client"

export async function search(q, page) {
  const perPage = 20
  const offset = page ? (page - 1) * perPage : 0
  const p = "%" + q + "%"
  // todo search synonyms also
  const selectSql = Prisma.sql`SELECT * FROM public.media where (titles#>>ARRAY['en']::text[] ILIKE ${p}) OR (titles#>>ARRAY['ja']::text[] ILIKE ${p}) OR (titles#>>ARRAY['en_jp']::text[] ILIKE ${p}) OR (titles#>>ARRAY['zh']::text[] ILIKE ${p}) limit ${perPage} offset ${offset}`
  const countSql = Prisma.sql`SELECT COUNT(*) FROM public.media where (titles#>>ARRAY['en']::text[] ILIKE ${p}) OR (titles#>>ARRAY['ja']::text[] ILIKE ${p}) OR (titles#>>ARRAY['en_jp']::text[] ILIKE ${p}) OR (titles#>>ARRAY['zh']::text[] ILIKE ${p})`
  // const selectSql2 = Prisma.sql`SELECT * FROM public.media where ANY(ARRAY(synonyms)) ILIKE ${p} limit ${perPage} offset ${offset}`
  const resp = await prisma.$queryRaw`${selectSql}`
  const count = await prisma.$queryRaw`${countSql}`
  return [resp, Number(count?.[0]?.count)]

  // const titlesOrList = ["en", "ja", "en_jp", "zh"].map(lang => ({
  //   titles: {
  //     path: [lang],
  //     string_contains: q,
  //   },
  // }))
  // return await prisma.media.findMany({
  //   take: perPage,
  //   skip: offset,
  //   where: {
  //     OR: titlesOrList,
  //   },
  // })
}

// todo integrate into page
export async function findManyBySeason(year, season) {
  await prisma.media.findMany({
    where: {},
  })
}

// todo integrate into page
export async function findOne(id) {
  return await prisma.media.findUnique({
    where: {
      id,
    },
  })
}
