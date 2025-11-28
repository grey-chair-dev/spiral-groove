# Neon Database Configuration Guide

## Overview

This guide covers configuring database roles and connection pooling settings in Neon for optimal performance and security.

## 🔐 Database Roles

### Default Roles in Neon

Neon provides several default roles:

1. **Owner Role** - Full database access (created automatically)
2. **Read-Only Role** - For read-only operations (recommended for production)
3. **Application Role** - For application connections (recommended)

### Creating Custom Roles

#### 1. Via Neon Dashboard

1. Go to your Neon project dashboard
2. Navigate to **SQL Editor**
3. Run the following SQL:

```sql
-- Create a read-only role for monitoring/reporting
CREATE ROLE readonly_user WITH LOGIN PASSWORD 'your_secure_password';

-- Grant connect privilege
GRANT CONNECT ON DATABASE your_database_name TO readonly_user;

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO readonly_user;

-- Grant select on all tables
GRANT SELECT ON ALL TABLES IN SCHEMA public TO readonly_user;

-- Grant select on future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public 
  GRANT SELECT ON TABLES TO readonly_user;
```

#### 2. Application Role (Recommended)

For the application, use a dedicated role with limited permissions:

```sql
-- Create application role
CREATE ROLE app_user WITH LOGIN PASSWORD 'your_secure_password';

-- Grant necessary privileges
GRANT CONNECT ON DATABASE your_database_name TO app_user;
GRANT USAGE ON SCHEMA public TO app_user;
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO app_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_user;

-- Grant privileges on future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public 
  GRANT SELECT, INSERT, UPDATE ON TABLES TO app_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public 
  GRANT USAGE, SELECT ON SEQUENCES TO app_user;
```

### Security Best Practices

1. **Use Strong Passwords**: Generate secure passwords for each role
2. **Principle of Least Privilege**: Only grant necessary permissions
3. **Separate Roles**: Use different roles for different purposes
4. **Rotate Credentials**: Regularly rotate database passwords

## 🧱 Schema Changes & Migrations

- All schema changes are tracked via SQL files in the root `migrations/` directory.
- The migration runner (`scripts/migrate.js`) uses the application connection string and maintains a `schema_migrations` ledger inside the database. Make sure this table (and the `update_timestamp` function) are owned by `app_user` so migrations run without `SET ROLE`.
- Commands:
  - `npm run db:migrate` – apply any pending migrations
  - `npm run db:migrate:status` – show applied vs pending migrations
- For destructive local resets, drop the schema (or run `scripts/dev-reset-schema.sql`) and then re-run `npm run db:migrate`.
- Avoid running ad-hoc `DROP/CREATE` statements directly in production; add a migration file instead so all environments stay in sync.

## 🔄 Connection Pooling

### Neon Connection Pooling Options

Neon offers two connection pooling modes:

#### 1. Direct Connection (Default)
- Direct connection to the database
- Lower latency
- Limited concurrent connections
- Good for: Development, low-traffic applications

#### 2. Connection Pooling (Recommended for Production)
- Uses PgBouncer for connection pooling
- Higher concurrent connection capacity
- Slightly higher latency
- Good for: Production, high-traffic applications

### Connection String Formats

#### Direct Connection
```
postgresql://user:password@host/database?sslmode=require
```

#### Pooled Connection (Recommended)
```
postgresql://user:password@host/database?sslmode=require&pgbouncer=true
```

Or use the pooled endpoint (if available):
```
postgresql://user:password@pooler-host/database?sslmode=require
```

### Configuring Connection Pooling in Neon

#### Option 1: Via Connection String

Update your `.env.local`:

```env
# Direct connection (development)
DATABASE_URL=postgresql://user:password@host/database?sslmode=require

# Pooled connection (production - recommended)
LCT_DATABASE_URL=postgresql://user:password@host/database?sslmode=require&pgbouncer=true
```

#### Option 2: Via Neon Dashboard

1. Go to your Neon project
2. Navigate to **Connection Details**
3. Select **Connection Pooling** tab
4. Enable connection pooling
5. Copy the pooled connection string
6. Update your environment variables

### Pooling Modes

Neon supports different pooling modes:

1. **Transaction Mode** (Recommended)
   - Connections are pooled per transaction
   - Best for most applications
   - Use: `?pgbouncer=true` or pooled endpoint

2. **Session Mode**
   - Connections are pooled per session
   - Use when you need session-level features
   - Not recommended for serverless

### Connection Pool Settings

#### Recommended Settings for Serverless (Vercel)

```env
# Use pooled connection
DATABASE_URL=postgresql://user:password@pooler-host/database?sslmode=require

# Optional: Connection timeout (seconds)
# Default: 30
# DATABASE_URL=...&connect_timeout=10

# Optional: Statement timeout (milliseconds)
# Default: 0 (no timeout)
# DATABASE_URL=...&statement_timeout=30000
```

