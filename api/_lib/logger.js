/**
 * Structured logger for Vercel Runtime Logs / Observability (o11y).
 *
 * Emits one JSON object per line so Logs search + Log Drains can parse fields.
 * Level filter in the dashboard follows the console method (error/warn/log),
 * not the JSON `level` field — keep those aligned.
 *
 * Callers: api/slackAlerts.js (sendSlackAlert), api/health.js (webHandler).
 * No other shared logger in this repo.
 *
 * User: "can you make sure we follow o11y"
 * Ref: https://vercel.com/kb/guide/add-structured-application-logs-to-vercel-functions
 */
import crypto from 'crypto'

const isDevelopment = process.env.NODE_ENV === 'development'
const enableStackTraces = process.env.ENABLE_STACK_TRACES === 'true'

function line(level, message, data = {}) {
  return JSON.stringify({
    level,
    message,
    timestamp: new Date().toISOString(),
    ...data,
  })
}

export const logger = {
  info(message, data = {}) {
    console.log(line('INFO', message, data))
  },

  warn(message, data = {}) {
    console.warn(line('WARN', message, data))
  },

  /**
   * @returns {string} errorId for client/email correlation
   */
  error(message, error, data = {}) {
    const errorId = crypto.randomUUID()
    console.error(
      line('ERROR', message, {
        errorId,
        errorType: error?.constructor?.name || (error ? 'Error' : undefined),
        errorMessage: error?.message || (typeof error === 'string' ? error : undefined),
        ...data,
      }),
    )
    if ((isDevelopment || enableStackTraces) && error?.stack) {
      console.error(line('ERROR_DETAIL', message, { errorId, stack: error.stack }))
    }
    return errorId
  },
}
