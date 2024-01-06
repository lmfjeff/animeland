import prisma from "@/lib/prisma"

export async function testJob() {
  const data = await prisma.user.findMany()
  console.log("🚀 ~ file: test-job.ts:5 ~ testJob ~ data:", JSON.stringify(data))
}
