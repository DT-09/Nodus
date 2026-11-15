CREATE TABLE "ScheduledSyncState" (
  "id" TEXT NOT NULL,
  "merchantId" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'scheduled',
  "nextRunAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "lastRunAt" TIMESTAMP(3),
  "lastSuccessAt" TIMESTAMP(3),
  "failureCount" INTEGER NOT NULL DEFAULT 0,
  "lastError" TEXT,
  "lockedUntil" TIMESTAMP(3),
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ScheduledSyncState_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ScheduledSyncState_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "ScheduledSyncState_merchantId_key" ON "ScheduledSyncState"("merchantId");
CREATE INDEX "ScheduledSyncState_status_nextRunAt_idx" ON "ScheduledSyncState"("status", "nextRunAt");
