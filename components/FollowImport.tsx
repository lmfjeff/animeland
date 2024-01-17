"use client"
import { exportFollow, importFollow } from "@/actions/import"

export default function FollowImport() {
  return (
    <div>
      <form className="flex items-center mb-1 justify-between">
        <input name="import" type="file" />
        <button className="border" formAction={importFollow}>
          import
        </button>
      </form>
      <div className="flex justify-end">
        <button
          className="border"
          onClick={async () => {
            const data = await exportFollow()
            const url = window.URL.createObjectURL(new Blob([data]))
            const link = document.createElement("a")
            link.href = url
            link.setAttribute("download", `${Date.now()}.csv`)
            document.body.appendChild(link)
            link.click()
          }}
        >
          export
        </button>
      </div>
    </div>
  )
}
