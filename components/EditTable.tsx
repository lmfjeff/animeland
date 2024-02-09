"use client"
import { update } from "@/actions/media"
import { cn } from "@/utils/tw"
import { useFieldArray, useForm } from "react-hook-form"
import AnimeRow from "./AnimeRow"

export default function EditTable({ animes: OldAnimes }) {
  const { register, handleSubmit, formState, control, reset } = useForm({ defaultValues: { animes: OldAnimes } })
  const { fields } = useFieldArray({
    control,
    name: "animes",
    keyName: "keyId",
  })
  return (
    <form
      onSubmit={handleSubmit(data => {
        const batch = data.animes.filter((d, index) => formState.dirtyFields?.animes?.[index]?.titles?.zh)
        if (batch.length > 0) {
          update(
            batch.map(b => {
              const { id, titles, year, season } = b
              return { id, titles, year, season }
            })
          )
        }
        reset(data)
      })}
      className=""
    >
      <input type="submit" className="border cursor-pointer mb-1" value="batch update" />
      {fields.map((f: any, index) => (
        <div key={f.id} className="flex items-center gap-1 mb-1">
          <AnimeRow anime={f}>
            <div className="w-[50px] border text-center">detail</div>
          </AnimeRow>
          <a
            href={`https://www.google.com/search?q=${f.titles?.ja}`}
            target="_blank"
            className="w-[calc(50%-50px)] border whitespace-nowrap overflow-hidden"
          >
            {f.titles?.ja}
          </a>
          <input
            {...register(`animes.${index}.titles.zh`)}
            autoComplete="off"
            className={cn("w-[calc(50%-50px)] border focus:outline-none", {
              "border-[#67C23A]": formState.dirtyFields?.animes?.[index]?.titles?.zh,
            })}
          ></input>
          <div className="w-[50px]">{f.year}</div>
        </div>
      ))}
    </form>
  )
}
