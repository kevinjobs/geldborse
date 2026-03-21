-- CreateTable
CREATE TABLE "DailySnapshot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "accountId" TEXT NOT NULL,
    "assetId" TEXT,
    "amount" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DailySnapshot_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "DailySnapshot_date_idx" ON "DailySnapshot"("date");

-- CreateIndex
CREATE INDEX "DailySnapshot_accountId_idx" ON "DailySnapshot"("accountId");

-- CreateIndex
CREATE INDEX "DailySnapshot_assetId_idx" ON "DailySnapshot"("assetId");

-- CreateIndex
CREATE UNIQUE INDEX "DailySnapshot_date_accountId_assetId_key" ON "DailySnapshot"("date", "accountId", "assetId");
