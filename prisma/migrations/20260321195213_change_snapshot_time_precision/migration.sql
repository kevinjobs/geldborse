/*
  Warnings:

  - You are about to drop the column `date` on the `DailySnapshot` table. All the data in the column will be lost.
  - Added the required column `snapshotAt` to the `DailySnapshot` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_DailySnapshot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "snapshotAt" DATETIME NOT NULL,
    "accountId" TEXT NOT NULL,
    "assetId" TEXT,
    "amount" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DailySnapshot_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_DailySnapshot" ("accountId", "amount", "assetId", "createdAt", "id", "updatedAt") SELECT "accountId", "amount", "assetId", "createdAt", "id", "updatedAt" FROM "DailySnapshot";
DROP TABLE "DailySnapshot";
ALTER TABLE "new_DailySnapshot" RENAME TO "DailySnapshot";
CREATE INDEX "DailySnapshot_snapshotAt_idx" ON "DailySnapshot"("snapshotAt");
CREATE INDEX "DailySnapshot_accountId_idx" ON "DailySnapshot"("accountId");
CREATE INDEX "DailySnapshot_assetId_idx" ON "DailySnapshot"("assetId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
