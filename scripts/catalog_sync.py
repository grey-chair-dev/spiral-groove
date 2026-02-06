#!/usr/bin/env python3
"""
Replicates the Make.com "Catalog Sync" scenario (Square Catalog -> Postgres) from:
  "Catalog Sync.blueprint (2).json"

What it does (mirrors the blueprint):
1) Daily reset: if last_reset_date != today, clear the saved catalog cursor
2) Fetch one catalog page from Square:
   - POST /v2/catalog/search (ITEMs, include_related_objects, limit=100, optional cursor)
   - Persist the returned cursor (if any)
3) Upsert products into Postgres from returned Square objects
4) Fetch inventory counts (batch retrieve) for the most recently synced variations (limit 1000)
5) Update products.stock_count from the inventory counts
6) Update products.image_url from related IMAGE objects
7) (Best effort) Denormalize category IDs -> category names via categories table
8) (Best effort) Insert a run row into catalog_sync_runs

State storage:
- Make uses a "datastore" with keys:
  - inventory_last_reset_date
  - catalog_items (cursor)
- This script stores those keys in a local JSON file (default: scripts/catalog_sync_state.json).

Env vars:
- SQUARE_ACCESS_TOKEN (required)
- SQUARE_ENV: "production" | "sandbox" (default: production)
- SQUARE_BASE_URL: override base URL (optional)
- SQUARE_VERSION: Square-Version header (default: 2025-10-16)  # from blueprint
- SQUARE_LOCATION_ID: location for inventory (default: ATHC6TCDTCHWN)  # from blueprint
- PG_DSN: Postgres connection string (optional; falls back to SGR_DATABASE_URL, SPR_DATABASE_URL, DATABASE_URL)

Optional env vars for table names:
- PRODUCTS_TABLE (default: products)
- CATEGORIES_TABLE (default: categories)
- CATALOG_SYNC_RUNS_TABLE (default: catalog_sync_runs)

Usage:
  python3 scripts/catalog_sync.py
  python3 scripts/catalog_sync.py --max-pages 10
  python3 scripts/catalog_sync.py --state-path /tmp/catalog_state.json
"""

from __future__ import annotations

import argparse
import datetime as dt
import json
import os
import re
import sys
import time
import traceback
import subprocess
from dataclasses import dataclass
from typing import Any, Dict, List, Optional, Tuple

import requests

try:
    import psycopg  # type: ignore
except Exception as e:  # pragma: no cover
    psycopg = None  # type: ignore
    _PSYCOPG_IMPORT_ERROR = e


IDENT_RE = re.compile(r"^[A-Za-z_][A-Za-z0-9_]*$")

def _repo_root() -> str:
    # scripts/catalog_sync.py -> repo root
    return os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))


def _load_env_file(path: str) -> None:
    """
    Minimal .env loader (no external deps).
    - Does NOT overwrite existing environment variables.
    - Supports lines like:
        KEY=value
        export KEY=value
      with optional single/double quotes.
    """
    try:
        with open(path, "r", encoding="utf-8") as f:
            for raw in f:
                line = raw.strip()
                if not line or line.startswith("#"):
                    continue
                if line.startswith("export "):
                    line = line[len("export ") :].lstrip()
                if "=" not in line:
                    continue
                key, val = line.split("=", 1)
                key = key.strip()
                if not key or not IDENT_RE.match(key):
                    continue
                if key in os.environ:
                    continue
                val = val.strip()
                # Strip matching quotes
                if len(val) >= 2 and ((val[0] == val[-1]) and val[0] in ("'", '"')):
                    val = val[1:-1]
                os.environ[key] = val
    except FileNotFoundError:
        return


def load_repo_dotenv() -> None:
    """
    Mirrors the repo's Node scripts behavior:
    - load .env.local first, then .env
    """
    root = _repo_root()
    _load_env_file(os.path.join(root, ".env.local"))
    _load_env_file(os.path.join(root, ".env"))

def _truncate(s: str, n: int) -> str:
    if len(s) <= n:
        return s
    return s[: max(0, n - 1)] + "…"


def _ident(name: str) -> str:
    """
    Safely format SQL identifiers (table names) from trusted env/config.
    Only allows simple identifiers (no schema, no quoting).
    """
    if not name or not IDENT_RE.match(name):
        raise ValueError(f"Unsafe SQL identifier: {name!r}")
    return name


def _utc_today_str() -> str:
    return dt.datetime.now(dt.timezone.utc).date().isoformat()


def _load_json_file(path: str) -> Dict[str, Any]:
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        return {}


def _atomic_write_json(path: str, payload: Dict[str, Any]) -> None:
    tmp = f"{path}.tmp"
    os.makedirs(os.path.dirname(path) or ".", exist_ok=True)
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2, sort_keys=True)
        f.write("\n")
    os.replace(tmp, path)


@dataclass(frozen=True)
class Config:
    square_access_token: str
    square_base_url: str
    square_version: str
    square_location_id: str
    pg_dsn: str
    state_path: str
    products_table: str
    categories_table: str
    catalog_sync_runs_table: str
    dry_run: bool
    max_pages: int
    upsert_batch_pages: int
    timeout_s: int
    item_id: Optional[str]
    rebuild_albums_cache: bool


def _get_env(name: str) -> Optional[str]:
    v = os.environ.get(name)
    if v is None:
        return None
    v = v.strip()
    return v or None

def _truthy_env(name: str, default: bool = False) -> bool:
    v = _get_env(name)
    if v is None:
        return default
    return v.lower() in ("1", "true", "yes", "y", "on")


def _resolve_pg_dsn() -> Optional[str]:
    return (
        _get_env("PG_DSN")
        or _get_env("SGR_DATABASE_URL")
        or _get_env("SPR_DATABASE_URL")
        or _get_env("DATABASE_URL")
    )


