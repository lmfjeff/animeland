-- CreateTable
CREATE TABLE IF NOT EXISTS "sync_checkpoints" (
    "job_name" TEXT NOT NULL,
    "last_page" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'idle',
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sync_checkpoints_pkey" PRIMARY KEY ("job_name")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_media_anilist_id" ON "media" (((id_external->>'anilist')::int));

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_media_mal_id" ON "media" (((id_external->>'mal')::int));
