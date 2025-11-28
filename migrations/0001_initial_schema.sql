-- Abstracted Schema for a Reusable Local Commerce Template
-- ECS: External Commerce System (e.g., ECS, Shopify, Lightspeed)

-- 1. Inventory Core & ECS Mirror
-- ECS_Product_Item: Core inventory cache mirroring data from the ECS (ECS/Shopify).
CREATE TABLE IF NOT EXISTS "ECS_Product_Item" (
    ecs_product_id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    base_price NUMERIC NOT NULL,
    stock_level INTEGER DEFAULT 0,
    -- Timestamps for sync tracking
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Product_Enrichment: Web-specific data not found in the ECS (the enrichment layer).
CREATE TABLE IF NOT EXISTS "Product_Enrichment" (
    ecs_product_id TEXT PRIMARY KEY,
    condition_description TEXT, -- Generic for condition/state
    format_type TEXT,          -- Generic for size/format (e.g., Item, Digital, Size 10)
    full_description TEXT,
    is_staff_pick BOOLEAN DEFAULT FALSE,
    thumbnail_url TEXT,
    FOREIGN KEY (ecs_product_id) REFERENCES "ECS_Product_Item" (ecs_product_id) ON DELETE CASCADE
);

-- 2. Categorization & Lookup Tables (Agnostic to product type)
CREATE TABLE IF NOT EXISTS "Product_Maker" (
    maker_id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS "Product_Brand" (
    brand_id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS "Product_Category" (
    category_id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL
);

-- 3. Junction Tables (Mapping items to multiple attributes)
CREATE TABLE IF NOT EXISTS "Product_Category_Map" (
    ecs_product_id TEXT NOT NULL,
    category_id INTEGER NOT NULL,
    PRIMARY KEY (ecs_product_id, category_id),
    FOREIGN KEY (ecs_product_id) REFERENCES "ECS_Product_Item" (ecs_product_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES "Product_Category" (category_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "Product_Maker_Map" (
    ecs_product_id TEXT NOT NULL,
    maker_id INTEGER NOT NULL,
    PRIMARY KEY (ecs_product_id, maker_id),
    FOREIGN KEY (ecs_product_id) REFERENCES "ECS_Product_Item" (ecs_product_id) ON DELETE CASCADE,
    FOREIGN KEY (maker_id) REFERENCES "Product_Maker" (maker_id) ON DELETE CASCADE
);

-- 4. User Accounts and E-commerce Features
CREATE TABLE IF NOT EXISTS "Customer" (
    customer_id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Staff_User" (
    user_id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'viewer'
);

CREATE TABLE IF NOT EXISTS "Wishlist_Item" (
    customer_id INTEGER NOT NULL,
    ecs_product_id TEXT NOT NULL,
    PRIMARY KEY (customer_id, ecs_product_id),
    FOREIGN KEY (customer_id) REFERENCES "Customer" (customer_id) ON DELETE CASCADE,
    FOREIGN KEY (ecs_product_id) REFERENCES "ECS_Product_Item" (ecs_product_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "Order_Header" ( -- Renamed from 'Order' to prevent SQL conflicts
    order_id SERIAL PRIMARY KEY,
    order_number TEXT UNIQUE NOT NULL,
    customer_id INTEGER,
    total_amount NUMERIC NOT NULL,
    current_status TEXT NOT NULL,
    FOREIGN KEY (customer_id) REFERENCES "Customer" (customer_id)
);

CREATE TABLE IF NOT EXISTS "Order_Line_Item" ( -- Renamed from 'Order_Item'
    line_item_id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL,
    ecs_product_id TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    price_at_purchase NUMERIC NOT NULL,
    FOREIGN KEY (order_id) REFERENCES "Order_Header" (order_id) ON DELETE CASCADE,
    FOREIGN KEY (ecs_product_id) REFERENCES "ECS_Product_Item" (ecs_product_id)
);

-- Trigger function for automated timestamp updates
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
   NEW."updatedAt" = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to relevant tables
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_ecs_item_timestamp') THEN
        CREATE TRIGGER set_ecs_item_timestamp
        BEFORE UPDATE ON "ECS_Product_Item"
        FOR EACH ROW
        EXECUTE FUNCTION update_timestamp();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_product_enrichment_timestamp') THEN
        CREATE TRIGGER set_product_enrichment_timestamp
        BEFORE UPDATE ON "Product_Enrichment"
        FOR EACH ROW
        EXECUTE FUNCTION update_timestamp();
    END IF;

    -- Add triggers to other tables like Customer, Order_Header, etc., as needed for full tracking.
END $$;

-- Newsletter/Email List for the coming soon page
CREATE TABLE IF NOT EXISTS "email_list" (
    email_id SERIAL PRIMARY KEY,
    "firstName" TEXT,
    "lastName" TEXT,
    email TEXT UNIQUE NOT NULL,
    source TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);