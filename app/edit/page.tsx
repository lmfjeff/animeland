import { findMany } from "@/actions/media"
import EditTable from "@/components/EditTable"
import Pagination from "@/components/Pagination"
import { ADMIN_EMAIL } from "@/constants/env"
import { auth } from "@/lib/auth"

export default async function Edit({ searchParams }) {
  const session = await auth()
  if (session && session.user.email == ADMIN_EMAIL) return <div>unauthorized</div>
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
