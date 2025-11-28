# Curated E-Commerce Template Data Model

This schema enriches data coming from the External Commerce System (ECS, e.g., ECS, Shopify) and powers reusable customer features such as wishlists, orders, and staff-driven enrichment flows. Names are intentionally ECS-agnostic so this template can be re-skinned for any vertical.

> **Implementation note:** The existing SQL migrations still use `ECS_Item` naming. When the codebase is updated, the new canonical names below should replace those identifiers (or be introduced via views that alias the legacy tables).

## 1. Inventory Core & Enrichment

| Table | Purpose | Key Fields | Relationships |
| --- | --- | --- | --- |
| `ECS_Item` | Cache of items synchronized from the ECS. Updated via cron + webhooks. | `ecs_item_id (PK, TEXT)`, `name`, `base_price`, `stock_level`, `updated_at` | 1:1 with `Item_Detail`; 1:M with junction tables |
| `Item_Detail` | Web-only enrichment (copy, merchandising data, media assets). | `ecs_item_id (PK, FK)`, `condition_primary`, `format`, `full_description`, `is_staff_pick`, `thumbnail_url` | 1:1 with `ECS_Item` |

## 2. Enrichment & Categorization

| Table | Description | Key Fields | Relationships |
| --- | --- | --- | --- |
| `Item_Genre` | Master list of genres/categories. | `genre_id (PK)`, `name (UNIQUE)` | Referenced by `Item_Genre_Map` |
| `Item_Label` | Product labels, brands, or vendors. | `label_id (PK)`, `name (UNIQUE)` | Referenced by `Item_Label_Map` |
| `Item_Creator` | Makers, designers, or manufacturers. | `creator_id (PK)`, `name (UNIQUE)` | Referenced by `Item_Creator_Map` |

## 3. Junction Tables

| Table | Purpose | Key Fields | Relationships |
| --- | --- | --- | --- |
| `Item_Genre_Map` | Associates an item with multiple genres/tags. | `ecs_item_id (FK)`, `genre_id (FK)` (composite PK) | Links `ECS_Item` ↔ `Item_Genre` |
| `Item_Label_Map` | Associates an item with multiple labels/brands. | `ecs_item_id (FK)`, `label_id (FK)` | Links `ECS_Item` ↔ `Item_Label` |
| `Item_Creator_Map` | Associates an item with multiple creators/makers. | `ecs_item_id (FK)`, `creator_id (FK)` | Links `ECS_Item` ↔ `Item_Creator` |

## 4. Customer & Commerce Tables

| Table | Purpose | Key Fields | Relationships |
| --- | --- | --- | --- |
| `Customer` | Authenticated shoppers. | `customer_id (PK)`, `email (UNIQUE)`, `password_hash`, `name` | 1:M `Order`, `Wishlist_Item` |
| `Staff_User` | Client/staff portal users. | `user_id (PK)`, `email (UNIQUE)`, `password_hash`, `role` | Administers enrichment + DLQ tooling |
| `Wishlist_Item` | Saved products per customer. | `(customer_id, ecs_item_id)` composite PK | FK to `Customer` + `ECS_Item` |
| `Order` | E-commerce order header. | `order_id (PK)`, `order_number (UNIQUE)`, `customer_id (FK, nullable)`, `total_amount`, `current_status` | 1:M `Order_Item` |
| `Order_Item` | Items within an order. | `order_item_id (PK)`, `order_id (FK)`, `ecs_item_id (FK)`, `quantity`, `price_at_purchase` | FK to `Order` + `ECS_Item` |

## 5. Event & Inquiry Capture (New)

| Table | Purpose | Key Fields |
| --- | --- | --- |
| `Event_Inquiry` | Stores event space / rental inquiries submitted from the CMS. | `inquiry_id (PK)`, `name`, `email`, `phone`, `event_type`, `preferred_date`, `message`, `source`, `created_at` |

## Migration Guidance

1. Introduce new ECS-agnostic table names via SQL migrations (either rename existing tables or create views for backward compatibility).
2. Update ORM/SQL queries in `migrations/`, `scripts/schema.sql`, and API layers to the new names.
3. Backfill `Event_Inquiry` table and expose it through the new API endpoint defined in `docs/project_apis.md`.


