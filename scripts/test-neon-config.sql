-- Test Script for Neon Database Roles and Permissions
-- Run this after setting up roles with setup-neon-roles.sql
-- This verifies that roles are created correctly and have proper permissions

-- ============================================
-- 1. VERIFY ROLES EXIST
-- ============================================
SELECT 
  rolname,
  rolcanlogin,
  rolsuper,
  rolcreaterole,
  rolcreatedb
FROM pg_roles
WHERE rolname IN ('app_user', 'readonly_user', 'neondb_owner')
ORDER BY rolname;

-- Expected: Should show all three roles with app_user and readonly_user having rolcanlogin = true

-- ============================================
-- 2. CHECK TABLE PERMISSIONS FOR APP_USER
-- ============================================
SELECT 
  grantee,
  table_schema,
  table_name,
  privilege_type
FROM information_schema.role_table_grants
WHERE grantee = 'app_user'
  AND table_schema = 'public'
ORDER BY table_name, privilege_type;

-- Expected: Should show SELECT, INSERT, UPDATE on email_list table

-- ============================================
-- 3. CHECK TABLE PERMISSIONS FOR READONLY_USER
-- ============================================
SELECT 
  grantee,
  table_schema,
  table_name,
  privilege_type
FROM information_schema.role_table_grants
WHERE grantee = 'readonly_user'
  AND table_schema = 'public'
ORDER BY table_name, privilege_type;

-- Expected: Should show only SELECT on email_list table

-- ============================================
-- 4. CHECK SEQUENCE PERMISSIONS
-- ============================================
-- First, list all sequences in the public schema
SELECT 
  schemaname,
  sequencename
FROM pg_sequences
WHERE schemaname = 'public';

-- Check sequence permissions using a simpler approach
-- This checks if sequences exist and shows their ACLs
SELECT 
  n.nspname as schema_name,
  c.relname as sequence_name,
  pg_get_userbyid(c.relowner) as owner,
  c.relacl as access_privileges
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE c.relkind = 'S'
  AND n.nspname = 'public'
ORDER BY c.relname;

-- Expected: app_user should have USAGE, SELECT on sequences

-- ============================================
-- 5. TEST CONNECTION AS APP_USER (Manual)
-- ============================================
-- Note: You'll need to test this with a connection string
-- Connection string format:
-- postgresql://app_user:aBWX752lSnoW2V@host/database?sslmode=require

-- ============================================
-- 6. VERIFY DEFAULT PRIVILEGES
-- ============================================
SELECT 
  defaclrole,
  defaclnamespace,
  defaclobjtype,
  defaclacl
FROM pg_default_acl
WHERE defaclrole IN (
  SELECT oid FROM pg_roles WHERE rolname IN ('app_user', 'readonly_user')
);

-- Expected: Should show default privileges for future tables/sequences

-- ============================================
-- 7. CHECK CURRENT CONNECTIONS (if any)
-- ============================================
SELECT 
  pid,
  usename,
  application_name,
  client_addr,
  state,
  datname
FROM pg_stat_activity
WHERE datname = current_database()
  AND usename IN ('app_user', 'readonly_user')
ORDER BY usename;

-- Expected: May show active connections if testing is in progress

-- ============================================
-- NOTES:
-- ============================================
-- After running this script:
-- 1. Verify all roles exist
-- 2. Check that permissions are correct
-- 3. Test connection with app_user credentials
-- 4. Test connection with readonly_user credentials
-- 5. Verify app_user can INSERT/UPDATE
-- 6. Verify readonly_user can only SELECT

