-- Cloudflare D1 schema for the Shopify merchant connection.
-- Idempotent so the existing nodus-leads database can adopt the migration safely.
CREATE TABLE IF NOT EXISTS shopify_installs (
 shop TEXT PRIMARY KEY,
 shop_name TEXT,
 token_ciphertext TEXT NOT NULL,
 token_iv TEXT NOT NULL,
 scopes TEXT NOT NULL,
 installed_at TEXT NOT NULL,
 updated_at TEXT NOT NULL,
 uninstalled_at TEXT
);
CREATE TABLE IF NOT EXISTS shopify_oauth_states (
 state_hash TEXT PRIMARY KEY,
 shop TEXT NOT NULL,
 expires_at INTEGER NOT NULL,
 created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS shopify_oauth_states_expiry_idx ON shopify_oauth_states(expires_at);
CREATE TABLE IF NOT EXISTS shopify_sessions (
 token_hash TEXT PRIMARY KEY,
 shop TEXT NOT NULL,
 expires_at INTEGER NOT NULL,
 created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS shopify_sessions_expiry_idx ON shopify_sessions(expires_at);
CREATE INDEX IF NOT EXISTS shopify_sessions_shop_idx ON shopify_sessions(shop);
CREATE TABLE IF NOT EXISTS shopify_orders (
 shop TEXT NOT NULL,
 order_gid TEXT NOT NULL,
 order_name TEXT NOT NULL,
 ordered_at TEXT NOT NULL,
 currency TEXT NOT NULL,
 shipping_amount TEXT NOT NULL,
 taxes_included INTEGER NOT NULL DEFAULT 0,
 source_payload TEXT NOT NULL,
 updated_at TEXT NOT NULL,
 PRIMARY KEY(shop, order_gid)
);
CREATE INDEX IF NOT EXISTS shopify_orders_shop_date_idx ON shopify_orders(shop, ordered_at);
CREATE TABLE IF NOT EXISTS shopify_sync_state (
 shop TEXT PRIMARY KEY,
 cursor TEXT,
 has_more INTEGER NOT NULL DEFAULT 0,
 orders_processed INTEGER NOT NULL DEFAULT 0,
 last_sync_at TEXT,
 last_error TEXT
);
CREATE TABLE IF NOT EXISTS shopify_webhook_receipts (
 webhook_id TEXT PRIMARY KEY,
 shop TEXT NOT NULL,
 topic TEXT NOT NULL,
 received_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS shopify_costs (
 shop TEXT NOT NULL,
 source_system TEXT NOT NULL DEFAULT 'carrier_csv',
 source_record_id TEXT NOT NULL,
 invoice_id TEXT NOT NULL,
 order_reference TEXT,
 tracking_number TEXT,
 currency TEXT NOT NULL,
 amount TEXT NOT NULL,
 cost_type TEXT NOT NULL DEFAULT 'carrier',
 occurred_at TEXT,
 imported_at TEXT NOT NULL,
 PRIMARY KEY(shop,source_system,source_record_id)
);
CREATE INDEX IF NOT EXISTS shopify_costs_shop_order_idx ON shopify_costs(shop,order_reference);
CREATE INDEX IF NOT EXISTS shopify_costs_shop_tracking_idx ON shopify_costs(shop,tracking_number);
