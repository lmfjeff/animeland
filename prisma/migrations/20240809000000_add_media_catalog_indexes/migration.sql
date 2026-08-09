-- CreateIndex
CREATE INDEX "idx_media_year_season" ON "media"("year", "season");

-- CreateIndex
CREATE INDEX "idx_media_status_year_season" ON "media"("status", "year", "season");

-- CreateIndex
CREATE INDEX "idx_media_format" ON "media"("format");
