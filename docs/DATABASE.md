# Database Documentation

## Overview

The Spiral Groove Records application uses PostgreSQL as the primary database with a well-structured schema designed for e-commerce, event management, and content management.

## Database Schema

### Core Tables

#### Users Table
Stores user authentication and profile information.

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'customer' CHECK (role IN ('customer', 'staff', 'admin')),
  phone VARCHAR(20),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP
);
```

**Indexes:**
- `idx_users_email` - Email lookup
- `idx_users_role` - Role-based queries
- `idx_users_is_active` - Active user filtering
- `idx_users_created_at` - Time-based queries

#### Products Table
Stores product catalog with Square POS integration.

```sql
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
```

**Indexes:**
- `idx_products_title` - Full-text search on title
- `idx_products_artist` - Full-text search on artist
- `idx_products_genre` - Genre filtering
- `idx_products_condition` - Condition filtering
- `idx_products_price` - Price range queries
- `idx_products_in_stock` - Stock availability
- `idx_products_square_id` - Square integration

#### Orders Table
Stores order information and status.

```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  square_order_id VARCHAR(255) UNIQUE,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
  subtotal DECIMAL(10,2) NOT NULL CHECK (subtotal >= 0),
  tax DECIMAL(10,2) NOT NULL CHECK (tax >= 0),
  shipping DECIMAL(10,2) DEFAULT 0 CHECK (shipping >= 0),
  total DECIMAL(10,2) NOT NULL CHECK (total >= 0),
  shipping_address JSONB NOT NULL,
  billing_address JSONB NOT NULL,
  payment_status VARCHAR(50) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Indexes:**
- `idx_orders_user_id` - User order lookup
- `idx_orders_status` - Status filtering
- `idx_orders_payment_status` - Payment status filtering
- `idx_orders_created_at` - Time-based queries
- `idx_orders_square_order_id` - Square integration

#### Order Items Table
Stores individual items within orders.

