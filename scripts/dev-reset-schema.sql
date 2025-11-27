-- PostgreSQL Database Schema Reset for Spiral Groove Records
-- File: dev-reset-schema.sql
--
-- ⚠️  DANGER ZONE  ⚠️
-- This script DROPS and RE-CREATES the core application tables.
-- It is intended for local development or disposable environments ONLY.
-- Running this against production will PERMANENTLY DELETE order/customer data.
-- The email_list table is intentionally preserved to avoid losing newsletter signups.

BEGIN;

DROP TABLE IF EXISTS "Order_Item" CASCADE;
DROP TABLE IF EXISTS "Wishlist_Item" CASCADE;
DROP TABLE IF EXISTS "Order" CASCADE;
DROP TABLE IF EXISTS "Customer" CASCADE;
DROP TABLE IF EXISTS "Staff_User" CASCADE;
DROP TABLE IF EXISTS "Vinyl_Genre" CASCADE;
DROP TABLE IF EXISTS "Vinyl_Artist" CASCADE;
DROP TABLE IF EXISTS "Genre" CASCADE;
DROP TABLE IF EXISTS "Label" CASCADE;
DROP TABLE IF EXISTS "Artist" CASCADE;
DROP TABLE IF EXISTS "Product_Detail" CASCADE;
DROP TABLE IF EXISTS "Square_Item" CASCADE;

COMMIT;

-- Recreate the schema using the canonical definitions
\i 'schema.sql'

