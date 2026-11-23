ALTER TABLE "ShippingReviewCase"
  ADD COLUMN "evidenceIds" JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN "amountMinor" BIGINT,
  ADD COLUMN "currency" TEXT;
