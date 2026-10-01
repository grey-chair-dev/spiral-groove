-- One row per customer email we have already sent.
-- Used to collapse Square's burst of order webhooks (several versions, same status)
-- into a single status email. Safe to re-run.
-- The API also creates this table on first use.

CREATE TABLE IF NOT EXISTS email_sends (
  dedupe_key TEXT PRIMARY KEY,
  email_type TEXT NOT NULL,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE email_sends IS 'Claimed customer emails. Primary key is the dedupe key, e.g. order_status_update:ORD-...:PROPOSED';
