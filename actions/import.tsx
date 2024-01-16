"use server"
import { auth } from "@/lib/auth"
import Papa from "papaparse"
import prisma from "@/lib/prisma"

// todo improve
export async function importFollow(data) {
  const session = await auth()
  const file = data.get("import") as File
  const string = await file.text()
  const result = Papa.parse(string, { header: true }) as any
  const batchData = result.data.map(follow => ({
    ...follow,
    media_id: parseInt(follow.media_id),
    score: parseFloat(follow.score),
    user_id: session?.user?.id,
  }))
  await prisma.followList.createMany({
    data: batchData,
    skipDuplicates: true,
  })
}

export async function exportFollow() {
  const session = await auth()
  const follows = await prisma.followList.findMany({
    where: {
      user_id: session?.user?.id,
    },
  })
  const data = Papa.unparse(follows)
  return data
}