def _resolve_square_base_url() -> str:
    override = _get_env("SQUARE_BASE_URL")
    if override:
        return override.rstrip("/")
    env = (_get_env("SQUARE_ENV") or "production").lower()
    if env in ("prod", "production"):
        return "https://connect.squareup.com"
    if env in ("sandbox",):
        return "https://connect.squareupsandbox.com"
    raise ValueError("SQUARE_ENV must be 'production' or 'sandbox' (or set SQUARE_BASE_URL)")

def _compute_alert_code(stage: str, err: Exception) -> str:
    """
    Stable, short alert codes for email/slack triage.
    Keep these human-readable (not hashes).
    """
    msg = str(getattr(err, "message", "") or str(err) or "").lower()

    if "square" in stage:
        if "401" in msg or "403" in msg or "unauthorized" in msg or "forbidden" in msg:
            return "SYNC-SQUARE-AUTH"
        if "429" in msg or "rate" in msg:
            return "SYNC-SQUARE-RATE"
        return "SYNC-SQUARE-API"

    if "db" in stage or "postgres" in stage:
        if "bad record mac" in msg or ("ssl" in msg) or ("tls" in msg):
            return "SYNC-DB-SSL"
        if "timeout" in msg or "timed out" in msg:
            return "SYNC-DB-TIMEOUT"
        if "could not connect" in msg or "connection" in msg or "server closed" in msg:
            return "SYNC-DB-CONN"
        return "SYNC-DB-QUERY"

    if "category" in stage:
        return "SYNC-CATEGORIES"

    if "image" in stage:
        return "SYNC-IMAGES"

    if "albums_cache" in stage or "albums" in stage:
        return "SYNC-ALBUMS-CACHE"

    return "SYNC-UNKNOWN"


def _send_make_alert_email(
    *,
    alert_code: str,
    title: str,
    error: str,
    context: Dict[str, Any],
    stack: Optional[str],
    severity: str,
) -> None:
    """
    Best-effort webhook to the existing Make alerts pipeline.
    It is responsible for sending Slack + email. We include the alert code in multiple places.
    """
    webhook_url = _get_env("MAKE_ALERTS_WEBHOOK_URL")
    if not webhook_url:
        return

    enabled = _truthy_env("ALERT_ENABLED", default=False) or _truthy_env("SLACK_ALERT_ENABLED", default=False)
    # If it's configured at all, allow it in local runs; but still keep an opt-in switch.
    if not enabled and (os.environ.get("NODE_ENV") != "production"):
        return

    now = dt.datetime.now(dt.timezone.utc).isoformat()
    safe_context = dict(context or {})
    safe_context["alertCode"] = alert_code

    html = (
        "<html><body style=\"font-family: ui-sans-serif, system-ui;\">"
        f"<h2>[{alert_code}] Catalog Sync Alert</h2>"
        f"<p><strong>Severity:</strong> {severity}</p>"
        f"<p><strong>Title:</strong> {_truncate(title, 200)}</p>"
        f"<p><strong>Error:</strong> {_truncate(error, 2000)}</p>"
        "<h3>Context</h3>"
        f"<pre>{json.dumps(safe_context, indent=2, sort_keys=True)[:8000]}</pre>"
        + (f"<h3>Stack</h3><pre>{_truncate(stack, 12000)}</pre>" if stack else "")
        + f"<p style=\"color:#666;font-size:12px;\">Timestamp: {now}</p>"
        "</body></html>"
    )

    payload = {
        "event": "sync.error",
        "timestamp": now,
        "env": os.environ.get("NODE_ENV") or "development",
        "severity": severity,
        # Match Make alert shape expectations as closely as possible
        "statusCode": 500,
        "method": "SYNC",
        "endpoint": "scripts/catalog_sync.py",
        # Put code right up front in the message subject/title
        "title": f"[{alert_code}] {title}",
        "summary": f"[{alert_code}] {error}",
        "error": f"[{alert_code}] {error}",
        "errorFingerprint": alert_code,
        "context": safe_context,
        "stack": stack,
        "stackTrace": stack,
        "html": html,
    }

    try:
        requests.post(webhook_url, json=payload, timeout=15).raise_for_status()
    except Exception:
        # Never fail the sync because alerts couldn't be sent.
        return


def _rebuild_albums_cache(cfg: Config) -> Dict[str, Any]:
    """
    Runs the existing Node script to rebuild albums_cache.
    Returns a small structured result for logging/JSON output.
    """
    cmd = ["node", os.path.join("scripts", "populate-albums-cache.mjs")]
    try:
        proc = subprocess.run(
            cmd,
            cwd=_repo_root(),
            text=True,
            capture_output=True,
            timeout=60 * 15,  # 15 minutes
            check=False,
        )
        out = (proc.stdout or "") + ("\n" + proc.stderr if proc.stderr else "")
        return {
            "attempted": True,
            "ok": proc.returncode == 0,
            "exit_code": proc.returncode,
            "output_tail": _truncate(out.strip(), 4000),
        }
    except FileNotFoundError as e:
        return {"attempted": True, "ok": False, "reason": "node_not_found", "error": str(e)}
    except subprocess.TimeoutExpired:
        return {"attempted": True, "ok": False, "reason": "timeout"}
    except Exception as e:
        return {"attempted": True, "ok": False, "reason": "exception", "error": str(e)}


