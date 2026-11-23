-- Durable operator history for commercial lead lifecycle changes.
CREATE TABLE IF NOT EXISTS merchant_lead_events (
  id TEXT PRIMARY KEY,
  lead_id TEXT NOT NULL REFERENCES merchant_leads(id) ON DELETE CASCADE,
  actor TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('lead_status_changed','payment_status_changed')),
  previous_value TEXT NOT NULL,
  new_value TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS merchant_lead_events_lead_created_idx
  ON merchant_lead_events(lead_id, created_at DESC);
