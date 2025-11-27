# Database Migration Workflow

## Overview

Migrations are managed via plain SQL files inside the `migrations/` directory and executed with the custom runner (`npm run db:migrate`). The runner keeps track of which files have been applied in the `schema_migrations` table, so every environment (local, preview, production) stays in sync.

## Applying migrations

```bash
# Apply any pending migrations
npm run db:migrate

# Show applied vs pending migrations
npm run db:migrate:status
```

The runner automatically switches to an Upstash/Redis-backed rate limiter when `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are present, so it is safe to run on multi-instance deployments.

## Creating a new migration

1. Create a new SQL file in `migrations/` using the naming convention `YYYYMMDDHHmm_description.sql`.
2. Add only the DDL required for the change (e.g., `CREATE TABLE`, `ALTER TABLE`, `CREATE INDEX`).
3. Run `npm run db:migrate` locally to verify the script.
4. Commit the SQL file alongside the code that depends on it.

## Ownership notes

The migration user (`app_user`) must own:

- The `schema_migrations` table
- The `update_timestamp()` function

If you initially ran migrations as `neondb_owner`, transfer ownership once (run as the owner):

```sql
ALTER FUNCTION update_timestamp() OWNER TO app_user;
ALTER TABLE schema_migrations OWNER TO app_user;
```

From then on, all migrations can be executed with the limited `app_user` credentials.

## Sensitive environments

For production deployments:

- Export `DATABASE_URL`/`SGR_DATABASE_URL` pointing at the pooled `app_user` connection.
- Use `DATABASE_URL_OWNER` only for rare maintenance tasks, never in application code.
- Keep `.env.local` and `.env` files out of version control; use Vercel’s environment variables UI or your secret manager.

