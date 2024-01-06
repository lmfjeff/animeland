import * as sst from "sst/constructs"
import { Site } from "./site"
import { Jobs } from "./jobs"
import { Runtime } from "aws-cdk-lib/aws-lambda"

export const ESM_REQUIRE_SHIM = `await(async()=>{let{dirname:e}=await import("path"),{fileURLToPath:i}=await import("url");if(typeof globalThis.__filename>"u"&&(globalThis.__filename=i(import.meta.url)),typeof globalThis.__dirname>"u"&&(globalThis.__dirname='/var/task'),typeof globalThis.require>"u"){let{default:a}=await import("module");globalThis.require=a.createRequire(import.meta.url)}})();`

export const RUNTIME = Runtime.NODEJS_18_X

export default function main(app: sst.App) {
  app.stack(Site).stack(Jobs)
}
