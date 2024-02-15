"use server"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function follow(media_id, score?: any, watch_status?: any) {
  const session = await auth()
  const user_id = session?.user?.id
  if (!user_id) return
  await prisma.followList.upsert({
    where: {
      media_id_user_id: {
        media_id,
        user_id,
      },
    },
    create: {
      media_id,
      user_id,
      score,
      watch_status,
    },
    update: {
      score,
      watch_status,
    },
  })
  revalidatePath("/anime")
}

export async function unfollow(media_id) {
  const session = await auth()
  const user_id = session?.user?.id
  if (!user_id) return
  await prisma.followList.delete({
    where: {
      media_id_user_id: {
        media_id,
        user_id,
      },
    },
  })
  revalidatePath("/anime")
}
