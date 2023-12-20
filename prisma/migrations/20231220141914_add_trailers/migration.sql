/*
  Warnings:

  - You are about to drop the column `links` on the `media` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "media" DROP COLUMN "links",
ADD COLUMN     "external_links" JSONB[] DEFAULT ARRAY[]::JSONB[],
ADD COLUMN     "trailers" JSONB[] DEFAULT ARRAY[]::JSONB[];