```sql
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  total DECIMAL(10,2) NOT NULL CHECK (total >= 0),
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Indexes:**
- `idx_order_items_order_id` - Order lookup
- `idx_order_items_product_id` - Product lookup

### Shopping Cart Tables

#### Cart Table
Stores user shopping carts.

```sql
CREATE TABLE cart (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  session_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Cart Items Table
Stores items in shopping carts.

```sql
CREATE TABLE cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id UUID REFERENCES cart(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Event Management Tables

#### Events Table
Stores event information.

```sql
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  date TIMESTAMP NOT NULL,
  capacity INTEGER CHECK (capacity > 0),
  price DECIMAL(10,2) CHECK (price >= 0),
  image VARCHAR(255),
  status VARCHAR(50) DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Event Inquiries Table
Stores event booking inquiries.

```sql
CREATE TABLE event_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  message TEXT,
  attendees INTEGER CHECK (attendees > 0),
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'confirmed', 'cancelled')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Content Management Tables

#### Blog Posts Table
Stores blog content.

```sql
CREATE TABLE blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  featured_image VARCHAR(255),
  author_id UUID REFERENCES users(id),
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Pages Table
Stores static pages.

```sql
CREATE TABLE pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  content TEXT NOT NULL,
  meta_title VARCHAR(255),
  meta_description TEXT,
  status VARCHAR(50) DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Reviews Table
Stores product reviews.

```sql
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  product_id UUID REFERENCES products(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);
```

## Database Relationships

### Entity Relationship Diagram

```
Users (1) ──── (M) Orders
Users (1) ──── (1) Cart
Users (1) ──── (M) Blog Posts
Users (1) ──── (M) Reviews

Orders (1) ──── (M) Order Items
Order Items (M) ──── (1) Products

Cart (1) ──── (M) Cart Items
Cart Items (M) ──── (1) Products

Events (1) ──── (M) Event Inquiries

Products ──── Square API (External)
```

### Key Relationships

1. **Users → Orders**: One-to-many relationship
2. **Orders → Order Items**: One-to-many relationship
3. **Order Items → Products**: Many-to-one relationship
4. **Users → Cart**: One-to-one relationship
5. **Cart → Cart Items**: One-to-many relationship
6. **Cart Items → Products**: Many-to-one relationship
7. **Events → Event Inquiries**: One-to-many relationship
8. **Users → Blog Posts**: One-to-many relationship (author)
9. **Users → Reviews**: One-to-many relationship
10. **Products → Reviews**: One-to-many relationship

## Performance Optimizations

### Indexes

The database includes comprehensive indexing for optimal performance:

#### Full-Text Search Indexes
```sql
-- Product search
CREATE INDEX idx_products_search ON products USING gin(
  to_tsvector('english', title || ' ' || COALESCE(artist, '') || ' ' || COALESCE(description, ''))
);

-- Blog post search
CREATE INDEX idx_blog_posts_search ON blog_posts USING gin(
  to_tsvector('english', title || ' ' || COALESCE(excerpt, '') || ' ' || content)
);
```

#### Composite Indexes
```sql
-- Common query patterns
CREATE INDEX idx_products_genre_condition ON products(genre, condition);
CREATE INDEX idx_orders_user_status ON orders(user_id, status);
CREATE INDEX idx_events_date_status ON events(date, status);
```

#### Partial Indexes
```sql
-- Active records only
CREATE INDEX idx_users_active ON users(id) WHERE is_active = true;
CREATE INDEX idx_products_available ON products(id, price, in_stock) WHERE in_stock = true;
CREATE INDEX idx_events_upcoming ON events(id, date, title) WHERE status = 'upcoming' AND date > NOW();
```

### Query Optimization

#### Common Query Patterns

**Product Search with Filters:**
```sql
SELECT p.*, 
       ts_rank(to_tsvector('english', p.title || ' ' || COALESCE(p.artist, '')), plainto_tsquery('english', $1)) as rank
FROM products p
WHERE to_tsvector('english', p.title || ' ' || COALESCE(p.artist, '')) @@ plainto_tsquery('english', $1)
  AND p.in_stock = true
  AND ($2 IS NULL OR p.genre = $2)
  AND ($3 IS NULL OR p.condition = $3)
  AND ($4 IS NULL OR p.price >= $4)
  AND ($5 IS NULL OR p.price <= $5)
ORDER BY rank DESC, p.created_at DESC
LIMIT $6 OFFSET $7;
```

**User Order History:**
```sql
SELECT o.*, 
       array_agg(
         json_build_object(
           'product_id', oi.product_id,
           'title', p.title,
           'quantity', oi.quantity,
           'price', oi.price
         )
       ) as items
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
LEFT JOIN products p ON oi.product_id = p.id
WHERE o.user_id = $1
GROUP BY o.id
ORDER BY o.created_at DESC
LIMIT $2 OFFSET $3;
```

**Event Analytics:**
```sql
SELECT 
  DATE_TRUNC('month', created_at) as month,
  COUNT(*) as total_inquiries,
  COUNT(*) FILTER (WHERE status = 'confirmed') as confirmed,
  AVG(attendees) as avg_attendees
FROM event_inquiries
WHERE created_at >= $1
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month;
```

## Data Types

### UUID Usage
All primary keys use UUIDs for better distributed system compatibility and security.

### JSONB Usage
Flexible data storage for:
- Product images array
- Shipping/billing addresses
- User preferences
- Configuration data

### Timestamps
All tables include `created_at` and `updated_at` timestamps with automatic triggers.

### Decimal Precision
Monetary values use `DECIMAL(10,2)` for precise financial calculations.

## Constraints and Validation

### Check Constraints
- Price values must be non-negative
- Stock quantities must be non-negative
- Order quantities must be positive
- Ratings must be between 1-5
- Event capacity must be positive

### Foreign Key Constraints
- Cascading deletes for dependent records
- Referential integrity enforcement
- Orphaned record prevention

### Unique Constraints
- User email uniqueness
- Product Square ID uniqueness
- Order Square ID uniqueness
- Blog post slug uniqueness
- Page slug uniqueness
- User-product review uniqueness

## Backup and Recovery

### Backup Strategy
1. **Daily automated backups** with point-in-time recovery
2. **Weekly full database dumps**
3. **Transaction log backups** every 15 minutes
4. **Cross-region backup replication**

### Recovery Procedures
1. **Point-in-time recovery** for data corruption
2. **Full database restore** for catastrophic failure
3. **Selective table restore** for partial data loss
4. **Schema-only restore** for structure changes

## Monitoring and Maintenance

### Performance Monitoring
- Query execution time tracking
- Index usage analysis
- Connection pool monitoring
- Lock contention detection

### Maintenance Tasks
- **VACUUM** operations for space reclamation
- **ANALYZE** for query optimization
- **REINDEX** for index maintenance
- **Statistics updates** for query planning

### Health Checks
- Database connectivity
- Query response times
- Disk space usage
- Connection pool status
- Replication lag (if applicable)

## Security Considerations

### Data Encryption
- **At rest**: Database-level encryption
- **In transit**: TLS/SSL connections
- **Application level**: Sensitive field encryption

### Access Control
- **Role-based access** with least privilege
- **Connection limits** per user
- **IP whitelisting** for admin access
- **Audit logging** for all changes

### Data Privacy
- **PII encryption** for sensitive fields
- **Data retention policies** for compliance
- **Right to deletion** implementation
- **Data anonymization** for analytics

## Migration Strategy

### Schema Changes
1. **Backward compatible** changes first
2. **Data migration** scripts
3. **Index creation** with CONCURRENTLY
4. **Constraint addition** after data validation
5. **Old column removal** after verification

### Version Control
- **Database schema** versioning
- **Migration scripts** in version control
- **Rollback procedures** for each migration
- **Testing** in staging environment

## Scaling Considerations

### Read Replicas
- **Product catalog** queries on read replica
- **Analytics queries** on dedicated replica
- **Search queries** on optimized replica

### Partitioning
- **Orders table** by date for historical data
- **Event inquiries** by event date
- **User sessions** by user ID

### Caching Strategy
- **Redis** for session storage
- **Application-level** caching for products
- **CDN** for static content
- **Database query** result caching