def load_config(argv: Optional[List[str]] = None) -> Config:
    # Allow running without manually exporting env vars, just like the Node scripts.
    load_repo_dotenv()

    p = argparse.ArgumentParser(description="Square catalog -> Postgres sync (Make blueprint replica)")
    p.add_argument("--state-path", default=os.path.join("scripts", "catalog_sync_state.json"))
    p.add_argument("--dry-run", action="store_true", help="Do not write to Postgres or state file")
    p.add_argument("--max-pages", type=int, default=1, help="How many catalog pages to fetch this run")
    p.add_argument(
        "--upsert-batch-pages",
        type=int,
        default=1,
        help="How many catalog pages to combine into one DB upsert (default: 1).",
    )
    p.add_argument(
        "--item-id",
        type=str,
        default=None,
        help="Sync a single Square ITEM by id (does not read/write cursor state).",
    )
    p.add_argument(
        "--rebuild-albums-cache",
        action="store_true",
        help="After a successful sync, run node scripts/populate-albums-cache.mjs to refresh albums_cache.",
    )
    p.add_argument("--timeout-s", type=int, default=30, help="HTTP timeout seconds")
    args = p.parse_args(argv)

    token = _get_env("SQUARE_ACCESS_TOKEN")
    if not token:
        raise SystemExit("Missing env var: SQUARE_ACCESS_TOKEN")

    pg_dsn = _resolve_pg_dsn()
    if not pg_dsn:
        raise SystemExit("Missing Postgres DSN (set PG_DSN or SGR_DATABASE_URL/SPR_DATABASE_URL/DATABASE_URL)")

    products_table = _ident(_get_env("PRODUCTS_TABLE") or "products")
    categories_table = _ident(_get_env("CATEGORIES_TABLE") or "categories")
    runs_table = _ident(_get_env("CATALOG_SYNC_RUNS_TABLE") or "catalog_sync_runs")

    return Config(
        square_access_token=token,
        square_base_url=_resolve_square_base_url(),
        square_version=_get_env("SQUARE_VERSION") or "2025-10-16",
        square_location_id=_get_env("SQUARE_LOCATION_ID") or "ATHC6TCDTCHWN",
        pg_dsn=pg_dsn,
        state_path=os.path.abspath(args.state_path),
        products_table=products_table,
        categories_table=categories_table,
        catalog_sync_runs_table=runs_table,
        dry_run=bool(args.dry_run),
        max_pages=max(1, int(args.max_pages)),
        upsert_batch_pages=max(1, int(args.upsert_batch_pages)),
        timeout_s=max(5, int(args.timeout_s)),
        item_id=(args.item_id.strip() if isinstance(args.item_id, str) and args.item_id.strip() else None),
        rebuild_albums_cache=bool(args.rebuild_albums_cache),
    )


class SquareClient:
    def __init__(self, cfg: Config):
        self.cfg = cfg
        self.session = requests.Session()
        self.session.headers.update(
            {
                "Authorization": f"Bearer {cfg.square_access_token}",
                "Content-Type": "application/json",
                "Square-Version": cfg.square_version,
            }
        )

    def _request_json(self, method: str, path: str, *, json_body: Optional[dict] = None) -> dict:
        url = f"{self.cfg.square_base_url}{path}"
        # Basic retry on rate limit / transient errors.
        last_err: Optional[Exception] = None
        for attempt in range(1, 6):
            try:
                resp = self.session.request(
                    method,
                    url,
                    json=json_body,
                    timeout=self.cfg.timeout_s,
                )
                if resp.status_code in (429, 500, 502, 503, 504):
                    # exponential-ish backoff with cap
                    delay = min(10.0, 0.75 * (2 ** (attempt - 1)))
                    time.sleep(delay)
                    continue
                resp.raise_for_status()
                return resp.json()
            except Exception as e:
                last_err = e
                time.sleep(min(5.0, 0.25 * attempt))
        raise RuntimeError(f"Square request failed after retries: {method} {path}: {last_err}") from last_err

    def catalog_search_items(self, *, cursor: Optional[str]) -> dict:
        body: Dict[str, Any] = {
            "object_types": ["ITEM"],
            "include_related_objects": True,
            "limit": 100,
        }
        if cursor:
            body["cursor"] = cursor
        return self._request_json("POST", "/v2/catalog/search", json_body=body)

    def catalog_list_categories(self, *, cursor: Optional[str]) -> dict:
        # List endpoint uses query string; easiest is to pass via params.
        url = f"{self.cfg.square_base_url}/v2/catalog/list"
        params: Dict[str, Any] = {"types": "CATEGORY"}
        if cursor:
            params["cursor"] = cursor

        last_err: Optional[Exception] = None
        for attempt in range(1, 6):
            try:
                resp = self.session.get(url, params=params, timeout=self.cfg.timeout_s)
                if resp.status_code in (429, 500, 502, 503, 504):
                    delay = min(10.0, 0.75 * (2 ** (attempt - 1)))
                    time.sleep(delay)
                    continue
                resp.raise_for_status()
                return resp.json()
            except Exception as e:
                last_err = e
                time.sleep(min(5.0, 0.25 * attempt))
        raise RuntimeError(f"Square request failed after retries: GET /v2/catalog/list: {last_err}") from last_err

    def _request_json_get(self, path: str, *, params: Optional[dict] = None) -> dict:
        url = f"{self.cfg.square_base_url}{path}"
        last_err: Optional[Exception] = None
        for attempt in range(1, 6):
            try:
                resp = self.session.get(url, params=params, timeout=self.cfg.timeout_s)
                if resp.status_code in (429, 500, 502, 503, 504):
                    delay = min(10.0, 0.75 * (2 ** (attempt - 1)))
                    time.sleep(delay)
                    continue
                resp.raise_for_status()
                return resp.json()
            except Exception as e:
                last_err = e
                time.sleep(min(5.0, 0.25 * attempt))
        raise RuntimeError(f"Square request failed after retries: GET {path}: {last_err}") from last_err

    def catalog_get_object(self, object_id: str, *, include_related_objects: bool = True) -> dict:
        params = {"include_related_objects": "true" if include_related_objects else "false"}
        return self._request_json_get(f"/v2/catalog/object/{object_id}", params=params)

    def batch_inventory_counts(self, *, catalog_object_ids: List[str]) -> dict:
        body = {
            "catalog_object_ids": catalog_object_ids,
            "location_ids": [self.cfg.square_location_id],
            "states": ["IN_STOCK"],
        }
        return self._request_json("POST", "/v2/inventory/counts/batch-retrieve", json_body=body)


