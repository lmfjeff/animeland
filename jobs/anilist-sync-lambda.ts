import AWS from "aws-sdk"
import { EventBus } from "sst/node/event-bus"
import { anilistSyncJob } from "./anilist-sync-job"

const client = new AWS.EventBridge()

export async function handler(event) {
  const startAt = event?.detail?.start_at
  const page = await anilistSyncJob(startAt)
  if (page) {
    const resp = await client
      .putEvents({
        Entries: [
          {
            EventBusName: EventBus.jobEventBus.eventBusName,
            Source: "anilist-sync-lambda",
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
