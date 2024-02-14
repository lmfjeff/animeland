-- CreateTable
CREATE TABLE "relations" (
    "relation_target_id" INTEGER NOT NULL,
    "relation_source_id" INTEGER NOT NULL,
    "relation_type" TEXT NOT NULL,

    CONSTRAINT "relations_pkey" PRIMARY KEY ("relation_target_id","relation_source_id")
);

-- AddForeignKey
ALTER TABLE "relations" ADD CONSTRAINT "relations_relation_target_id_fkey" FOREIGN KEY ("relation_target_id") REFERENCES "media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "relations" ADD CONSTRAINT "relations_relation_source_id_fkey" FOREIGN KEY ("relation_source_id") REFERENCES "media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
