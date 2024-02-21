import { findMany } from "@/actions/media"
import EditTable from "@/components/EditTable"
import Pagination from "@/components/Pagination"

export default async function Edit({ searchParams }) {
  let q = {
    ...searchParams,
    page: searchParams.page ? parseInt(searchParams.page) : 1,
  }
  const [animes, count] = await findMany(q.page)

  return (
    <div className="flex flex-col gap-1">
      <Pagination q={q} count={count} perPage={100} />
      <EditTable key={JSON.stringify(searchParams)} animes={animes} />
    </div>
  )
}