def _is_retryable_db_error(err: Exception) -> bool:
    """
    Neon + psycopg can occasionally throw transient connection/SSL errors
    (e.g. "SSL error: ... bad record mac"). In those cases, reconnecting and
    retrying the page is usually enough.
    """
    msg = str(getattr(err, "message", "") or str(err) or "").lower()
    code = getattr(err, "sqlstate", None) or getattr(err, "pgcode", None) or getattr(err, "code", None)

    if code in ("57P01",):  # admin shutdown
        return True

    retry_substrings = (
        "bad record mac",
        "ssl",
        "tls",
        "consuming input failed",
        "connection terminated",
        "connection is lost",
        "connection closed",
        "socket hang up",
        "econnreset",
        "timed out",
        "timeout",
        "server closed the connection",
        "broken pipe",
    )
    return any(s in msg for s in retry_substrings)


def _connect_pg(cfg: Config):
    # Keep options minimal; Neon DSNs typically include sslmode=require already.
    return psycopg.connect(cfg.pg_dsn, autocommit=False, connect_timeout=20)  # type: ignore


def _safe_rollback(conn: Any) -> None:
    try:
        conn.rollback()
    except Exception:
        # If the connection is dead, rollback itself can throw.
        pass


def _safe_close(conn: Any) -> None:
    try:
        conn.close()
    except Exception:
        pass


UPSERT_PRODUCTS_SQL_TEMPLATE = """
WITH payload AS (
  SELECT (%s)::jsonb AS j
),
items AS (
  SELECT i.*
  FROM payload p
  CROSS JOIN LATERAL jsonb_array_elements(p.j) AS obj
  CROSS JOIN LATERAL jsonb_to_record(obj) AS i(
    type text,
    id text,
    image_id text,
    is_deleted boolean,
    updated_at timestamptz,
    created_at timestamptz,
    version bigint,
    item_data jsonb
  )
  WHERE i.type = 'ITEM'
),
variations AS (
  SELECT
    it.id AS square_item_id,
    -- Square frequently stores item images in item_data.image_ids (array) rather than top-level image_id.
    COALESCE(
      it.image_id,
      NULLIF(it.item_data->'image_ids'->>0, '')
    ) AS square_image_id,
    it.is_deleted,
    it.updated_at,
    it.created_at,
    it.item_data,
    v.value AS variation_obj
  FROM items it
  CROSS JOIN LATERAL jsonb_array_elements(it.item_data->'variations') v(value)
),
rows AS (
  SELECT
    (variation_obj->>'id')::text                                          AS square_variation_id,
    square_item_id                                                        AS square_item_id,
    (item_data->>'name')::text                                            AS name,
    (variation_obj->'item_variation_data'->>'name')::text                 AS variation_name,
    NULLIF(
      COALESCE(
        item_data->>'description_plaintext',
        item_data->>'description',
        item_data->>'description_html'
      ),
      ''
    )::text                                                               AS description,
    NULLIF(variation_obj->'item_variation_data'->'price_money'->>'amount','')::bigint
                                                                          AS price_cents,
    COALESCE(
      NULLIF(item_data->>'category_id', ''),
      NULLIF(item_data->'reporting_category'->>'id', ''),
      NULLIF(item_data->'categories'->0->>'id', '')
    )                                                                     AS category,
    COALESCE(
      NULLIF(item_data->'reporting_category'->>'id', ''),
      NULLIF(item_data->>'category_id', ''),
      NULLIF(item_data->'categories'->0->>'id', '')
    )                                                                     AS reporting_category,
    COALESCE(
      -- Preferred: Square supports multiple categories on item_data.categories[]
      (
        SELECT array_agg(NULLIF(c->>'id','')::text)
        FROM jsonb_array_elements(item_data->'categories') AS c
        WHERE NULLIF(c->>'id','') IS NOT NULL
      )::text[],
      -- Fallback: at least keep the reporting category so denormalization runs and we don't wipe existing data.
      CASE
        WHEN COALESCE(
          NULLIF(item_data->'reporting_category'->>'id', ''),
          NULLIF(item_data->>'category_id', ''),
          NULLIF(item_data->'categories'->0->>'id', '')
        ) IS NOT NULL
        THEN ARRAY[
          COALESCE(
            NULLIF(item_data->'reporting_category'->>'id', ''),
            NULLIF(item_data->>'category_id', ''),
            NULLIF(item_data->'categories'->0->>'id', '')
          )::text
        ]::text[]
        ELSE NULL::text[]
      END
    )                                                                     AS all_categories,
    square_image_id                                                       AS square_image_id,
    0::int                                                                AS stock_count,
    updated_at                                                            AS updated_at,
    created_at                                                            AS created_at,
    now()                                                                 AS synced_at
  FROM variations
  WHERE variation_obj->>'type' = 'ITEM_VARIATION'
),
upsert AS (
  INSERT INTO {products_table} (
    square_variation_id,
    square_item_id,
    name,
    variation_name,
    description,
    price_cents,
    category,
    reporting_category,
    all_categories,
    square_image_id,
    stock_count,
    updated_at,
    created_at,
    synced_at
  )
  SELECT
    square_variation_id,
    square_item_id,
    name,
    variation_name,
    description,
    price_cents,
    category,
    reporting_category,
    all_categories,
    square_image_id,
    stock_count,
    updated_at,
    created_at,
    synced_at
  FROM rows
  WHERE square_variation_id IS NOT NULL
  ON CONFLICT (square_variation_id) DO UPDATE
  SET
    square_item_id  = EXCLUDED.square_item_id,
    name            = EXCLUDED.name,
    variation_name  = EXCLUDED.variation_name,
    description     = EXCLUDED.description,
    price_cents     = EXCLUDED.price_cents,
    category        = COALESCE(EXCLUDED.category, {products_table}.category),
    reporting_category = COALESCE(EXCLUDED.reporting_category, {products_table}.reporting_category),
    all_categories  = COALESCE(EXCLUDED.all_categories, {products_table}.all_categories),
    square_image_id = EXCLUDED.square_image_id,
    stock_count     = EXCLUDED.stock_count,
    updated_at      = EXCLUDED.updated_at,
    synced_at       = EXCLUDED.synced_at
  RETURNING (xmax = 0) AS inserted
)
SELECT
  count(*) FILTER (WHERE inserted)     AS inserted_count,
  count(*) FILTER (WHERE NOT inserted) AS updated_count,
  count(*)                             AS total_upserted
FROM upsert;
""".strip()


