import {
  DATABASE_URL,
  DIRECT_URL,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  NEXTAUTH_SECRET,
  NEXTAUTH_URL,
  NEXT_PUBLIC_DOTENV,
  NODE_ENV,
} from "@/constants/env"
import { NextjsSite, StackContext, use } from "sst/constructs"

export function Site({ stack }: StackContext) {
  const site = new NextjsSite(stack, "Web", {
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
}
