import { AnimeDetail } from "@/app/anime/[id]/page"
import Backdrop from "@/components/Backdrop"

export default async function AnimeModal({ params }) {
  const { id } = params
  return (
    <div className="fixed z-fixed top-0 left-0 right-0 bottom-0">
      <div className="relative w-full h-full flex items-center">
        <Backdrop />
        <div className="z-modal h-1/2 w-full bg-white overflow-auto">
          <AnimeDetail id={id} />
          {/* todo rate, status button */}
          {/* <div className="bg-blue-500">test</div> */}
        </div>
      </div>
    </div>
  )
}
