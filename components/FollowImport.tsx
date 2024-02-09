"use client"
import { exportFollow, importFollow } from "@/actions/import"
import CustomButton from "./CustomButton"

export default function FollowImport() {
  return (
    <div>
      <form className="flex items-center mb-1 justify-between">
        <input name="import" type="file" />
        <CustomButton className="border" formAction={importFollow}>
          import
        </CustomButton>
      </form>
      <div className="flex justify-end">
        <CustomButton
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
        </CustomButton>
      </div>
    </div>
  )
}
