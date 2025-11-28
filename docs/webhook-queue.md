# Asynchronous ECS Webhook Queue

## Overview

- `/api/ecs/webhooks` validates the ECS signature, snapshots the **raw JSON body**, and enqueues the event into Upstash Redis in <500 ms. When Redis is unavailable (e.g., local dev), it falls back to synchronous processing to keep the workflow unblocked.
- `/api/webhooks/process` is invoked by a Vercel Cron job. It drains batches from Redis, retries each task with exponential backoff, and moves exhausted items into a Dead-Letter Queue (DLQ) for manual inspection.
- Both endpoints run in the Node.js runtime so they can execute heavier logic (database + ECS API calls) without the Edge constraints.

## Environment Variables

| Variable | Description |
| --- | --- |
| `UPSTASH_REDIS_URL` / `UPSTASH_REDIS_TOKEN` | Preferred Upstash credentials (used for rate limiting **and** the queue). |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | Legacy names kept for backward compatibility. |
| `ECS_APPLICATION_ID` | Namespaces the Redis keys (`ecs-webhook-queue:{app_id}`). |
| `WEBHOOK_PROCESS_TOKEN` | Bearer token that the Vercel Cron job uses to call `/api/webhooks/process`. Required in every environment where the worker runs. |
| `WEBHOOK_PROCESS_MAX_ATTEMPTS` | How many in-memory retries the worker performs before DLQ (default `3`). |
| `WEBHOOK_PROCESS_RETRY_DELAY_MS` | Base delay (ms) before the first retry (default `250`). |
| `WEBHOOK_PROCESS_MAX_BACKOFF_MS` | Upper bound for the exponential backoff delay (default `4000`). |
| `WEBHOOK_PROCESS_BACKOFF_JITTER_MS` | Random jitter (ms) added to spread out retries (default `100`). |
| `WEBHOOK_PROCESS_MAX_CONCURRENCY` | Number of webhook tasks processed in parallel (default `4`). |

## Redis Keys

- Queue: `ecs-webhook-queue:{ECS_APPLICATION_ID | 'default'}` (FIFO via `LPUSH` + `RPOP`)
- DLQ: `ecs-webhook-queue-dlq:{ECS_APPLICATION_ID | 'default'}`

Each entry contains:

```json
{
  "id": "uuid",
  "event": "inventory.count.updated",
  "payload": { "...": "..." },
  "rawBody": "{...full ECS payload...}",
  "enqueuedAt": "2025-11-27T18:05:12.000Z",
  "attempts": 0
}
```

DLQ entries add `failedAt` plus a serialized error (`message`, `stack`, `cause`).

## Processor Authentication & Cron

1. Generate a token: `openssl rand -hex 32`
2. Store `WEBHOOK_PROCESS_TOKEN` (and the token) in every Vercel environment.
3. Add a Vercel Cron job:

```json
{
  "path": "/api/webhooks/process",
  "schedule": "*/5 * * * *",
  "requestConfig": {
    "method": "POST",
    "headers": { "Authorization": "Bearer ${WEBHOOK_PROCESS_TOKEN}" }
  }
}
```

The worker responds with `{ processed, failed, pulled, dlqSize }` so observability tools can emit metrics.

## DLQ Operations

- Inspect: `curl "$UPSTASH_REDIS_REST_URL/lrange/${DLQ_KEY}/0/-1" -H "Authorization: Bearer $UPSTASH_REDIS_REST_TOKEN"`
- Requeue (programmatic): call `requeueDeadLetterTask(taskId)` inside a script or REPL (exports from `lib/webhooks/queue`).
- Manual replay: remove the JSON from the DLQ key via Upstash UI/CLI, then `RPUSH` back into the main queue.

Always confirm that downstream logic is idempotent before replaying—processing the same ECS event twice should be a no-op.

## Testing Checklist

- `npm run test __tests__/app/api/ecs/webhooks.test.ts` – validates signature handling + enqueue behavior.
- `npm run test __tests__/app/api/webhooks/process.test.ts` – ensures the worker enforces auth, drains the queue, and moves failures to the DLQ.
- Manual smoke: `curl -X POST /api/webhooks/process -H "Authorization: Bearer $WEBHOOK_PROCESS_TOKEN"` and monitor the logs (`[ECSWebhookWorker]`) for processed counts.

For full context on the business requirements, see the SG-PRD-003 product requirements document.

