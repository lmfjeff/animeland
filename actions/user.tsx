"use server"
import prisma from "@/lib/prisma"

// todo hash pw
export async function createUser(username, password) {
  await prisma.user.upsert({
    where: {
      username,
    },
    create: {
      username,
      password,
    },
    update: {},
  })
}
