import { DIRECT_URL } from "@/constants/env"
import { Cron, EventBus, Function, StackContext } from "sst/constructs"
import fs from "fs"
import path from "path"
import * as lambda from "aws-cdk-lib/aws-lambda"

export function Jobs({ stack, app }: StackContext) {
  if (!app.local) {
    const layerPath = ".sst/layers/prisma"
    fs.rmSync(layerPath, { force: true, recursive: true })
    fs.mkdirSync(layerPath, { recursive: true })
    const toCopy = ["node_modules/.prisma", "node_modules/@prisma/client", "node_modules/prisma/build"]
    for (const file of toCopy) {
      fs.cpSync(file, path.join(layerPath, "nodejs", file), {
        filter: src => !src.endsWith("so.node") || src.includes("linux-arm64"),
        recursive: true,
      })
    }
    const prismaLayer = new lambda.LayerVersion(stack, "PrismaLayer", {
      description: "Prisma engine and library",
      layerVersionName: app.logicalPrefixedName("prisma"),
      code: lambda.Code.fromAsset(path.resolve(layerPath)),
    })
    stack.addDefaultFunctionLayers([prismaLayer])
  }
  stack.setDefaultFunctionProps({
    architecture: "arm_64",
    environment: {
      DATABASE_URL: DIRECT_URL,
      DIRECT_URL: DIRECT_URL,
    },
    nodejs: {
      esbuild: {
        external: app.local ? [] : ["@prisma/client", ".prisma"],
      },
    },
  })

  const bus = new EventBus(stack, "jobEventBus")

  const anilistSyncFunction = new Function(stack, "anilist-sync", {
    handler: "jobs/anilist-sync-job.anilistSyncJob",
    timeout: 900,
  })

  const jikanSyncFunction = new Function(stack, "jikan-sync", {
    handler: "jobs/jikan-sync-lambda.handler",
    timeout: 900,
    bind: [bus],
  })

  const anilistSyncCron = new Cron(stack, "anilistCron", {
    schedule: "cron(0 0 1 * ? *)",
    job: anilistSyncFunction,
  })

  const jikanSyncCron = new Cron(stack, "jikanCron", {
    schedule: "cron(0 1 1 * ? *)",
    job: jikanSyncFunction,
  })

  bus.addRules(stack, {
    jikanRule: {
      pattern: {
        source: ["jikan-sync-lambda"],
        detailType: ["self-trigger"],
      },
      targets: {
        jikanTarget: jikanSyncFunction,
      },
    },
  })
}
