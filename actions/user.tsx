"use server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { hash } from "bcryptjs"

async function checkUsername(username) {
  const existingUser = await prisma.user.findFirst({
    where: {
      username,
    },
  })
  if (existingUser) throw Error("用戶名已被其他人使用")
}

export async function createUser(username, password) {
  if (!username || !password) throw "need username & pw"
  await checkUsername(username)
  const hashedPw = await hash(password, 10)
  await prisma.user.create({
    data: {
      username,
      password: hashedPw,
    },
  })
}

export async function setUsernameForUser(username, password) {
  if (!username || !password) throw Error("need username & pw")
  const session = await auth()
  if (!session) return
  await checkUsername(username)
  const hashedPw = await hash(password, 10)
  await prisma.user.update({
    where: { id: session?.user?.id },
    data: { username, password: hashedPw },
  })
}