#### For @neondatabase/serverless

The `@neondatabase/serverless` package automatically handles connection pooling, but you can optimize:

```typescript
// lib/db.ts
import { neon } from '@neondatabase/serverless';

const databaseUrl = process.env.LCT_DATABASE_URL || process.env.DATABASE_URL;

// The neon() function automatically uses connection pooling
// No additional configuration needed
const sql = neon(databaseUrl);

export { sql };
```

### Connection Limits

#### Neon Free Tier
- **Direct connections**: ~100 concurrent
- **Pooled connections**: Higher capacity (varies by plan)

#### Neon Paid Plans
- Higher connection limits
- Better performance
- More predictable scaling

### Monitoring Connections

#### Check Active Connections

```sql
-- View current connections
SELECT 
  pid,
  usename,
  application_name,
  client_addr,
  state,
  query_start,
  state_change
FROM pg_stat_activity
WHERE datname = current_database()
ORDER BY query_start;
```

#### Check Connection Count

```sql
-- Count connections by user
SELECT 
  usename,
  count(*) as connection_count
FROM pg_stat_activity
WHERE datname = current_database()
GROUP BY usename;
```

## 🚀 Implementation Steps

### Step 1: Create Application Role

1. Open Neon SQL Editor
2. Run the application role creation script (above)
3. Save the credentials securely

### Step 2: Update Connection String

1. Get pooled connection string from Neon dashboard
2. Update `.env.local`:
   ```env
   LCT_DATABASE_URL=postgresql://app_user:password@pooler-host/database?sslmode=require&pgbouncer=true
   ```

### Step 3: Test Connection

```bash
# Test the connection
npm run dev

# Or test directly
curl http://localhost:3000/api/health
```

### Step 4: Monitor Performance

- Check Neon dashboard for connection metrics
- Monitor query performance
- Watch for connection errors

## 📊 Best Practices

### For Development
- Use direct connection (lower latency)
- Use owner role or application role
- Connection string: `DATABASE_URL`

### For Production
- Use pooled connection (higher capacity)
- Use dedicated application role (not owner)
- Connection string: `LCT_DATABASE_URL` (with pooling)
- Enable SSL: `?sslmode=require`
- Set appropriate timeouts

### Connection String Security
- Never commit connection strings to git
- Use environment variables
- Rotate credentials regularly
- Use different credentials per environment

### Performance Optimization
1. **Use Connection Pooling**: Essential for serverless
2. **Set Timeouts**: Prevent hanging connections
3. **Monitor Connections**: Watch for leaks
4. **Use Indexes**: Optimize queries
5. **Limit Query Time**: Use statement timeouts

## 🔍 Troubleshooting

### Connection Errors

**Error: "too many connections"**
- Solution: Enable connection pooling
- Check: Connection limits in Neon dashboard

**Error: "connection timeout"**
- Solution: Increase `connect_timeout` in connection string
- Check: Network connectivity

**Error: "SSL required"**
- Solution: Add `?sslmode=require` to connection string

### Performance Issues

**Slow queries**
- Check: Query execution plans
- Optimize: Add indexes
- Review: Connection pooling settings

**High connection count**
- Check: Connection leaks in code
- Solution: Ensure connections are closed
- Use: Connection pooling

## 📚 Additional Resources

- [Neon Connection Pooling Docs](https://neon.tech/docs/connect/connection-pooling)
- [Neon Security Best Practices](https://neon.tech/docs/security)
- [@neondatabase/serverless Docs](https://github.com/neondatabase/serverless)

## 🧪 Testing

### Quick Test Script

Run the automated test script:

```bash
./scripts/test-neon-connection.sh
```

This will test:
- Server connectivity
- Health check endpoint
- Database connection
- Database write operations
- Connection string configuration

### Manual Testing Steps

1. **Test Health Check:**
   ```bash
   curl http://localhost:3000/api/health | jq '.'
   ```
   Should return `"status": "healthy"` for database

2. **Test Database Write:**
   ```bash
   curl -X POST http://localhost:3000/api/newsletter \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","firstName":"Test","lastName":"User"}' | jq '.'
   ```
   Should return `"success": true`

3. **Verify Roles in Neon:**
   - Run `scripts/test-neon-config.sql` in Neon SQL Editor
   - Check that roles exist and have correct permissions

4. **Test Connection Pooling:**
   - Check Neon dashboard for connection metrics
   - Monitor connection count during load testing

## ✅ Checklist

- [ ] Create dedicated application role
- [ ] Set up connection pooling
- [ ] Update connection strings in `.env.local`
- [ ] Test connection with health check
- [ ] Run test script: `./scripts/test-neon-connection.sh`
- [ ] Verify roles with `scripts/test-neon-config.sql`
- [ ] Monitor connection metrics
- [ ] Set up connection timeouts
- [ ] Document credentials securely
- [ ] Rotate credentials regularly

