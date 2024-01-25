"use server"
import { auth } from "@/lib/auth"
import Papa from "papaparse"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

// todo improve
export async function importFollow(data) {
  const session = await auth()
  const user_id = session?.user?.id
  if (!user_id) return

  const file = data.get("import") as File
  const string = await file.text()
  const result = Papa.parse(string, { header: true }) as any
  console.log(`importing follows: ${result.data.length}`)

  // find media id by its external id
  const list: any[] = []
  for (const follow of result.data) {
    const { mal, anilist } = follow
    if (!mal && !anilist) continue
    const orList: any[] = []
    if (mal) {
      orList.push({
        id_external: {
          path: ["mal"],
          equals: parseInt(mal),
        },
      })
    }
    if (anilist) {
      orList.push({
        id_external: {
          path: ["anilist"],
          equals: parseInt(anilist),
        },
      })
    }
    const found = await prisma.media.findFirst({
      where: {
        OR: orList,
      },
    })
    if (found) {
      list.push({
        ...follow,
        media_id: found.id,
      })
    }
  }
  // construct batch data
  const batchData = list.map(follow => {
    const { score, watch_status, created_at, updated_at } = follow
    return {
      score: parseFloat(score),
      watch_status,
      created_at,
      updated_at,
      user_id,
      media_id: parseInt(follow.media_id),
    }
  })
  const resp = await prisma.followList.createMany({
    data: batchData,
    skipDuplicates: true,
  })
  console.log(`imported: ${resp?.count}`)
  revalidatePath("/follow")
}

export async function exportFollow() {
  const session = await auth()
  const follows = await prisma.followList.findMany({
    where: {
      user_id: session?.user?.id,
    },
    include: {
      media: true,
    },
  })
  const list = follows.map(f => {
    const { media, media_id, user_id, ...rest } = f
    return {
      ...rest,
      mal: media.id_external?.mal,
      anilist: media.id_external?.anilist,
    }
  })
  const data = Papa.unparse(list)
  return data
}
