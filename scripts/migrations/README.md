# Database migrations

Run these against your Neon (or other Postgres) database when adding schema changes.

## add-orders-shipping-columns.sql

Adds `delivery_method` and `shipping_cents` to the `orders` table for shipping/delivery support.

**When:** Before or after deploying the shipping feature; existing rows get defaults (`delivery_method = 'pickup'`, `shipping_cents = 0`).

**How:** Execute the SQL in Neon’s SQL Editor (or `psql`), or use your usual migration runner.
