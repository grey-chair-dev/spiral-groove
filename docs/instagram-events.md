# Instagram → Events sync

Replaces Make scenario **Events From Instagram** (4018128).

## Flow

1. Daily Vercel Cron `40 22 * * *` → `GET /api/instagram-events-sync`
2. [api-anything](https://github.com/goodnight000/api-anything) `instagram.getPosts` (logged out, ~12 latest posts)
3. LLM extracts Spiral Groove attendable events (same rules as Make)
4. Insert into Neon `events` when fingerprint is new, confidence > 0.5, not recap, artist present

No Meta Graph token. Site already reads events via `/api/events`.

## Env

| Var | Notes |
|---|---|
| `STAFF_PICKS_LLM_API_KEY` / `OPENAI_API_KEY` / `ANTHROPIC_API_KEY` | Required for extraction |
| `INSTAGRAM_USERNAME` | Default `spiral_groove_records_` |
| `INSTAGRAM_EVENTS_TZ` | Default `America/New_York` (relative dates) |
| `INSTAGRAM_EVENTS_DRY_RUN=1` | Log inserts without writing |
| `WEBHOOK_SECRET` | Manual `POST` with `x-webhook-secret` |
| `CRON_SECRET` | Cron `Authorization: Bearer …` when set |

`API_ANYTHING_HOME` defaults to a directory under the OS temp dir (writable on Vercel).

## Manual smoke

```bash
curl -X POST -H "x-webhook-secret: $WEBHOOK_SECRET" \
  "https://www.spiralgrooverecords.com/api/instagram-events-sync?dryRun=1"
```

## Limits

- ~12 posts per run — daily cron is enough if they post regularly
- No post timestamps — LLM uses “today” + caption / accessibility text
- Heavy traffic can trip Instagram’s login wall (`auth` / `blocked` → 503, no retry storm)
