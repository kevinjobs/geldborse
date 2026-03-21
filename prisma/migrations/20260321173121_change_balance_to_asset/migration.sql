/*
  Warnings:

  - You are about to drop the column `accountId` on the `Balance` table. All the data in the column will be lost.
  - Added the required column `assetId` to the `Balance` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Balance" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "amount" REAL NOT NULL,
    "recordedAt" DATETIME NOT NULL,
    "assetId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Balance_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Balance" ("amount", "createdAt", "id", "recordedAt", "updatedAt") SELECT "amount", "createdAt", "id", "recordedAt", "updatedAt" FROM "Balance";
DROP TABLE "Balance";
ALTER TABLE "new_Balance" RENAME TO "Balance";
CREATE INDEX "Balance_assetId_idx" ON "Balance"("assetId");
CREATE INDEX "Balance_recordedAt_idx" ON "Balance"("recordedAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
