import { findMany } from "@/actions/media"
import EditTable from "@/components/EditTable"
import Pagination from "@/components/Pagination"

export default async function Edit({ searchParams }) {
  let q = {
    ...searchParams,
    page: searchParams.page ? parseInt(searchParams.page) : 1,
  }
  const [animes, count] = await findMany(q.page)
  const defaultAnimes = animes.map(a => {
    const { id, titles, year, season } = a
    return { id, titles, year, season }
  })

  return (
    <div>
      <Pagination q={q} count={count} perPage={100} />
      <EditTable animes={defaultAnimes} />
    </div>
  )
}
