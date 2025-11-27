-- Neon Database Role Configuration Script
-- Run this in Neon SQL Editor to set up proper database roles

-- ============================================
-- 1. CREATE APPLICATION ROLE
-- ============================================
-- This role will be used by the application
-- Replace 'your_secure_password' with a strong password

CREATE ROLE app_user WITH LOGIN PASSWORD 'aBWX752lSnoW2V';

-- Grant connect privilege
-- Note: Replace 'neondb' with your actual database name if different
GRANT CONNECT ON DATABASE neondb TO app_user;

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO app_user;

-- Grant privileges on existing tables
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO app_user;

-- Grant privileges on sequences (for auto-increment IDs)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_user;

-- Grant privileges on future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public 
  GRANT SELECT, INSERT, UPDATE ON TABLES TO app_user;

-- Grant privileges on future sequences
ALTER DEFAULT PRIVILEGES IN SCHEMA public 
  GRANT USAGE, SELECT ON SEQUENCES TO app_user;

-- ============================================
-- 2. CREATE READ-ONLY ROLE (Optional)
-- ============================================
-- This role can be used for monitoring, reporting, or backups
-- Replace 'your_secure_password' with a strong password

CREATE ROLE readonly_user WITH LOGIN PASSWORD 'm5QTDrr13FPwDl';

-- Grant connect privilege
-- Note: Replace 'neondb' with your actual database name if different
GRANT CONNECT ON DATABASE neondb TO readonly_user;

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO readonly_user;

-- Grant select on existing tables
GRANT SELECT ON ALL TABLES IN SCHEMA public TO readonly_user;

-- Grant select on future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public 
  GRANT SELECT ON TABLES TO readonly_user;

-- ============================================
-- 3. VERIFY ROLES
-- ============================================
-- Check that roles were created successfully

SELECT 
  rolname,
  rolcanlogin,
  rolsuper
FROM pg_roles
WHERE rolname IN ('app_user', 'readonly_user');

-- ============================================
-- 4. CHECK PERMISSIONS
-- ============================================
-- Verify permissions on email_list table (if it exists)

SELECT 
  grantee,
  privilege_type
FROM information_schema.role_table_grants
WHERE table_name = 'email_list'
  AND grantee IN ('app_user', 'readonly_user');

-- ============================================
-- NOTES:
-- ============================================
-- 1. Replace 'your_secure_password' with strong passwords
-- 2. Store passwords securely (use a password manager)
-- 3. Update your .env.local with the new connection string:
--    SGR_DATABASE_URL=postgresql://app_user:password@host/database?sslmode=require&pgbouncer=true
-- 4. For production, use connection pooling (add &pgbouncer=true)
-- 5. Never commit passwords to version control

