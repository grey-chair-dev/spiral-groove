# Knowing when something needs fixed

Pages go to **alerts@greychair.io** only — no Slack, no Make.

## 1. App alerts (email)

`sendSlackAlert()` emails `ALERT_EMAIL` (default `alerts@greychair.io`) via SMTP when `SGR_SMTP_URL` (or `ALERTS_SMTP_URL`) is set. Also writes a structured log for Vercel Observability.

Critical paths return **5xx** on real failures so Vercel sees them; card declines stay 4xx.

## 2. Vercel Observability (optional extra)

1. Vercel → `spiral-groove-records` → **Settings → Alerts** (Observability Plus).
2. **Error anomaly** → 5xx.
3. Notifications → **email only** to `alerts@greychair.io` (do not add Slack).

## 3. External uptime (site / DB unreachable)

| Probe | URL | Expect |
|-------|-----|--------|
| Homepage | `https://www.spiralgrooverecords.com/` | HTTP 200 |
| API + DB | `https://www.spiralgrooverecords.com/api/health` | HTTP 200 `{ status: "ok" }` |

Point Better Stack / UptimeRobot at `/api/health` → notify **alerts@greychair.io**. Returns **503** if Neon is down.

## Make.com

**Alerts - Spiral Groove Records** is off. Remove `MAKE_ALERTS_WEBHOOK_URL` from Vercel when convenient.
