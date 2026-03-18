-- Add delivery/shipping columns to orders for querying and reporting.
-- Run once against your Neon (or other Postgres) database.
-- Safe to re-run: uses IF NOT EXISTS (PostgreSQL 9.5+).

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS delivery_method TEXT DEFAULT 'pickup',
  ADD COLUMN IF NOT EXISTS shipping_cents BIGINT DEFAULT 0;

-- Optional: index for filtering delivery vs pickup (e.g. reports)
CREATE INDEX IF NOT EXISTS idx_orders_delivery_method ON orders (delivery_method);

COMMENT ON COLUMN orders.delivery_method IS 'pickup or delivery';
COMMENT ON COLUMN orders.shipping_cents IS 'Shipping fee in cents when delivery_method = delivery';
