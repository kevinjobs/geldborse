-- AlterTable
ALTER TABLE "LoginHistory" ADD COLUMN     "deviceFingerprint" TEXT,
ADD COLUMN     "location" TEXT;

-- CreateIndex
CREATE INDEX "LoginHistory_userId_deviceFingerprint_idx" ON "LoginHistory"("userId", "deviceFingerprint");
