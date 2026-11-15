CREATE TABLE "EconomicValueRecord" (
  "id" TEXT NOT NULL,
  "merchantId" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'identified',
  "amountMinor" BIGINT NOT NULL,
  "currency" TEXT NOT NULL,
  "sourceReference" TEXT NOT NULL,
  "realizationReference" TEXT,
  "evidenceNote" TEXT NOT NULL,
  "occurredAt" TIMESTAMP(3),
  "createdBy" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "EconomicValueRecord_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "EconomicValueRecord_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "EconomicValueRecord_merchantId_status_currency_idx" ON "EconomicValueRecord"("merchantId", "status", "currency");
CREATE INDEX "EconomicValueRecord_merchantId_createdAt_idx" ON "EconomicValueRecord"("merchantId", "createdAt");
