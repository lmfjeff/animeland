"use server"
import Papa from "papaparse"

// todo wip
export async function importFollow(data) {
  const file = data.get("import")
  console.log("🚀 ~ importFollow ~ file:", file)
  const result = Papa.parse(file, {})
  console.log(result)
}
