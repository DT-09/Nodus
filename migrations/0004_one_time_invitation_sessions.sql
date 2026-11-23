ALTER TABLE threepl_access_tokens ADD COLUMN used_at INTEGER;
ALTER TABLE threepl_access_tokens ADD COLUMN session_hash TEXT;
ALTER TABLE threepl_access_tokens ADD COLUMN session_expires_at INTEGER;
CREATE UNIQUE INDEX IF NOT EXISTS threepl_access_tokens_session_hash_idx ON threepl_access_tokens(session_hash);
INSERT OR IGNORE INTO nodus_schema_migrations(name,applied_at)
VALUES('0004_one_time_invitation_sessions.sql',CURRENT_TIMESTAMP);
