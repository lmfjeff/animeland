"use server"
import prisma from "@/lib/prisma"

export async function search(q, page) {
  const perPage = 20
  const offset = page ? (page - 1) * perPage : 0
  const titlesOrList = ["en", "ja", "en_jp", "zh"].map(lang => ({
    titles: {
      path: [lang],
      string_contains: q,
    },
  }))
  return await prisma.media.findMany({
    take: perPage,
    skip: offset,
    where: {
      OR: titlesOrList,
    },
  })
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
