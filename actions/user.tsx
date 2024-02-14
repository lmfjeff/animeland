"use server"
import prisma from "@/lib/prisma"
import { hash } from "bcryptjs"

export async function createUser(username, password) {
  const existingUser = await prisma.user.findFirst({
    where: {
      username,
    },
  })
  if (existingUser) throw Error("用戶名已被其他人使用")

  const hashedPw = await hash(password, 10)

  await prisma.user.create({
    data: {
      username,
      password: hashedPw,
    },
  })
}
