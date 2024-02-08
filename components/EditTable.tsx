"use client"
import { update } from "@/actions/media"
import { cn } from "@/utils/tw"
import { useFieldArray, useForm } from "react-hook-form"

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
          update(batch)
        }
        reset(data)
      })}
      className=""
    >
      <input type="submit" className="border cursor-pointer mb-1" value="batch update" />
      {fields.map((f: any, index) => (
        <div key={f.id} className="flex items-center gap-1 mb-1">
          <div className="w-[50px]">{f.id}</div>
          <div className="w-[calc(50%-50px)] border whitespace-nowrap overflow-hidden">{f.titles?.ja}</div>
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
