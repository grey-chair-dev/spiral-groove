# Google review replies (in-repo)

**Status: PARKED (2026-11-14)** — GCP project `458093339048` (`spiral-groove-records`) was denied GBP API Basic Access. Reviews stay on `mybusiness.googleapis.com` which is unavailable until Google approves a future re-application. Keep Vercel flag **`googleReviews` off**. Do not enable Make scenarios `4142796` / `4143607` unless Brendan decides otherwise.

Code + cron remain in-repo for a later unpark. OAuth tokens may exist in env; they cannot list/reply to reviews without project approval.

Replaces Make scenarios **Auto Reply Google Reviews** (`4142796`) and **Review Reply** (`4143607`). Those scenarios stay **OFF** while parked.

## Feature flag

Vercel Flags key: **`googleReviews`** (default off).

When off:

- Cron `/api/google-reviews-sync` returns `{ skipped: "flag_off" }`
- `POST /api/google-reviews/reply` returns 403
- `/edit-reply` shows the retired stub

Create the flag in the Vercel Flags dashboard (same place as `subscription`) only when unparking.

## Flow (when unparked)

1. Cron every 15 minutes (`vercel.json`) hits `/api/google-reviews-sync`.
2. Lists recent GBP reviews for the configured location.
3. Skips empty comments and rows already in `google_review_events`.
4. LLM drafts a short owner-voice reply (`STAFF_PICKS_LLM_*`).
5. **4–5 stars:** posts reply via GBP `updateReply`.
6. **1–3 stars:** emails `GOOGLE_REVIEW_ALERT_TO` (default `adam@spiralgrooverecords.com`) with Post + Edit links.
7. Post/Edit use `/edit-reply` and `POST /api/google-reviews/reply` (secret: `GOOGLE_REVIEW_REPLY_SECRET` or `WEBHOOK_SECRET`).

## Unpark checklist

1. Re-apply for [GBP API Basic Access](https://support.google.com/business/contact/api_default) (docs: [prereqs](https://developers.google.com/my-business/content/prereqs)) — prefer Spiral business-domain email that is GBP owner; project number on Dashboard.
2. Quota for My Business APIs shows **300 QPM** (not 0).
3. Enable **Google My Business API** in Cloud Console if it appears; confirm v4 discovery is not 404.
4. Smoke: `curl -sS "$SITE/api/google-reviews-sync?dryRun=1" -H "x-vercel-cron: 1"` with flag on.
5. Only then flip Vercel flag `googleReviews` on.

## OAuth setup (already done locally; redo if rotating)

1. Google Cloud project → enable Account Management + Business Information (+ My Business API after approval).
2. OAuth web client redirect: `http://localhost:3002/api/google-gbp/oauth/callback`
3. Env: `GOOGLE_GBP_CLIENT_ID` / `SECRET` / `REFRESH_TOKEN`
4. Start: `http://localhost:3002/api/google-gbp/oauth/start`

## Env

See `.env.example` (`GOOGLE_GBP_*`). Account/location IDs default to the Make Spiral Groove Milford location.

## Manual smoke

```bash
# Flag off (expected while parked)
curl -sS "$SITE/api/google-reviews-sync"

# Flag on + dry run (only after GBP API approval)
curl -sS "$SITE/api/google-reviews-sync?dryRun=1" -H "x-vercel-cron: 1"
```
