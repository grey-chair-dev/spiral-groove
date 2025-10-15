-- Products table with Square integration fields
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  square_id VARCHAR(255) UNIQUE,
  title VARCHAR(255) NOT NULL,
  artist VARCHAR(255),
  genre VARCHAR(100),
  condition VARCHAR(50),
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  description TEXT,
  images JSONB,
  in_stock BOOLEAN DEFAULT true,
  stock_quantity INTEGER DEFAULT 0 CHECK (stock_quantity >= 0),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  synced_at TIMESTAMP
);

-- Create indexes for products table
CREATE INDEX idx_products_title ON products USING gin(to_tsvector('english', title));
CREATE INDEX idx_products_artist ON products USING gin(to_tsvector('english', artist));
CREATE INDEX idx_products_genre ON products(genre);
CREATE INDEX idx_products_condition ON products(condition);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_products_in_stock ON products(in_stock);
CREATE INDEX idx_products_square_id ON products(square_id);
CREATE INDEX idx_products_created_at ON products(created_at);

-- Create updated_at trigger for products
CREATE TRIGGER update_products_updated_at 
    BEFORE UPDATE ON products 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
