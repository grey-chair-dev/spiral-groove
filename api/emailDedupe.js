/**
 * Durable email dedupe.
 *
 * Square emits several order versions at once, and each one can call
 * /api/orders/update with forceEmail. The in-memory map in sendEmail.js
 * does not survive across serverless instances, so those calls all send.
 *
 * Claiming a row in email_sends is atomic: one INSERT wins, the rest conflict.
 */

const CREATE_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS email_sends (
    dedupe_key TEXT PRIMARY KEY,
    email_type TEXT NOT NULL,
    sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )
`

let schemaReady = null

async function defaultQuery(text, params) {
  const { query } = await import('./db.js')
  return query(text, params)
}

async function ensureEmailSendsTable(queryFn) {
  if (!schemaReady) {
    schemaReady = queryFn(CREATE_TABLE_SQL).catch((err) => {
      schemaReady = null
      throw err
    })
  }
  return schemaReady
}

/**
 * Claim the right to send. Only one caller wins for a given key.
 *
 * @param {Object} params
 * @param {string} params.dedupeKey
 * @param {string} params.emailType
 * @param {boolean} [params.replace] - Overwrite an existing claim (intentional resend)
 * @param {Function} [params.queryFn] - Injected for tests
 * @returns {Promise<{ claimed: boolean, reason?: string }>}
 */
export async function claimEmailSend({ dedupeKey, emailType, replace = false, queryFn = defaultQuery }) {
  if (!dedupeKey) return { claimed: true, reason: 'no_key' }

  try {
    await ensureEmailSendsTable(queryFn)
    const result = replace
      ? await queryFn(
          `INSERT INTO email_sends (dedupe_key, email_type, sent_at)
           VALUES ($1, $2, NOW())
           ON CONFLICT (dedupe_key) DO UPDATE
             SET email_type = EXCLUDED.email_type,
                 sent_at = NOW()
           RETURNING dedupe_key`,
          [dedupeKey, emailType || 'email'],
        )
      : await queryFn(
          `INSERT INTO email_sends (dedupe_key, email_type)
           VALUES ($1, $2)
           ON CONFLICT (dedupe_key) DO NOTHING
           RETURNING dedupe_key`,
          [dedupeKey, emailType || 'email'],
        )

    const claimed = Number(result?.rowCount) > 0
    return claimed ? { claimed: true } : { claimed: false, reason: 'deduped' }
  } catch (error) {
    // A ready/complete email is more important than a missed dedupe when Neon is down.
    console.error('[Email Dedupe] Claim failed; sending anyway', error?.message || error)
    return { claimed: true, reason: 'dedupe_unavailable' }
  }
}

/**
 * Drop a claim when the send itself failed, so a later webhook can try again.
 *
 * @param {string} dedupeKey
 * @param {Function} [queryFn]
 */
export async function releaseEmailSend(dedupeKey, queryFn = defaultQuery) {
  if (!dedupeKey) return
  try {
    await queryFn('DELETE FROM email_sends WHERE dedupe_key = $1', [dedupeKey])
  } catch (error) {
    console.error('[Email Dedupe] Release failed', error?.message || error)
  }
}
