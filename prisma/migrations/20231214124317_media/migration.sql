-- AlterTable
ALTER TABLE "accounts" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "sessions" ADD COLUMN     "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "verificationtokens" ADD COLUMN     "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "media" (
    "id" SERIAL NOT NULL,
    "titles" JSONB NOT NULL,
    "id_external" JSONB,
    "score_external" JSONB,
    "summary" JSONB,
    "day_of_week" JSONB,
    "time" JSONB,
    "start_date" JSONB,
    "end_date" JSONB,
    "images" JSONB[] DEFAULT ARRAY[]::JSONB[],
    "links" JSONB[] DEFAULT ARRAY[]::JSONB[],
    "slug" TEXT,
    "synonyms" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "year" INTEGER,
    "season" INTEGER,
    "country" TEXT,
    "source" TEXT,
    "type" TEXT,
    "format" TEXT,
    "status" TEXT,
    "episodes" INTEGER,
    "nsfw" BOOLEAN NOT NULL DEFAULT false,
    "studios" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "is_hiden" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "genres" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "name" JSONB NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "genres_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "followlist" (
    "media_id" INTEGER NOT NULL,
    "user_id" TEXT NOT NULL,
    "watch_status" TEXT NOT NULL DEFAULT 'watching',
    "score" DOUBLE PRECISION,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "followlist_pkey" PRIMARY KEY ("media_id","user_id")
);

-- CreateTable
CREATE TABLE "_GenreToMedia" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "genres_key_key" ON "genres"("key");

-- CreateIndex
CREATE UNIQUE INDEX "_GenreToMedia_AB_unique" ON "_GenreToMedia"("A", "B");

-- CreateIndex
CREATE INDEX "_GenreToMedia_B_index" ON "_GenreToMedia"("B");

-- AddForeignKey
ALTER TABLE "followlist" ADD CONSTRAINT "followlist_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "media"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "followlist" ADD CONSTRAINT "followlist_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GenreToMedia" ADD CONSTRAINT "_GenreToMedia_A_fkey" FOREIGN KEY ("A") REFERENCES "genres"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GenreToMedia" ADD CONSTRAINT "_GenreToMedia_B_fkey" FOREIGN KEY ("B") REFERENCES "media"("id") ON DELETE CASCADE ON UPDATE CASCADE;