SELECT_RECENT_VARIATION_IDS_SQL_TEMPLATE = """
SELECT square_variation_id
FROM {products_table}
WHERE square_variation_id IS NOT NULL
ORDER BY synced_at DESC
LIMIT 1000;
""".strip()

UPSERT_CATEGORIES_SQL_TEMPLATE = """
WITH payload AS (
  SELECT (%s)::jsonb AS j
),
cat_rows AS (
  SELECT
    obj->>'id'                                AS square_category_id,
    (obj->'category_data'->>'name')::text     AS name,
    (obj->'category_data'->>'parent_id')::text AS parent_square_category_id,
    (obj->>'is_deleted')::boolean             AS is_deleted,
    (obj->>'created_at')::timestamptz         AS square_created_at,
    (obj->>'updated_at')::timestamptz         AS square_updated_at,
    now()                                     AS synced_at
  FROM payload
  CROSS JOIN LATERAL jsonb_array_elements(j) AS obj
  WHERE obj->>'type' = 'CATEGORY'
)
INSERT INTO {categories_table} (
  square_category_id,
  name,
  parent_square_category_id,
  is_deleted,
  square_created_at,
  square_updated_at,
  synced_at
)
SELECT
  square_category_id,
  name,
  parent_square_category_id,
  is_deleted,
  square_created_at,
  square_updated_at,
  synced_at
FROM cat_rows
WHERE square_category_id IS NOT NULL
ON CONFLICT (square_category_id) DO UPDATE
SET
  name                      = EXCLUDED.name,
  parent_square_category_id = EXCLUDED.parent_square_category_id,
  is_deleted                = EXCLUDED.is_deleted,
  square_created_at         = EXCLUDED.square_created_at,
  square_updated_at         = EXCLUDED.square_updated_at,
  synced_at                 = EXCLUDED.synced_at;
""".strip()


UPDATE_INVENTORY_SQL_TEMPLATE = """
WITH payload AS (
  SELECT NULLIF((%s), '')::jsonb AS j
),
inventory_counts AS (
  SELECT
    (c->>'catalog_object_id')::text                          AS square_variation_id,
    GREATEST(COALESCE(NULLIF(c->>'quantity','')::int, 0), 0) AS quantity,
    NULLIF(c->>'calculated_at','')::timestamptz              AS updated_at,
    (c->>'location_id')::text                                AS location_id
  FROM payload
  CROSS JOIN LATERAL jsonb_array_elements(j) AS c
  WHERE (c->>'catalog_object_type') = 'ITEM_VARIATION'
    AND (c->>'location_id') = %s
)
UPDATE {products_table} p
SET
  stock_count = ic.quantity,
  updated_at  = COALESCE(ic.updated_at, p.updated_at),
  synced_at   = now()
FROM inventory_counts ic
WHERE p.square_variation_id = ic.square_variation_id;
""".strip()


UPDATE_IMAGES_SQL_TEMPLATE = """
WITH payload AS (
  SELECT NULLIF((%s), '')::jsonb AS j
),
image_mapping AS (
  SELECT
    obj->>'id'                 AS image_id,
    obj->'image_data'->>'url'  AS actual_url
  FROM payload
  CROSS JOIN LATERAL jsonb_array_elements(j) AS obj
  WHERE obj->>'type' = 'IMAGE'
)
UPDATE {products_table} p
SET
  image_url = im.actual_url,
  synced_at = now()
FROM image_mapping im
WHERE p.square_image_id = im.image_id;
""".strip()


UPDATE_CATEGORY_NAMES_REPORTING_SQL_TEMPLATE = """
UPDATE {products_table} p
SET
  category = COALESCE(
    (
      SELECT name
      FROM {categories_table}
      WHERE square_category_id = p.reporting_category
      LIMIT 1
    ),
    p.category
  ),
  all_categories = COALESCE(
    (
      SELECT array_agg(c.name)
      FROM {categories_table} c
      WHERE c.square_category_id = ANY(p.all_categories)
    ),
    p.all_categories
  )
WHERE p.all_categories IS NOT NULL;
""".strip()


UPDATE_CATEGORY_NAMES_FALLBACK_SQL_TEMPLATE = """
UPDATE {products_table} p
SET
  category = COALESCE(
    (
      SELECT name
      FROM {categories_table}
      WHERE square_category_id = p.category
      LIMIT 1
    ),
    p.category
  ),
  all_categories = COALESCE(
    (
      SELECT array_agg(c.name)
      FROM {categories_table} c
      WHERE c.square_category_id = ANY(p.all_categories)
    ),
    p.all_categories
  )
WHERE p.all_categories IS NOT NULL;
""".strip()


INSERT_RUN_SQL_TEMPLATE = """
INSERT INTO {runs_table} (
  inserted_count,
  updated_count,
  total_upserted
)
VALUES (%s, %s, %s);
""".strip()


def _ensure_psycopg() -> None:
    if psycopg is None:  # pragma: no cover
        raise SystemExit(
            "Missing dependency: psycopg. Install with:\n"
            "  pip install 'psycopg[binary]'\n"
            f"Original import error: {_PSYCOPG_IMPORT_ERROR}"
        )


