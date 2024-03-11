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
    handler: "jobs/anilist-sync-lambda.handler",
    timeout: 900,
    bind: [bus],
  })

  const jikanSyncFunction = new Function(stack, "jikan-sync", {
    handler: "jobs/jikan-sync-lambda.handler",
    timeout: 900,
    bind: [bus],
  })

  const wikiSyncFunction = new Function(stack, "wiki-sync", {
    handler: "jobs/wiki-sync-job.wikiSyncJob",
    timeout: 900,
  })

  const anilistSyncCron = new Cron(stack, "anilistCron", {
    schedule: "cron(0 0 * * ? *)",
    job: anilistSyncFunction,
  })

  const jikanSyncCron = new Cron(stack, "jikanCron", {
    schedule: "cron(0 1 * * ? *)",
    job: jikanSyncFunction,
  })

  const wikiSyncCron = new Cron(stack, "wikiCron", {
    schedule: "cron(0 2 * * ? *)",
    job: wikiSyncFunction,
  })

  bus.addRules(stack, {
    anilistRule: {
      pattern: {
        source: ["anilist-sync-lambda"],
        detailType: ["self-trigger"],
      },
      targets: {
        anilistTarget: anilistSyncFunction,
      },
    },
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
