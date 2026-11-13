ALTER TABLE "ShippingOrder"
  ADD COLUMN "costCoverageStatus" TEXT NOT NULL DEFAULT 'unknown',
  ADD COLUMN "coverageReviewedAt" TIMESTAMP(3),
  ADD COLUMN "coverageReviewedBy" TEXT;