def _sync_one_page(
    cfg: Config,
    sq: SquareClient,
    *,
    cursor: Optional[str],
    conn: Any,
) -> Tuple[Optional[str], Dict[str, int], int, int, bool]:
    """
    Returns:
      new_cursor, upsert_counts, inventory_updated_rows, images_updated_rows, category_denorm_ran
    """
    payload = sq.catalog_search_items(cursor=cursor)
    objects = payload.get("objects") or []
    related_objects = payload.get("related_objects") or []
    new_cursor = payload.get("cursor")

    upsert_counts = {"inserted_count": 0, "updated_count": 0, "total_upserted": 0}
    inventory_updated = 0
    images_updated = 0
    category_denorm_ran = False

    if cfg.dry_run:
        return new_cursor, upsert_counts, inventory_updated, images_updated, category_denorm_ran

    # Upsert products (from objects)
    upsert_sql = UPSERT_PRODUCTS_SQL_TEMPLATE.format(products_table=cfg.products_table)
    with conn.cursor() as cur:
        cur.execute(upsert_sql, (json.dumps(objects),))
        row = cur.fetchone()
        if row:
            # psycopg returns a tuple; order matches SELECT
            upsert_counts = {
                "inserted_count": int(row[0] or 0),
                "updated_count": int(row[1] or 0),
                "total_upserted": int(row[2] or 0),
            }

    # Best-effort run log insert (catalog_sync_runs)
    try:
        run_sql = INSERT_RUN_SQL_TEMPLATE.format(runs_table=cfg.catalog_sync_runs_table)
        with conn.cursor() as cur:
            cur.execute(
                run_sql,
                (
                    upsert_counts["inserted_count"],
                    upsert_counts["updated_count"],
                    upsert_counts["total_upserted"],
                ),
            )
    except Exception:
        # Table may not exist; keep going.
        pass

    # Inventory counts refresh for recent variations
    variation_ids: List[str] = []
    try:
        ids_sql = SELECT_RECENT_VARIATION_IDS_SQL_TEMPLATE.format(products_table=cfg.products_table)
        with conn.cursor() as cur:
            cur.execute(ids_sql)
            variation_ids = [r[0] for r in (cur.fetchall() or []) if r and r[0]]
    except Exception:
        variation_ids = []

    if variation_ids:
        inv_payload = sq.batch_inventory_counts(catalog_object_ids=variation_ids)
        counts = inv_payload.get("counts") or []

        inv_sql = UPDATE_INVENTORY_SQL_TEMPLATE.format(products_table=cfg.products_table)
        with conn.cursor() as cur:
            cur.execute(inv_sql, (json.dumps(counts), cfg.square_location_id))
            inventory_updated = cur.rowcount or 0

    # Images refresh from related_objects
    if related_objects:
        img_sql = UPDATE_IMAGES_SQL_TEMPLATE.format(products_table=cfg.products_table)
        with conn.cursor() as cur:
            cur.execute(img_sql, (json.dumps(related_objects),))
            images_updated = cur.rowcount or 0

    # Best-effort category denormalization (two variants: reporting_category, fallback to category)
    try:
        cat_sql = UPDATE_CATEGORY_NAMES_REPORTING_SQL_TEMPLATE.format(
            products_table=cfg.products_table,
            categories_table=cfg.categories_table,
        )
        with conn.cursor() as cur:
            cur.execute(cat_sql)
        category_denorm_ran = True
    except Exception:
        try:
            cat_sql = UPDATE_CATEGORY_NAMES_FALLBACK_SQL_TEMPLATE.format(
                products_table=cfg.products_table,
                categories_table=cfg.categories_table,
            )
            with conn.cursor() as cur:
                cur.execute(cat_sql)
            category_denorm_ran = True
        except Exception:
            category_denorm_ran = False

    return new_cursor, upsert_counts, inventory_updated, images_updated, category_denorm_ran


def _fetch_catalog_page(sq: SquareClient, *, cursor: Optional[str]) -> Tuple[List[dict], List[dict], Optional[str]]:
    payload = sq.catalog_search_items(cursor=cursor)
    objects = payload.get("objects") or []
    related_objects = payload.get("related_objects") or []
    new_cursor = payload.get("cursor")
    new_cursor = new_cursor if isinstance(new_cursor, str) and new_cursor.strip() else None
    return objects, related_objects, new_cursor


