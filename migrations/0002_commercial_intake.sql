-- Commercial intake and payment-state tracking for NODUS.
-- Existing leads remain valid; new fields are safely defaulted.
ALTER TABLE merchant_leads ADD COLUMN offer_type TEXT NOT NULL DEFAULT 'evaluation';
ALTER TABLE merchant_leads ADD COLUMN price_quote TEXT;
ALTER TABLE merchant_leads ADD COLUMN payment_status TEXT NOT NULL DEFAULT 'not_requested';
CREATE INDEX IF NOT EXISTS merchant_leads_created_idx ON merchant_leads(created_at DESC);
CREATE INDEX IF NOT EXISTS merchant_leads_offer_idx ON merchant_leads(offer_type,payment_status);
