CREATE TABLE IF NOT EXISTS conversion_leads (id TEXT PRIMARY KEY,created_at TEXT NOT NULL,business_name TEXT NOT NULL,name TEXT NOT NULL,email TEXT NOT NULL,store_url TEXT NOT NULL,monthly_sessions TEXT NOT NULL,platform TEXT NOT NULL,issue_category TEXT NOT NULL,timeline TEXT NOT NULL,budget TEXT NOT NULL,symptom TEXT NOT NULL,consent INTEGER NOT NULL CHECK(consent IN (0,1)),ip_hash TEXT,status TEXT NOT NULL DEFAULT 'new');
CREATE INDEX IF NOT EXISTS conversion_leads_created_idx ON conversion_leads(created_at DESC);
CREATE INDEX IF NOT EXISTS conversion_leads_status_idx ON conversion_leads(status,created_at DESC);
INSERT OR IGNORE INTO nodus_schema_migrations(name,applied_at) VALUES('0006_conversion_leads.sql',datetime('now'));