def _apply_catalog_batch(
    cfg: Config,
    sq: SquareClient,
    *,
    objects: List[dict],
    related_objects: List[dict],
    conn: Any,
) -> Tuple[Dict[str, int], int, int, bool]:
    """
    Apply one DB batch for the given catalog objects/related_objects.
    Returns: upsert_counts, inventory_updated_rows, images_updated_rows, category_denorm_ran
    """
    # Reuse the existing logic by temporarily calling the same SQL pieces as _sync_one_page,
    # but without re-fetching from Square.

    upsert_counts = {"inserted_count": 0, "updated_count": 0, "total_upserted": 0}
    inventory_updated = 0
    images_updated = 0
    category_denorm_ran = False

    if cfg.dry_run:
        return upsert_counts, inventory_updated, images_updated, category_denorm_ran

    # Upsert products
    upsert_sql = UPSERT_PRODUCTS_SQL_TEMPLATE.format(products_table=cfg.products_table)
    with conn.cursor() as cur:
        cur.execute(upsert_sql, (json.dumps(objects),))
        row = cur.fetchone()
        if row:
            upsert_counts = {
                "inserted_count": int(row[0] or 0),
                "updated_count": int(row[1] or 0),
                "total_upserted": int(row[2] or 0),
            }

    # Best-effort run log insert
    try:
        run_sql = INSERT_RUN_SQL_TEMPLATE.format(runs_table=cfg.catalog_sync_runs_table)
        with conn.cursor() as cur:
            cur.execute(
                run_sql,
                (
                    upsert_counts["inserted_count"],
                    upsert_counts["updated_count"],
                    upsert_counts["total_upserted"],
                ),
            )
    except Exception:
        pass

    # Inventory refresh for recent variations (same as blueprint: last 1000 by synced_at)
    variation_ids: List[str] = []
    try:
        ids_sql = SELECT_RECENT_VARIATION_IDS_SQL_TEMPLATE.format(products_table=cfg.products_table)
        with conn.cursor() as cur:
            cur.execute(ids_sql)
            variation_ids = [r[0] for r in (cur.fetchall() or []) if r and r[0]]
    except Exception:
        variation_ids = []

    if variation_ids:
        inv_payload = sq.batch_inventory_counts(catalog_object_ids=variation_ids)
        counts = inv_payload.get("counts") or []

        inv_sql = UPDATE_INVENTORY_SQL_TEMPLATE.format(products_table=cfg.products_table)
        with conn.cursor() as cur:
            cur.execute(inv_sql, (json.dumps(counts), cfg.square_location_id))
            inventory_updated = cur.rowcount or 0

    # Images refresh from related_objects
    if related_objects:
        img_sql = UPDATE_IMAGES_SQL_TEMPLATE.format(products_table=cfg.products_table)
        with conn.cursor() as cur:
            cur.execute(img_sql, (json.dumps(related_objects),))
            images_updated = cur.rowcount or 0

    # Category denormalization
    try:
        cat_sql = UPDATE_CATEGORY_NAMES_REPORTING_SQL_TEMPLATE.format(
            products_table=cfg.products_table,
            categories_table=cfg.categories_table,
        )
        with conn.cursor() as cur:
            cur.execute(cat_sql)
        category_denorm_ran = True
    except Exception:
        try:
            cat_sql = UPDATE_CATEGORY_NAMES_FALLBACK_SQL_TEMPLATE.format(
                products_table=cfg.products_table,
                categories_table=cfg.categories_table,
            )
            with conn.cursor() as cur:
                cur.execute(cat_sql)
            category_denorm_ran = True
        except Exception:
            category_denorm_ran = False

    return upsert_counts, inventory_updated, images_updated, category_denorm_ran


def _sync_categories(cfg: Config, sq: SquareClient, conn: Any) -> int:
    """
    Pull all categories from Square and upsert into categories table.
    Returns number of objects processed (not DB rowcount, which can be -1 depending on driver).
    """
    if cfg.dry_run:
        return 0

    cursor: Optional[str] = None
    processed = 0
    upsert_sql = UPSERT_CATEGORIES_SQL_TEMPLATE.format(categories_table=cfg.categories_table)

    while True:
        payload = sq.catalog_list_categories(cursor=cursor)
        objects = payload.get("objects") or []
        if objects:
            processed += len(objects)
            with conn.cursor() as cur:
                cur.execute(upsert_sql, (json.dumps(objects),))
            conn.commit()

        cursor = payload.get("cursor")
        if not isinstance(cursor, str) or not cursor.strip():
            break

    return processed


