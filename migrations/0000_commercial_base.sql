-- Base schema for NODUS public merchant intake.
-- Apply before 0001_shopify.sql and 0002_commercial_intake.sql.
CREATE TABLE IF NOT EXISTS merchant_leads (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  store_url TEXT NOT NULL,
  monthly_orders TEXT NOT NULL,
  shipping_setup TEXT NOT NULL,
  objective TEXT NOT NULL,
  consent INTEGER NOT NULL DEFAULT 0 CHECK (consent IN (0,1)),
  ip_hash TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  source TEXT NOT NULL DEFAULT 'website'
);
CREATE INDEX IF NOT EXISTS merchant_leads_created_idx
  ON merchant_leads(created_at DESC);

CREATE TABLE IF NOT EXISTS lead_rate_limits (
  key TEXT PRIMARY KEY,
  window_started_at INTEGER NOT NULL,
  count INTEGER NOT NULL DEFAULT 0 CHECK (count >= 0)
);
