"use server"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"

// todo add change follow status
export async function follow(media_id, status?: any) {
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
    },
    update: {},
  })
}