def main(argv: Optional[List[str]] = None) -> int:
    cfg = load_config(argv)
    sq = SquareClient(cfg)

    # Single-item mode: sync exactly one Square ITEM by id; do not read/write cursor state.
    if cfg.item_id:
        if psycopg is None and not cfg.dry_run:
            _ensure_psycopg()

        conn = None
        if not cfg.dry_run:
            conn = _connect_pg(cfg)

        categories_processed = 0
        upsert_counts = {"inserted_count": 0, "updated_count": 0, "total_upserted": 0}
        inv_rows = 0
        img_rows = 0
        cat_denorm = False
        albums_cache_result: Optional[Dict[str, Any]] = None

        try:
            if not cfg.dry_run and conn is not None:
                try:
                    categories_processed = _sync_categories(cfg, sq, conn)
                except Exception:
                    categories_processed = 0

            payload = sq.catalog_get_object(cfg.item_id, include_related_objects=True)
            obj = payload.get("object") or {}
            related = payload.get("related_objects") or []
            objects = [obj] if obj else []

            upsert_counts, inv_rows, img_rows, cat_denorm = _apply_catalog_batch(
                cfg,
                sq,
                objects=objects,
                related_objects=related,
                conn=conn,
            )

            if conn is not None:
                conn.commit()
        except Exception:
            if conn is not None:
                _safe_rollback(conn)
            raise
        finally:
            if conn is not None:
                _safe_close(conn)

        if cfg.rebuild_albums_cache and (not cfg.dry_run):
            albums_cache_result = _rebuild_albums_cache(cfg)
            if albums_cache_result.get("attempted") and not albums_cache_result.get("ok"):
                _send_make_alert_email(
                    alert_code="SYNC-ALBUMS-CACHE",
                    title="albums_cache rebuild failed (after single-item sync)",
                    error=str(albums_cache_result),
                    context={"stage": "sync.albums_cache", "itemId": cfg.item_id},
                    stack=None,
                    severity="warning",
                )

        print(
            json.dumps(
                {
                    "mode": "single_item",
                    "item_id": cfg.item_id,
                    "categories_processed": categories_processed,
                    "products": upsert_counts,
                    "inventory_rows_updated": inv_rows,
                    "image_rows_updated": img_rows,
                    "category_denorm_attempted": cat_denorm,
                    "albums_cache_rebuild": albums_cache_result,
                    "dry_run": cfg.dry_run,
                    "square_version": cfg.square_version,
                    "square_location_id": cfg.square_location_id,
                    "products_table": cfg.products_table,
                },
                indent=2,
                sort_keys=True,
            )
        )
        return 0

    state = _load_json_file(cfg.state_path)
    today = _utc_today_str()

    # Mirror Make datastore keys
    last_reset = state.get("inventory_last_reset_date")
    cursor = None
    if isinstance(state.get("catalog_items"), dict):
        cursor = state.get("catalog_items", {}).get("id")
    if not isinstance(cursor, str) or not cursor.strip():
        cursor = None

    # Daily reset (Make: if last_reset_date != today then overwrite + delete catalog_items)
    did_daily_reset = False
    if last_reset != today:
        did_daily_reset = True
        state["inventory_last_reset_date"] = today
        state.pop("catalog_items", None)
        cursor = None
        if not cfg.dry_run:
            _atomic_write_json(cfg.state_path, state)

    if cfg.dry_run:
        print(f"[DRY RUN] Would read/write state at: {cfg.state_path}")

    if psycopg is None and not cfg.dry_run:
        _ensure_psycopg()

    # Connect to Postgres (unless dry-run)
    conn = None
    if not cfg.dry_run:
        conn = _connect_pg(cfg)

    pages = 0
    total_inserted = 0
    total_updated = 0
    total_upserted = 0
    total_inventory_updates = 0
    total_image_updates = 0
    any_category_denorm = False
    categories_processed = 0
    albums_cache_result: Optional[Dict[str, Any]] = None

    try:
        # Categories are required for category-name denormalization; sync them first.
        if not cfg.dry_run and conn is not None:
            try:
                categories_processed = _sync_categories(cfg, sq, conn)
            except Exception:
                # Best-effort: if categories table doesn't exist or API call fails, keep going.
                categories_processed = 0

        while pages < cfg.max_pages:
            # Fetch N pages first, then apply as a single DB upsert batch.
            batch_objects: List[dict] = []
            batch_related: List[dict] = []
            batch_pages = 0
            start_cursor = cursor

            while batch_pages < cfg.upsert_batch_pages and pages + batch_pages < cfg.max_pages:
                objs, rel, new_cursor = _fetch_catalog_page(sq, cursor=cursor)
                batch_objects.extend(objs)
                batch_related.extend(rel)
                batch_pages += 1
                cursor = new_cursor
                if not cursor:
                    break

            batch_attempt = 0
            while True:
                batch_attempt += 1
                try:
                    counts, inv_rows, img_rows, cat_denorm = _apply_catalog_batch(
                        cfg,
                        sq,
                        objects=batch_objects,
                        related_objects=batch_related,
                        conn=conn,
                    )
                    if conn is not None:
                        conn.commit()
                    pages += batch_pages
                    break
                except Exception as e:
                    if conn is not None:
                        _safe_rollback(conn)
                    if (not cfg.dry_run) and batch_attempt <= 3 and _is_retryable_db_error(e):
                        _safe_close(conn)
                        conn = _connect_pg(cfg)
                        time.sleep(0.5 * (2 ** (batch_attempt - 1)))
                        # Re-apply same batch (do not advance cursor/state)
                        cursor = start_cursor
                        continue
                    raise

            total_inserted += counts.get("inserted_count", 0)
            total_updated += counts.get("updated_count", 0)
            total_upserted += counts.get("total_upserted", 0)
            total_inventory_updates += inv_rows
            total_image_updates += img_rows
            any_category_denorm = any_category_denorm or cat_denorm

            # Persist cursor only after the DB commit succeeds (prevents skipping pages).
            if not cfg.dry_run:
                if cursor:
                    state["catalog_items"] = {"id": cursor}
                else:
                    state.pop("catalog_items", None)
                _atomic_write_json(cfg.state_path, state)

            # Stop if Square cursor is exhausted.
            if not cursor:
                break
    except Exception:
        if conn is not None:
            _safe_rollback(conn)
        # Best-effort alert email with an explicit alert code included.
        err = sys.exc_info()[1] or Exception("Unknown error")
        stage = "sync.main"
        alert_code = _compute_alert_code(stage, err)
        _send_make_alert_email(
            alert_code=alert_code,
            title="Catalog sync failed",
            error=str(err),
            context={
                "stage": stage,
                "pagesFetchedSoFar": pages,
                "statePath": cfg.state_path,
                "squareBaseUrl": cfg.square_base_url,
                "squareLocationId": cfg.square_location_id,
                "squareVersion": cfg.square_version,
                "productsTable": cfg.products_table,
                "categoriesTable": cfg.categories_table,
                "dryRun": cfg.dry_run,
            },
            stack="".join(traceback.format_exception(*sys.exc_info())) if sys.exc_info()[0] else None,
            severity="critical",
        )
        raise
    finally:
        if conn is not None:
            _safe_close(conn)

    if cfg.rebuild_albums_cache and (not cfg.dry_run):
        albums_cache_result = _rebuild_albums_cache(cfg)
        if albums_cache_result.get("attempted") and not albums_cache_result.get("ok"):
            _send_make_alert_email(
                alert_code="SYNC-ALBUMS-CACHE",
                title="albums_cache rebuild failed (after catalog sync)",
                error=str(albums_cache_result),
                context={"stage": "sync.albums_cache", "pagesFetched": pages},
                stack=None,
                severity="warning",
            )

    print(
        json.dumps(
            {
                "daily_reset": did_daily_reset,
                "pages_fetched": pages,
                "cursor_saved": bool(cursor) and not cfg.dry_run,
                "categories_processed": categories_processed,
                "products": {
                    "inserted_count": total_inserted,
                    "updated_count": total_updated,
                    "total_upserted": total_upserted,
                },
                "inventory_rows_updated": total_inventory_updates,
                "image_rows_updated": total_image_updates,
                "category_denorm_attempted": any_category_denorm,
                "albums_cache_rebuild": albums_cache_result,
                "dry_run": cfg.dry_run,
                "state_path": cfg.state_path,
                "square_version": cfg.square_version,
                "square_location_id": cfg.square_location_id,
                "products_table": cfg.products_table,
            },
            indent=2,
            sort_keys=True,
        )
    )

    return 0


if __name__ == "__main__":  # pragma: no cover
    try:
        raise SystemExit(main())
    except KeyboardInterrupt:
        print("\nInterrupted.", file=sys.stderr)
        raise SystemExit(130)

