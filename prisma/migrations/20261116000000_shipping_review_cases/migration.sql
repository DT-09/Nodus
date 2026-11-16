CREATE TABLE "ShippingReviewCase" (
    "id" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "fingerprint" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "explanation" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "note" TEXT,
    "firstSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ShippingReviewCase_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ShippingReviewCase_merchantId_fingerprint_key" ON "ShippingReviewCase"("merchantId", "fingerprint");
CREATE INDEX "ShippingReviewCase_merchantId_status_lastSeenAt_idx" ON "ShippingReviewCase"("merchantId", "status", "lastSeenAt");
ALTER TABLE "ShippingReviewCase" ADD CONSTRAINT "ShippingReviewCase_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
