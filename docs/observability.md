# Observability (o11y)

Pages go to **alerts@greychair.io**. Logs stay in **Vercel Logs / Observability**.

## Pillars

| Pillar | What we use |
|--------|-------------|
| **Logs** | Structured JSON via `api/_lib/logger.js` → Vercel Runtime Logs |
| **Metrics / alerts** | Vercel per-route 5xx monitors (below) + project-wide 5xx + UptimeRobot on `/api/health` |
| **Email** | `sendSlackAlert` → Resend (`SGR_ALERTS_SMTP_URL`) → alerts@ |

## Critical-path Vercel monitors

Built-in `error_anomaly` filters (`statusGroup:5xx AND route:…`), medium+, team-owner notifications:

| Monitor | Route |
|---------|--------|
| SGR pay 5xx | `/api/pay` |
| SGR Square webhook 5xx | `/api/square/webhook` |
| SGR order status 5xx | `/api/orders/update` |
| SGR health 5xx | `/api/health` |
| SGR contact inquiry 5xx | `/api/contact-inquiry` |
| SGR event inquiry 5xx | `/api/event-inquiry` |
| SGR products 5xx | `/api/products` |
| SGR sendEmail 5xx | `/api/sendEmail` |
| SGR staff picks cron 5xx | `/api/staff-picks-weekly` (also fires on LLM rate-limit/quota → **503**) |

### Staff Picks LLM quota / rate limit

When Anthropic/OpenAI returns rate-limit, insufficient credits/quota, or bad API key:

1. Structured log `event: "staff_picks_llm_failure"` + `llmKind` (`rate_limit` | `quota` | `auth`)
2. Email to **alerts@** (deduped 1h per kind)
3. HTTP **503** so the existing Staff Picks 5xx Vercel monitor can fire
| SGR newsletter cron 5xx | `/api/weekly-newsletter-bulk` |
| SGR catalog sync cron 5xx | `/api/catalog-sync-nightly` |

Also: project-wide **Spiral Groove 5xx errors** + team **Default Alert Rule**.

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
