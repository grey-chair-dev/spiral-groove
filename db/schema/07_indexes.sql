-- Additional performance indexes for all tables

-- Composite indexes for common queries
CREATE INDEX idx_products_genre_condition ON products(genre, condition);
CREATE INDEX idx_products_price_range ON products(price) WHERE in_stock = true;
CREATE INDEX idx_orders_user_status ON orders(user_id, status);
CREATE INDEX idx_orders_created_status ON orders(created_at, status);
CREATE INDEX idx_events_date_status ON events(date, status);
CREATE INDEX idx_blog_posts_status_published ON blog_posts(status, published_at) WHERE status = 'published';

-- Full-text search indexes
CREATE INDEX idx_products_search ON products USING gin(
  to_tsvector('english', title || ' ' || COALESCE(artist, '') || ' ' || COALESCE(description, ''))
);

CREATE INDEX idx_blog_posts_search ON blog_posts USING gin(
  to_tsvector('english', title || ' ' || COALESCE(excerpt, '') || ' ' || content)
);

-- Partial indexes for active records
CREATE INDEX idx_users_active ON users(id) WHERE is_active = true;
CREATE INDEX idx_products_available ON products(id, price, in_stock) WHERE in_stock = true;
CREATE INDEX idx_events_upcoming ON events(id, date, title) WHERE status = 'upcoming' AND date > NOW();

-- Indexes for foreign key lookups
CREATE INDEX idx_order_items_lookup ON order_items(order_id, product_id);
CREATE INDEX idx_cart_items_lookup ON cart_items(cart_id, product_id);
CREATE INDEX idx_event_inquiries_lookup ON event_inquiries(event_id, status);

-- Indexes for sorting and pagination
CREATE INDEX idx_products_created_desc ON products(created_at DESC);
CREATE INDEX idx_orders_created_desc ON orders(created_at DESC);
CREATE INDEX idx_events_date_asc ON events(date ASC);
CREATE INDEX idx_blog_posts_published_desc ON blog_posts(published_at DESC) WHERE status = 'published';

-- Indexes for analytics queries
CREATE INDEX idx_orders_revenue ON orders(created_at, total) WHERE status IN ('confirmed', 'processing', 'shipped', 'delivered');
CREATE INDEX idx_products_popular ON products(id, created_at) WHERE in_stock = true;

-- Indexes for admin queries
CREATE INDEX idx_orders_admin ON orders(created_at DESC, status, payment_status);
CREATE INDEX idx_users_admin ON users(created_at DESC, role, is_active);
CREATE INDEX idx_products_admin ON products(created_at DESC, in_stock, synced_at);

-- Indexes for search suggestions
CREATE INDEX idx_products_artist_suggestions ON products(artist) WHERE artist IS NOT NULL;
CREATE INDEX idx_products_genre_suggestions ON products(genre) WHERE genre IS NOT NULL;
