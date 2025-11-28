-- PostgreSQL Database Schema for Local Commerce Template
-- File: schema.sql
-- Safe, idempotent schema creation suitable for production environments.
-- Use scripts/dev-reset-schema.sql for a destructive reset instead.

BEGIN;

--------------------------------------------------------------------------------
-- 1. INVENTORY CORE & ENRICHMENT
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS "ECS_Item" (
    ecs_item_id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    base_price NUMERIC NOT NULL,
    stock_level INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Product_Detail" (
    ecs_item_id TEXT PRIMARY KEY,
    condition_sleeve TEXT,
    condition_media TEXT,
    format TEXT,
    full_description TEXT,
    is_staff_pick BOOLEAN NOT NULL DEFAULT FALSE,
    thumbnail_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ecs_item_id) REFERENCES "ECS_Item" (ecs_item_id) ON DELETE CASCADE
);

--------------------------------------------------------------------------------
-- 2. ENRICHMENT & CATEGORIZATION (LOOKUP TABLES)
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS "Maker" (
    maker_id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS "Label" (
    label_id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS "Genre" (
    genre_id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL
);

--------------------------------------------------------------------------------
-- 3. JUNCTION TABLES (MAPPING)
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS "Item_Genre" (
    ecs_item_id TEXT NOT NULL,
    genre_id INTEGER NOT NULL,
    PRIMARY KEY (ecs_item_id, genre_id),
    FOREIGN KEY (ecs_item_id) REFERENCES "ECS_Item" (ecs_item_id) ON DELETE CASCADE,
    FOREIGN KEY (genre_id) REFERENCES "Genre" (genre_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "Item_Maker" (
    ecs_item_id TEXT NOT NULL,
    maker_id INTEGER NOT NULL,
    PRIMARY KEY (ecs_item_id, maker_id),
    FOREIGN KEY (ecs_item_id) REFERENCES "ECS_Item" (ecs_item_id) ON DELETE CASCADE,
    FOREIGN KEY (maker_id) REFERENCES "Maker" (maker_id) ON DELETE CASCADE
);

--------------------------------------------------------------------------------
-- 4. USER ACCOUNTS AND E-COMMERCE FEATURES
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS "Staff_User" (
    user_id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'staff',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Customer" (
    customer_id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Order" (
    order_id SERIAL PRIMARY KEY,
    order_number TEXT UNIQUE NOT NULL,
    customer_id INTEGER,
    total_amount NUMERIC NOT NULL,
    current_status TEXT NOT NULL DEFAULT 'Processing',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES "Customer" (customer_id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS "Order_Item" (
    order_item_id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL,
    ecs_item_id TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    price_at_purchase NUMERIC NOT NULL,
    FOREIGN KEY (order_id) REFERENCES "Order" (order_id) ON DELETE CASCADE,
    FOREIGN KEY (ecs_item_id) REFERENCES "ECS_Item" (ecs_item_id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS "Wishlist_Item" (
    customer_id INTEGER NOT NULL,
    ecs_item_id TEXT NOT NULL,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (customer_id, ecs_item_id),
    FOREIGN KEY (customer_id) REFERENCES "Customer" (customer_id) ON DELETE CASCADE,
    FOREIGN KEY (ecs_item_id) REFERENCES "ECS_Item" (ecs_item_id) ON DELETE CASCADE
);

--------------------------------------------------------------------------------
-- 5. PERFORMANCE INDEXES AND TRIGGERS
--------------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_ecs_item_name ON "ECS_Item" (name);
CREATE INDEX IF NOT EXISTS idx_order_number ON "Order" (order_number);
CREATE INDEX IF NOT EXISTS idx_order_customer_id ON "Order" (customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_email ON "Customer" (email);
CREATE INDEX IF NOT EXISTS idx_staff_email ON "Staff_User" (email);

CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

DROP TRIGGER IF EXISTS set_timestamp_ecs_item ON "ECS_Item";
CREATE TRIGGER set_timestamp_ecs_item
BEFORE UPDATE ON "ECS_Item"
FOR EACH ROW
EXECUTE PROCEDURE update_timestamp();

DROP TRIGGER IF EXISTS set_timestamp_product_detail ON "Product_Detail";
CREATE TRIGGER set_timestamp_product_detail
BEFORE UPDATE ON "Product_Detail"
FOR EACH ROW
EXECUTE PROCEDURE update_timestamp();

--------------------------------------------------------------------------------
-- 6. GRANT PERMISSIONS TO APPLICATION ROLES
--------------------------------------------------------------------------------

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'app_user') THEN
    GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO app_user;
    GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_user;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public 
      GRANT SELECT, INSERT, UPDATE ON TABLES TO app_user;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public 
      GRANT USAGE, SELECT ON SEQUENCES TO app_user;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'readonly_user') THEN
    GRANT SELECT ON ALL TABLES IN SCHEMA public TO readonly_user;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public 
      GRANT SELECT ON TABLES TO readonly_user;
  END IF;
END $$;

SELECT 
  grantee,
  table_schema,
  table_name,
  privilege_type
FROM information_schema.role_table_grants
WHERE grantee IN ('app_user', 'readonly_user')
  AND table_schema = 'public'
ORDER BY grantee, table_name, privilege_type;

COMMIT;