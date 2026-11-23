-- Persistent merchant-owned 3PL billing and performance control.
-- Apply to the NODUS D1 database after 0002_commercial_intake.sql.

ALTER TABLE merchant_leads ADD COLUMN business_name TEXT NOT NULL DEFAULT '';

CREATE TABLE IF NOT EXISTS threepl_workspaces (
  id TEXT PRIMARY KEY,
  business_name TEXT NOT NULL,
  owner_name TEXT NOT NULL,
  owner_email TEXT NOT NULL,
  shop_domain TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  plan_code TEXT,
  trial_activated_at TEXT,
  trial_ends_at TEXT,
  subscription_status TEXT NOT NULL DEFAULT 'none',
  subscription_started_at TEXT,
  subscription_ends_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS threepl_workspaces_owner_email_idx ON threepl_workspaces(owner_email);
CREATE INDEX IF NOT EXISTS threepl_workspaces_status_trial_idx ON threepl_workspaces(status,trial_ends_at);

CREATE TABLE IF NOT EXISTS threepl_providers (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES threepl_workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  external_ref TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(workspace_id,name)
);
CREATE INDEX IF NOT EXISTS threepl_providers_workspace_idx ON threepl_providers(workspace_id,status);

CREATE TABLE IF NOT EXISTS threepl_contracts (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES threepl_workspaces(id) ON DELETE CASCADE,
  provider_id TEXT NOT NULL REFERENCES threepl_providers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  currency TEXT NOT NULL,
  effective_from TEXT NOT NULL,
  effective_to TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  source_file_name TEXT,
  source_hash TEXT,
  confirmed_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS threepl_contracts_workspace_provider_idx ON threepl_contracts(workspace_id,provider_id,effective_from);

CREATE TABLE IF NOT EXISTS threepl_rate_rules (
  id TEXT PRIMARY KEY,
  contract_id TEXT NOT NULL REFERENCES threepl_contracts(id) ON DELETE CASCADE,
  charge_code TEXT NOT NULL,
  unit TEXT NOT NULL,
  pricing TEXT NOT NULL CHECK(pricing IN ('per_unit','fixed')),
  rate_minor TEXT NOT NULL,
  currency TEXT NOT NULL,
  source_row INTEGER NOT NULL,
  effective_from TEXT NOT NULL,
  effective_to TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS threepl_rate_rules_contract_code_idx ON threepl_rate_rules(contract_id,charge_code,effective_from);

CREATE TABLE IF NOT EXISTS threepl_invoices (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES threepl_workspaces(id) ON DELETE CASCADE,
  provider_id TEXT NOT NULL REFERENCES threepl_providers(id) ON DELETE RESTRICT,
  invoice_number TEXT NOT NULL,
  invoice_date TEXT NOT NULL,
  period_start TEXT,
  period_end TEXT,
  due_date TEXT,
  currency TEXT NOT NULL,
  total_minor TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'imported',
  source_file_name TEXT,
  source_hash TEXT,
  imported_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(workspace_id,provider_id,invoice_number)
);
CREATE INDEX IF NOT EXISTS threepl_invoices_workspace_date_idx ON threepl_invoices(workspace_id,invoice_date);
CREATE INDEX IF NOT EXISTS threepl_invoices_workspace_status_idx ON threepl_invoices(workspace_id,status,period_start);

CREATE TABLE IF NOT EXISTS threepl_invoice_lines (
  id TEXT PRIMARY KEY,
  invoice_id TEXT NOT NULL REFERENCES threepl_invoices(id) ON DELETE CASCADE,
  external_line_id TEXT,
  charge_code TEXT NOT NULL,
  description TEXT,
  service_date TEXT,
  quantity TEXT NOT NULL,
  unit TEXT NOT NULL,
  amount_minor TEXT NOT NULL,
  currency TEXT NOT NULL,
  activity_reference TEXT,
  source_row INTEGER NOT NULL,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS threepl_invoice_lines_invoice_code_idx ON threepl_invoice_lines(invoice_id,charge_code);
CREATE INDEX IF NOT EXISTS threepl_invoice_lines_invoice_reference_idx ON threepl_invoice_lines(invoice_id,activity_reference);

CREATE TABLE IF NOT EXISTS threepl_activity_records (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES threepl_workspaces(id) ON DELETE CASCADE,
  provider_id TEXT NOT NULL REFERENCES threepl_providers(id) ON DELETE CASCADE,
  source_system TEXT NOT NULL,
  source_record_id TEXT NOT NULL,
  reference TEXT NOT NULL,
  charge_code TEXT NOT NULL,
  quantity TEXT NOT NULL,
  unit TEXT NOT NULL,
  occurred_at TEXT,
  source_row INTEGER NOT NULL,
  source_file_name TEXT NOT NULL,
  source_hash TEXT NOT NULL,
  created_at TEXT NOT NULL,
  UNIQUE(workspace_id,source_system,source_record_id)
);
CREATE INDEX IF NOT EXISTS threepl_activity_reference_idx ON threepl_activity_records(workspace_id,reference,charge_code);
CREATE INDEX IF NOT EXISTS threepl_activity_date_idx ON threepl_activity_records(workspace_id,occurred_at);

CREATE TABLE IF NOT EXISTS threepl_reconciliation_runs (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES threepl_workspaces(id) ON DELETE CASCADE,
  invoice_id TEXT NOT NULL REFERENCES threepl_invoices(id) ON DELETE CASCADE,
  engine_version TEXT NOT NULL,
  input_hash TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'completed',
  summary_json TEXT NOT NULL,
  created_at TEXT NOT NULL,
  UNIQUE(workspace_id,invoice_id,input_hash)
);
CREATE INDEX IF NOT EXISTS threepl_runs_workspace_date_idx ON threepl_reconciliation_runs(workspace_id,created_at);

CREATE TABLE IF NOT EXISTS threepl_exceptions (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES threepl_workspaces(id) ON DELETE CASCADE,
  invoice_id TEXT NOT NULL REFERENCES threepl_invoices(id) ON DELETE CASCADE,
  run_id TEXT NOT NULL REFERENCES threepl_reconciliation_runs(id) ON DELETE CASCADE,
  invoice_line_id TEXT REFERENCES threepl_invoice_lines(id) ON DELETE SET NULL,
  fingerprint TEXT NOT NULL,
  finding_code TEXT NOT NULL,
  severity TEXT NOT NULL,
  state TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  exposure_minor TEXT,
  currency TEXT NOT NULL,
  explanation TEXT NOT NULL,
  note TEXT,
  evidence_json TEXT NOT NULL,
  assigned_to TEXT,
  due_at TEXT,
  first_seen_at TEXT NOT NULL,
  last_seen_at TEXT NOT NULL,
  resolved_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(workspace_id,fingerprint)
);
CREATE INDEX IF NOT EXISTS threepl_exceptions_workspace_status_idx ON threepl_exceptions(workspace_id,status,severity,last_seen_at);
CREATE INDEX IF NOT EXISTS threepl_exceptions_workspace_invoice_idx ON threepl_exceptions(workspace_id,invoice_id);

CREATE TABLE IF NOT EXISTS threepl_case_events (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES threepl_workspaces(id) ON DELETE CASCADE,
  exception_id TEXT NOT NULL REFERENCES threepl_exceptions(id) ON DELETE CASCADE,
  actor_type TEXT NOT NULL,
  actor_ref TEXT,
  action TEXT NOT NULL,
  detail_json TEXT,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS threepl_case_events_workspace_case_idx ON threepl_case_events(workspace_id,exception_id,created_at);

CREATE TABLE IF NOT EXISTS threepl_period_reports (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES threepl_workspaces(id) ON DELETE CASCADE,
  period_start TEXT NOT NULL,
  period_end TEXT NOT NULL,
  revision INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'draft',
  payload_json TEXT NOT NULL,
  generated_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  UNIQUE(workspace_id,period_start,period_end,revision)
);
CREATE INDEX IF NOT EXISTS threepl_period_reports_workspace_end_idx ON threepl_period_reports(workspace_id,period_end);

CREATE TABLE IF NOT EXISTS threepl_outcomes (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES threepl_workspaces(id) ON DELETE CASCADE,
  exception_id TEXT NOT NULL REFERENCES threepl_exceptions(id) ON DELETE CASCADE,
  outcome_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'identified',
  amount_minor TEXT NOT NULL,
  currency TEXT NOT NULL,
  external_reference TEXT,
  evidence_note TEXT NOT NULL,
  verified_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS threepl_outcomes_workspace_status_idx ON threepl_outcomes(workspace_id,status,currency);
CREATE INDEX IF NOT EXISTS threepl_outcomes_workspace_case_idx ON threepl_outcomes(workspace_id,exception_id);

CREATE TABLE IF NOT EXISTS threepl_access_tokens (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES threepl_workspaces(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  revoked_at INTEGER,
  last_used_at INTEGER,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS threepl_access_tokens_workspace_idx ON threepl_access_tokens(workspace_id,revoked_at,expires_at);

CREATE TABLE IF NOT EXISTS threepl_workspace_events (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES threepl_workspaces(id) ON DELETE CASCADE,
  actor_type TEXT NOT NULL,
  actor_ref TEXT,
  action TEXT NOT NULL,
  detail_json TEXT,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS threepl_workspace_events_workspace_idx ON threepl_workspace_events(workspace_id,created_at);
