import { SSTConfig } from "sst"
import { NextjsSite } from "sst/constructs"
import {
  DATABASE_URL,
  DIRECT_URL,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  NEXTAUTH_SECRET,
  NEXTAUTH_URL,
  NEXT_PUBLIC_DOTENV,
  NODE_ENV,
} from "./constants/env"

export default {
  config(_input) {
    return {
      name: "animeland",
      region: "ap-northeast-1",
    }
  },
  stacks(app) {
    app.stack(function Site({ stack }) {
      const site = new NextjsSite(stack, "site", {
        environment: {
          NODE_ENV: NODE_ENV,
          DATABASE_URL: DATABASE_URL,
          DIRECT_URL: DIRECT_URL,
          NEXTAUTH_URL: NEXTAUTH_URL,
          NEXTAUTH_SECRET: NEXTAUTH_SECRET,
          GOOGLE_CLIENT_ID: GOOGLE_CLIENT_ID,
          GOOGLE_CLIENT_SECRET: GOOGLE_CLIENT_SECRET,
        },
      })

      stack.addOutputs({
        SiteUrl: site.url,
      })
    })
  },
} satisfies SSTConfig
