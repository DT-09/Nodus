-- Durable Stripe billing state. Signed provider webhooks own payment status.
ALTER TABLE merchant_leads ADD COLUMN stripe_customer_id TEXT;
ALTER TABLE merchant_leads ADD COLUMN stripe_subscription_id TEXT;
ALTER TABLE merchant_leads ADD COLUMN stripe_checkout_session_id TEXT;
ALTER TABLE merchant_leads ADD COLUMN stripe_payment_intent_id TEXT;
ALTER TABLE merchant_leads ADD COLUMN updated_at TEXT;
CREATE INDEX IF NOT EXISTS merchant_leads_stripe_subscription_idx ON merchant_leads(stripe_subscription_id);
CREATE TABLE IF NOT EXISTS stripe_webhook_events (
 event_id TEXT PRIMARY KEY,
 event_type TEXT NOT NULL,
 received_at TEXT NOT NULL
);
