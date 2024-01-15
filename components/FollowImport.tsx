"use client"

import { importFollow } from "@/actions/import"

export default function FollowImport() {
  return (
    <div className="flex gap-2 items-center">
      <form>
        <input name="import" type="file" />
        <button className="border" formAction={importFollow}>
          import
        </button>
      </form>
    </div>
  )
}
