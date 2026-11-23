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
ALTER TABLE threepl_workspaces ADD COLUMN stripe_checkout_url TEXT;
ALTER TABLE threepl_workspaces ADD COLUMN stripe_checkout_expires_at TEXT;
ALTER TABLE threepl_workspaces ADD COLUMN payment_provider TEXT;
ALTER TABLE threepl_workspaces ADD COLUMN razorpay_plan_id TEXT;
ALTER TABLE threepl_workspaces ADD COLUMN razorpay_subscription_id TEXT;
ALTER TABLE threepl_workspaces ADD COLUMN razorpay_checkout_url TEXT;
ALTER TABLE threepl_workspaces ADD COLUMN razorpay_checkout_expires_at TEXT;
CREATE TABLE IF NOT EXISTS nodus_payment_plans (
  provider TEXT NOT NULL,
  plan_code TEXT NOT NULL,
  provider_plan_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  PRIMARY KEY(provider,plan_code)
);
CREATE TABLE IF NOT EXISTS razorpay_webhook_events (
  event_id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  received_at TEXT NOT NULL
);
