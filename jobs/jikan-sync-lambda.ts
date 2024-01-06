import AWS from "aws-sdk"
import { EventBus } from "sst/node/event-bus"
import { jikanSyncJob } from "./jikan-sync-job"

const client = new AWS.EventBridge()

export async function handler(event) {
  const startAt = event?.detail?.start_at
  const page = await jikanSyncJob(startAt)
  if (page) {
    const resp = await client
      .putEvents({
        Entries: [
          {
            EventBusName: EventBus.jobEventBus.eventBusName,
            Source: "jikan-sync-lambda",
            DetailType: "self-trigger",
            Detail: JSON.stringify({
              start_at: page,
            }),
          },
        ],
      })
      .promise()
    console.log(resp)
  }
}
