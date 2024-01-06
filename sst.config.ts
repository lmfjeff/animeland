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
  async stacks(app) {
    const appStacks = await import("./stacks")
    appStacks.default(app)
  },
} satisfies SSTConfig
