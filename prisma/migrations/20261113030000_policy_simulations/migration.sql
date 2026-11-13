CREATE TABLE "PolicySimulation" (
    "id" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "flatRateMinor" BIGINT NOT NULL,
    "freeShippingThresholdMinor" BIGINT,
    "sampleSize" INTEGER NOT NULL,
    "sampleWindowStart" TIMESTAMP(3),
    "sampleWindowEnd" TIMESTAMP(3),
    "observedShippingRevenueMinor" BIGINT NOT NULL,
    "replayedShippingRevenueMinor" BIGINT NOT NULL,
    "revenueDeltaMinor" BIGINT NOT NULL,
    "assumptions" JSONB NOT NULL,
    "warning" TEXT NOT NULL,
    "engineVersion" TEXT NOT NULL DEFAULT 'v1',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PolicySimulation_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "PolicySimulation_merchantId_createdAt_idx" ON "PolicySimulation"("merchantId", "createdAt");
ALTER TABLE "PolicySimulation" ADD CONSTRAINT "PolicySimulation_merchantId_fkey"
FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
