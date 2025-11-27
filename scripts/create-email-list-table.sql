-- Create email_list table if it doesn't exist
-- This script creates the table with snake_case column names (standard PostgreSQL convention)

-- First, check if table exists and show its structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'email_list'
ORDER BY ordinal_position;

-- Create the table if it doesn't exist
CREATE TABLE IF NOT EXISTS email_list (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  email VARCHAR(255) NOT NULL UNIQUE,
  source VARCHAR(255) DEFAULT 'website',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_email_list_email ON email_list(email);

-- Grant permissions to app_user (if roles are already created)
-- Note: These will fail if roles don't exist yet, that's okay
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'app_user') THEN
    GRANT SELECT, INSERT, UPDATE ON email_list TO app_user;
    GRANT USAGE, SELECT ON SEQUENCE email_list_id_seq TO app_user;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'readonly_user') THEN
    GRANT SELECT ON email_list TO readonly_user;
  END IF;
END $$;

-- Verify the table was created
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'email_list'
ORDER BY ordinal_position;

