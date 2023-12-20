export function anilistDateToString(date: { year?: number; month?: number; day?: number }) {
  const { year, month, day } = date
  if (!year || !month || !day) return
  return `${year}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`
}
