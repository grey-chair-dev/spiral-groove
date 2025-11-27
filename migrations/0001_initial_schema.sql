-- 0001_initial_schema.sql
-- Creates all core tables for Spiral Groove Records

-- 1. INVENTORY CORE & ENRICHMENT ------------------------------------------------
CREATE TABLE IF NOT EXISTS "Square_Item" (
    square_item_id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    base_price NUMERIC NOT NULL,
    stock_level INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Product_Detail" (
    square_item_id TEXT PRIMARY KEY,
    condition_sleeve TEXT,
    condition_media TEXT,
    format TEXT,
    full_description TEXT,
    is_staff_pick BOOLEAN NOT NULL DEFAULT FALSE,
    thumbnail_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (square_item_id) REFERENCES "Square_Item" (square_item_id) ON DELETE CASCADE
);

-- 2. LOOKUP TABLES ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "Artist" (
    artist_id SERIAL PRIMARY KEY,
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

-- 3. JUNCTION TABLES -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "Vinyl_Genre" (
    square_item_id TEXT NOT NULL,
    genre_id INTEGER NOT NULL,
    PRIMARY KEY (square_item_id, genre_id),
    FOREIGN KEY (square_item_id) REFERENCES "Square_Item" (square_item_id) ON DELETE CASCADE,
    FOREIGN KEY (genre_id) REFERENCES "Genre" (genre_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "Vinyl_Artist" (
    square_item_id TEXT NOT NULL,
    artist_id INTEGER NOT NULL,
    PRIMARY KEY (square_item_id, artist_id),
    FOREIGN KEY (square_item_id) REFERENCES "Square_Item" (square_item_id) ON DELETE CASCADE,
    FOREIGN KEY (artist_id) REFERENCES "Artist" (artist_id) ON DELETE CASCADE
);

-- 4. USER ACCOUNTS & E-COMMERCE --------------------------------------------------
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
    square_item_id TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    price_at_purchase NUMERIC NOT NULL,
    FOREIGN KEY (order_id) REFERENCES "Order" (order_id) ON DELETE CASCADE,
    FOREIGN KEY (square_item_id) REFERENCES "Square_Item" (square_item_id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS "Wishlist_Item" (
    customer_id INTEGER NOT NULL,
    square_item_id TEXT NOT NULL,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (customer_id, square_item_id),
    FOREIGN KEY (customer_id) REFERENCES "Customer" (customer_id) ON DELETE CASCADE,
    FOREIGN KEY (square_item_id) REFERENCES "Square_Item" (square_item_id) ON DELETE CASCADE
);

-- 5. FUNCTIONS & TRIGGERS --------------------------------------------------------
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS set_timestamp_square_item ON "Square_Item";
CREATE TRIGGER set_timestamp_square_item
BEFORE UPDATE ON "Square_Item"
FOR EACH ROW
EXECUTE PROCEDURE update_timestamp();

DROP TRIGGER IF EXISTS set_timestamp_product_detail ON "Product_Detail";
CREATE TRIGGER set_timestamp_product_detail
BEFORE UPDATE ON "Product_Detail"
FOR EACH ROW
EXECUTE PROCEDURE update_timestamp();

-- 6. INDEXES ---------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_square_item_name ON "Square_Item" (name);
CREATE INDEX IF NOT EXISTS idx_order_number ON "Order" (order_number);
CREATE INDEX IF NOT EXISTS idx_order_customer_id ON "Order" (customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_email ON "Customer" (email);
CREATE INDEX IF NOT EXISTS idx_staff_email ON "Staff_User" (email);

