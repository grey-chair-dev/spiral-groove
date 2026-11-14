# Observability (o11y)

Pages go to **alerts@greychair.io**. Logs stay in **Vercel Logs / Observability**.

## Pillars

| Pillar | What we use |
|--------|-------------|
| **Logs** | Structured JSON via `api/_lib/logger.js` → Vercel Runtime Logs |
| **Metrics / alerts** | Vercel monitors (Default + Spiral Groove 5xx) + UptimeRobot on `/api/health` |
| **Email** | `sendSlackAlert` → Resend (`SGR_ALERTS_SMTP_URL`) → alerts@ |

## Structured logs (Vercel-aligned)

- One JSON object per `console.*` call (searchable fields).
- `level` matches the console method: `error` / `warn` / `log`.
- Ops alerts emit `event: "ops_alert"` (search Logs for `ops_alert`).
- Health DB failure emits `event: "health_check"` + `errorId`.
- Deduped alerts still log (`deduped: true`) at **warn**; email is skipped.
- Stacks only when `NODE_ENV=development` or `ENABLE_STACK_TRACES=true` (Preview).

Ref: [Vercel structured application logs](https://vercel.com/kb/guide/add-structured-application-logs-to-vercel-functions).

## Where to look

1. Vercel → `spiral-groove-records` → **Logs** → filter `ops_alert` or `level:error`
2. Same project → **Observability** → 5xx / latency
3. Inbox **alerts@greychair.io** for emailed ops alerts
4. UptimeRobot for total outage (Vercel logs won’t fire if the app never runs)

## App alerts

`sendSlackAlert()` always logs; emails when SMTP is set and not deduped.

Critical paths return **5xx** on real failures so Vercel monitors see them; card declines stay 4xx.

## External uptime

| Probe | URL | Expect |
|-------|-----|--------|
| Homepage | `https://www.spiralgrooverecords.com/` | HTTP 200 |
| API + DB | `https://www.spiralgrooverecords.com/api/health` | HTTP 200 `{ status: "ok" }` |

`/api/health` returns **503** (+ structured error log) if Neon is down.

## Make.com

**Alerts - Spiral Groove Records** is off. Remove `MAKE_ALERTS_WEBHOOK_URL` from Vercel when convenient.
