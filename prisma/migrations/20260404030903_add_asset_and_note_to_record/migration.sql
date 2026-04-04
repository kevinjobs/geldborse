-- AlterTable
ALTER TABLE "Record" ADD COLUMN     "assetId" TEXT,
ADD COLUMN     "note" TEXT;

-- CreateIndex
CREATE INDEX "Record_assetId_idx" ON "Record"("assetId");

-- AddForeignKey
ALTER TABLE "Record" ADD CONSTRAINT "Record_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;
