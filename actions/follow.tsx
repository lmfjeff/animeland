"use server"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function follow(media_id: number | string, score?: number | null, watch_status?: string) {
  const session = await auth()
  const user_id = session?.user?.id
  if (!user_id) {
    return { success: false, error: "unauthorized" }
  }

  const numericMediaId = Number(media_id)
  if (isNaN(numericMediaId)) {
    return { success: false, error: "invalid_media_id" }
  }

  const existing = await prisma.followList.findUnique({
    where: {
      media_id_user_id: {
        media_id: numericMediaId,
        user_id,
      },
    },
  })

  if (existing) {
    const dataToUpdate: any = {}
    if (score !== undefined) dataToUpdate.score = score
    if (watch_status !== undefined) dataToUpdate.watch_status = watch_status
    await prisma.followList.update({
      where: {
        media_id_user_id: {
          media_id: numericMediaId,
          user_id,
        },
      },
      data: dataToUpdate,
    })
  } else {
    await prisma.followList.create({
      data: {
        media_id: numericMediaId,
        user_id,
        score: score !== undefined ? score : null,
        watch_status: watch_status !== undefined ? watch_status : "watching",
      },
    })
  }

  revalidatePath("/anime")
  revalidatePath("/follow")
  revalidatePath(`/anime/${numericMediaId}`)
  return { success: true }
}

export async function unfollow(media_id: number | string) {
  const session = await auth()
  const user_id = session?.user?.id
  if (!user_id) {
    return { success: false, error: "unauthorized" }
  }

  const numericMediaId = Number(media_id)
  if (isNaN(numericMediaId)) {
    return { success: false, error: "invalid_media_id" }
  }

  await prisma.followList.deleteMany({
    where: {
      media_id: numericMediaId,
      user_id,
    },
  })
  revalidatePath("/anime")
  revalidatePath("/follow")
  revalidatePath(`/anime/${numericMediaId}`)
  return { success: true }
}
