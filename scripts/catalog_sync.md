### Catalog Sync (Python)

This is a Python port of the Make.com blueprint **“Catalog Sync”** (Square Catalog → Postgres).

#### Install

```bash
python3 -m pip install -r scripts/catalog_sync_requirements.txt
```

#### Required env vars

- **`SQUARE_ACCESS_TOKEN`**: Square access token
- **Postgres DSN**: one of:
  - `PG_DSN`
  - `SGR_DATABASE_URL` (preferred in this repo)
  - `SPR_DATABASE_URL`
  - `DATABASE_URL`

#### Optional env vars (defaults match the blueprint)

- `SQUARE_ENV`: `production` (default) or `sandbox`
- `SQUARE_BASE_URL`: override Square API base URL
- `SQUARE_VERSION`: defaults to `2025-10-16`
- `SQUARE_LOCATION_ID`: defaults to `ATHC6TCDTCHWN`

Optional table overrides:

- `PRODUCTS_TABLE` (default `products`)
- `CATEGORIES_TABLE` (default `categories`)
- `CATALOG_SYNC_RUNS_TABLE` (default `catalog_sync_runs`)

#### Run

```bash
python3 scripts/catalog_sync.py
```

Useful flags:

- `--max-pages N`: fetch N catalog pages in one run (default `1`)
- `--upsert-batch-pages N`: combine N catalog pages into a single DB upsert (default `1`)
- `--rebuild-albums-cache`: after a successful sync, rebuild `albums_cache` via `node scripts/populate-albums-cache.mjs`
- `--state-path PATH`: where to store cursor/reset state (default `scripts/catalog_sync_state.json`)
- `--dry-run`: no DB writes and no state writes

#### State file (Make “datastore” equivalent)

The Make blueprint uses datastore keys:

- `inventory_last_reset_date`
- `catalog_items` (cursor)

This script stores those in a local JSON file (see `--state-path`).

