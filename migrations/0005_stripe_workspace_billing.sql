-- Stripe-backed recurring billing for NODUS Core.
ALTER TABLE threepl_workspaces ADD COLUMN stripe_customer_id TEXT;
ALTER TABLE threepl_workspaces ADD COLUMN stripe_subscription_id TEXT;
ALTER TABLE threepl_workspaces ADD COLUMN stripe_checkout_session_id TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS threepl_workspaces_stripe_subscription_idx ON threepl_workspaces(stripe_subscription_id);
CREATE TABLE IF NOT EXISTS stripe_webhook_events (
  event_id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  received_at TEXT NOT NULL
);
ALTER TABLE threepl_workspaces ADD COLUMN subscription_cancel_at_period_end INTEGER NOT NULL DEFAULT 0;
