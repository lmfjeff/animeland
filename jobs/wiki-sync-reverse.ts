import prisma from "@/lib/prisma"
import { Prisma } from "@prisma/client"

async function wikiSyncReverse() {
  const mediaList = await prisma.media.findMany({
    where: {
      titles: {
        path: ["zh"],
        not: Prisma.JsonNull,
      },
    },
  })
  console.log("🚀 ~ wikiSyncReverse ~ mediaList:", mediaList.length)
  let count = 0
  for (const media of mediaList) {
    const { zh, ...rest } = media.titles
    await prisma.media.update({
      where: { id: media.id },
      data: {
        titles: rest,
        external_links: media.external_links.filter(v => v.url !== null && !v.url.includes("zh.wiki")),
      },
    })
    console.log(`${++count} removed: ${zh}`)
  }
}
wikiSyncReverse()
