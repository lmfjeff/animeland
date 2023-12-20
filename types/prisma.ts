import { Prisma } from "@prisma/client"

export type createMediaInputType =
  | (Prisma.Without<Prisma.MediaCreateInput, Prisma.MediaUncheckedCreateInput> & Prisma.MediaUncheckedCreateInput)
  | (Prisma.Without<Prisma.MediaUncheckedCreateInput, Prisma.MediaCreateInput> & Prisma.MediaCreateInput)

export type updateMediaInputType =
  | (Prisma.Without<Prisma.MediaUpdateInput, Prisma.MediaUncheckedUpdateInput> & Prisma.MediaUncheckedUpdateInput)
  | (Prisma.Without<Prisma.MediaUncheckedUpdateInput, Prisma.MediaUpdateInput> & Prisma.MediaUpdateInput)
