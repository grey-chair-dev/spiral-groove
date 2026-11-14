# Automations that used to run in Make.com

Everything Spiral Groove used Make for now runs in this repo. Until the env vars below are set,
the site keeps using the old Make webhooks, so this can be merged before the cutover.

## Status (2026-11-13)

- Code lives on branch `replace-make-automations` (not yet on production `main`).
- Make **Transactional Emails** still received traffic through 2026-11-11 → do **not** deactivate
  Make email scenarios until `SGR_SMTP_URL` is set and smoked after deploy.
- Make **Usage Cost Backfill** deactivated (no code replacement).
- Production probes: `POST /api/square/webhook` → 405; `GET /api/staff-picks-weekly` → SPA HTML
  until this branch is deployed.

| Was (Make scenario) | Now | Switches on when |
|---|---|---|
| Transactional Emails | `api/sendEmail.js` → `api/_lib/mailer.js` (from spiralgrooverecords@greychair.digital) | `SGR_SMTP_URL` set |
| Contact Us (+ sale alerts) | `api/contact-inquiry.js`, `sendEmail` `sale_alert` → `api/_lib/inquiryMail.js` (from general@greychair.digital) | `SGR_SMTP_URL` set |
| Event Inquiries | `api/event-inquiry.js` → `api/_lib/inquiryMail.js` | `SGR_SMTP_URL` set |
| Alerts - Spiral Groove Records | Vercel Observability + `/api/health` uptime (see `docs/observability.md`); `sendSlackAlert` is log-only | Make Alerts scenario off |
| Inventory Count | `api/square/webhook.js` → `api/_lib/squareEvents.js` | Square subscription points here |
| Order Status Updates | `api/square/webhook.js` → `updateOrderStatus()` in `api/orders/update.js` | Square subscription points here |
| Staff Picks | `api/staff-picks-weekly.js` (Vercel Cron, Mon 07:45 UTC) → `api/_lib/staffPicks.js` | `STAFF_PICKS_LLM_API_KEY` set |
| Usage Cost Backfill | dropped (only tracked Make's own costs) | — |

Tests: `npm test`.

## Env vars (Vercel → spiral-groove → Settings → Environment Variables)

| Var | What |
|---|---|
| `SGR_SMTP_URL` | Resend SMTP: `smtps://resend:<api-key>@smtp.resend.com:465`. From must be on **greychair.digital** (Resend rejects greychair.io). |
| `SGR_MAIL_FROM` / `PROJECTS_MAIL_FROM` | Defaults: spiralgrooverecords@ / general@ on greychair.digital. |
| `PROJECTS_SMTP_URL` | SMTP for store inquiries + sale alerts. Defaults to `SGR_SMTP_URL`. |
| `ALERTS_SMTP_URL`, `ALERT_EMAIL` | Error alerts sender and recipient (default alerts@greychair.io). |
| `CONTACT_INQUIRY_TO`, `EVENT_INQUIRY_TO` | Override the inquiry inboxes (defaults adam@spiralgrooverecords.com, hybridmoments25@gmail.com, as in Make). |
| `EMAIL_SUPPRESS_TO` | Comma list of recipients never sent customer email (default the test inbox Make dropped). |
| `MAIL_DRY_RUN=1` | Log instead of sending. |
| `SQUARE_WEBHOOK_SIGNATURE_KEY` | Signature key of the Square subscription below. Also locks `PATCH /api/orders/update` in production. |
| `SQUARE_WEBHOOK_URL` | Exact URL registered with Square (default `https://spiralgrooverecords.com/api/square/webhook`). |
| `WEBHOOK_SECRET` | Needed to call `/api/orders/update` by hand (`x-webhook-secret`) or POST `/api/staff-picks-weekly`. |
| `STAFF_PICKS_LLM_API_KEY` | OpenAI key (or `OPENAI_API_KEY`). Optional `STAFF_PICKS_LLM_BASE_URL`, `STAFF_PICKS_LLM_MODEL` (default gpt-4.1-mini). |
| `CRON_SECRET` | Optional; when set, crons must send it (Vercel Cron does this automatically). |

## Cutover (one piece at a time; Make keeps working until each step)

1. **Email.** Set `SGR_SMTP_URL` (and `PROJECTS_SMTP_URL` if general@ is a different account), redeploy.
   Submit the contact form with "send me a copy", trigger a test alert, and check a customer email
   (e.g. `node scripts/test-emails.mjs`). Then turn off Make: Transactional Emails, Contact Us,
   Event Inquiries. (Alerts already moved to Vercel Observability — see `docs/observability.md`.)
2. **Square.** Square Developer → the app → Webhooks → add a subscription:
   URL `https://spiralgrooverecords.com/api/square/webhook`, events `inventory.count.updated` and
   `order.fulfillment.updated`, API version as the existing ones. Copy its signature key into
   `SQUARE_WEBHOOK_SIGNATURE_KEY`, redeploy, then **in the same sitting** disable the two old
   subscriptions that point at hook.us2.make.com and turn off Make's Inventory Count + Order Status Updates.
   Send a test event from Square and change a test order's pickup status. From this deploy on,
   `PATCH /api/orders/update` needs `x-webhook-secret`.
   **Race:** once `SQUARE_WEBHOOK_SIGNATURE_KEY` is set, Make's HTTP call to `/api/orders/update`
   gets 401, but Make can still write status via Postgres if the old Square→Make subscription is
   still on. The site then skips email with `status_unchanged`. Disable old Square→Make hooks
   before or immediately with the signature-key deploy.
3. **Staff Picks.** Set `STAFF_PICKS_LLM_API_KEY`, then run once: `curl -X POST -H "x-webhook-secret: $WEBHOOK_SECRET" https://spiralgrooverecords.com/api/staff-picks-weekly`.
   Turn off Make's Staff Picks the same day (the job skips a day that already has picks, but both
   starting at 07:45 could still race).
4. Remove the `MAKE_*` env vars and turn off "Spiral Groove Make Usage Cost Backfill".

## Behaviour changes from the Make versions

- Order status: Square → site directly. Make wrote the status first, then called
  `/api/orders/update` with `forceEmail`; now the status is written once, normalized, and the
  email is sent only when the normalized status changes. RESERVED is stored without email, as before.
- Order status and inventory return 500 on failure so Square retries; failures also alert.
- Square signatures are verified (Make did not).
- Inventory change is measured from the live `albums_cache` count, not the nightly `products` count,
  so the `inventory` log is right when stock changes more than once a day.
- Sale alert email keeps the site's subject ("New order …") instead of Make's fixed "New Sale 🎉".
- The Make "monthly report copy to brendan@greychair.io" route never fired (it filtered on a field the
  site doesn't send) and is not carried over; add the address to `MONTHLY_REPORT_RECIPIENTS` instead.
- Newsletter signups are no longer forwarded to Make (that webhook had no scenario).

## Not changed

- `api/notifyWebhook.js` (`MAKE_WEBHOOK_URL`) still points at Make if that env is set; confirm in
  Vercel before removing. `/edit-reply` is a retired stub (no Make POST).
