Prepared by Grey Chair Digital | October 2025

1) Technology Stack Selection
 

Frontend
Framework: Next.js 14 (App Router) + TypeScript

Reasons: SSR/SSG/ISR for SEO & speed, file-based routing, built-in image/CDN, API routes for light backend, Edge support.

UI: Tailwind CSS + Framer Motion (micro-interactions)

Design System: Tokens from Prompt 8; components in Radix UI/shadcn if needed.

Backend
Runtime: Next.js Route Handlers (Node 20) for lightweight APIs.

Workers/Jobs: Vercel Cron + Upstash Redis (queues via BullMQ) for Square sync & email jobs.

CMS: Sanity (schemas: pages, blog posts, promos, FAQs, event space content).

Search (optional): Algolia for fast product search (mirrors Square catalog).

Commerce & Data Sources
POS / Catalog / Orders: Square APIs (Catalog, Inventory, Orders, Checkout Links).

Square remains single source of truth for products, prices, inventory.

CMS Data: Sanity (non-commerce content only).

Operational DB (lightweight): Postgres (Neon) for site-owned entities (event inquiries, form submissions, sync logs, feature flags).

Can be swapped for PlanetScale/MySQL if preferred.

Payments
Primary: Square Checkout Links or Square Payments (to minimize PCI scope).

If using Links: server generates per-item/cart link; Square hosts payment.

Hosting / CDN / Caching
Hosting/CDN: Vercel (Edge Network, Image Optimization, Static file CDN).

Cache: Upstash Redis for API responses (catalog snapshots, new arrivals), stale-while-revalidate via ISR.

Observability
Analytics: GA4, Vercel Analytics.

Logs/Monitoring: Sentry (errors, performance), Logtail (structured logs).

2) System Architecture
High-Level (text diagram)


[Browser/Mobile]
     │
     ▼
[Vercel Edge/CDN] ── serves static assets, ISR pages, images
     │
     ├─► Next.js App Router (SSR/ISR pages)
     │     │
     │     ├─► Route Handlers /api/*
     │     │        ├─ Square APIs (Catalog, Inventory, Orders, Webhooks)
     │     │        ├─ Sanity CMS (content)
     │     │        ├─ Supabase Postgres (inquiries, logs)
     │     │        └─ Upstash Redis (cache/queues)
     │
     └─► Cron Jobs (Vercel) → Queue workers (BullMQ on Vercel/Serverless)
                  └─ Square reconciliation + Algolia indexing
Modular Layers
Presentation: Next.js pages & components (design tokens, Tailwind).

Domain Services: lib/ modules for Catalog, Inventory, Events, Content, Email.

Integration Adapters: Square SDK client, Sanity client, Neon client, Mailchimp/HubSpot.

Data: Square (authoritative commerce), Sanity (content), Postgres (operational), Redis (cache).

Webhooks: /api/webhooks/square triggers cache purge + ISR revalidation.

3) Functional Specifications
Commerce
Product listing (filters: Genre, Condition, Price, Decade, Label).

Product detail (pressing, label, condition, media).

Cart:

Option A (lightweight): “Add to Cart” → generate Square Checkout Link (client redirects).

Option B (custom cart): Local cart → server composes Square Order → hosted checkout.

New Arrivals / Coming Soon (auto collections via Square categories/tags).

Local pickup flag via Square fulfillment.

Events
Event Space page with gallery, FAQs, rate bands, calendar module.

Inquiry form → Postgres + CRM (Mailchimp/HubSpot) + email to store.

Content
“Groove Notes” blog (Sanity).

About, Contact, Partners (“Where to Find Us”), Sales & Promotions (Sanity).

Lead Gen & CRM
Newsletter capture (Mailchimp audiences w/ tags: Collector, Gifter, Event).

Event inquiry pipeline (HubSpot Starter optional).

User Roles
Admin (store owner): Manages content in Sanity; promotions; views inquiries; triggers resync.

Staff: Reads inquiries & marks handled.

Customer: Browse, buy via Square; optional account later (roadmap).

4) API Contracts (examples)
Base path: /api/* (Next.js route handlers). All responses JSON; errors { error: string, code?: string }.

4.1 Catalog
GET /api/catalog?filter=genre:rock,condition:vgplus&limit=24&cursor=...

Response



{
  "items": [
    {
      "id": "sq_123",
      "title": "Dark Side of the Moon",
      "artist": "Pink Floyd",
      "label": "Harvest",
      "condition": "VG+",
      "price": 2499,
      "currency": "USD",
      "image": "https://cdn...",
      "in_stock": true,
      "tags": ["rock","70s","classic"]
    }
  ],
  "cursor": "eyJwYWdlIjoyfQ=="
}
GET /api/products/:id



{
  "id": "sq_123",
  "sku": "PF-DSOTM-1973",
  "title": "Dark Side of the Moon",
  "artist": "Pink Floyd",
  "details": {
    "pressing": "1973, US, Harvest",
    "media_condition": "VG+",
    "sleeve_condition": "VG",
    "format": "LP"
  },
  "price": 2499,
  "images": ["https://.../1.jpg","https://.../2.jpg"],
  "in_stock": true
}
4.2 New Arrivals
GET /api/new-arrivals?days=14&limit=20

4.3 Checkout Link
POST /api/checkout

Request



{
  "line_items": [
    {"catalog_object_id": "sq_123", "quantity": 1}
  ],
  "fulfillment": "PICKUP"
}
Response



{ "checkout_url": "https://square.link/u/abc123" }
4.4 Event Inquiry
POST /api/event-inquiry

Request



{
  "name": "Alex Doe",
  "email": "alex@example.com",
  "phone": "555-1234",
  "date": "2025-11-18",
  "attendance": 60,
  "notes": "Acoustic set."
}
Response



{ "status": "received", "id": "inq_7f2b3c" }
4.5 Webhooks
POST /api/webhooks/square

Events: inventory.count.updated, catalog.version.updated, order.created

Action: purge Redis keys, trigger ISR revalidate (/shop, product pages).

5) Database Schema (Postgres for operational data)
Entities

event_inquiries (id, name, email, phone, date, attendance, notes, status, created_at)

contact_messages (id, name, email, subject, message, created_at)

sync_logs (id, source, type, status, meta jsonb, created_at)

product_snapshots (square_id pk, title, artist, label, condition, price_cents, tags text[], image_url, updated_at)

inventory_snapshots (square_id fk, quantity, location_id, updated_at)

feature_flags (key pk, value jsonb, updated_at)

users (id, email, role enum(‘admin’,‘staff’), password_hash? if local admin, created_at)

(Admin auth can be via Sanity/NextAuth — see Security.)

Relationships

inventory_snapshots.square_id → product_snapshots.square_id

No orders stored locally (Square authoritative).

event_inquiries independent (used by CRM).

ERD (text)



product_snapshots (1)───(∞) inventory_snapshots
event_inquiries (standalone)
contact_messages (standalone)
sync_logs (standalone)
users (standalone) -> used for admin dashboard auth
6) Security, Compliance & Performance
Security
Auth (Admin): NextAuth w/ Email Magic Link or OAuth (Google). Admin list allow-list in env.

Customer Payments: Offloaded to Square (reduces PCI scope).

Input Validation: Zod schemas on all API routes.

Rate Limiting: Redis token bucket (IP + route) e.g., 60 req/min.

Bot/Spam: hCaptcha/reCAPTCHA v3 on forms + honey pot.

Headers: Helmet (via Next middleware), strict CSP, HSTS, X-Frame-Options, Referrer-Policy.

Secrets: Vercel Encrypted Env; rotate Square tokens annually.

PII: Store minimum viable; retention policy (e.g., delete inquiries >18 months).

Compliance
PCI DSS: Out of scope (Square hosted checkout).

GDPR/CCPA (basic): Consent banner, privacy policy, DSAR email, GA4 IP anonymize.

Performance
Rendering: Prefer ISR for catalog pages; SSR only when needed.

Caching: Redis for list endpoints (TTL 60–300s).

Images: Vercel Image Optimization, AVIF/WebP; responsive sizes.

Code Splitting: Dynamic imports for heavy modules.

Core Web Vitals Targets: LCP < 2.5s, CLS < 0.1, INP < 200ms.

7) Scalability & Extensibility
Stateless scaling on Vercel; edge-first for read routes.

Queue-backed jobs (BullMQ) for sync/index tasks; can move to Cloud Run/Workers if heavy.

Module boundaries: catalog/, inventory/, checkout/, events/, content/, marketing/.

Plugin points:

Search provider (Algolia ↔ Meilisearch)

CRM (Mailchimp ↔ HubSpot)

Payments (Square ↔ Stripe)

Auth (NextAuth providers)

8) Integration Recommendations
Area

Tool

Purpose

POS & Payments

Square APIs

Catalog, Inventory, Orders, Checkout

CMS

Sanity

Pages, blog, promos, FAQs

DB

Neon Postgres

Inquiries, logs, features

Cache/Queue

Upstash Redis

Response cache + jobs

CRM/Email

Mailchimp (starter) / HubSpot (optional)

List growth, segmentation, workflows

Analytics

GA4, Vercel Analytics, Search Console

Traffic, conversions, SEO

Error/Perf

Sentry

Exceptions, tracing

Search (opt.)

Algolia

Fast catalog search

9) Page Generation Strategy
Page Type

Data Source

Render Mode

Revalidation

Home

Sanity + Square highlights

ISR

5–10 min or webhook

Shop (list)

Square (cached)

ISR

1–5 min + webhook

Product

Square (by id)

ISR (fallback)

On webhook

Event Space

Sanity

SSG/ISR

24h

Blog

Sanity

SSG/ISR

On publish webhook

About / Partners

Sanity

SSG

On publish

Sales & Promotions

Sanity

ISR

On publish

10) Build & Deploy Workflow
Design tokens synced from Figma → tokens.json (Style Dictionary optional).

Branching: GitHub trunk w/ PRs; Vercel Preview deploys on PR.

CI Checks: TypeScript, ESLint, Prettier, unit tests (Vitest), a11y checks (jest-axe).

Secrets: Set in Vercel (SQUARE_ACCESS_TOKEN, SANITY_TOKEN, NEON_URL/KEY, UPSTASH_URL/TOKEN, MAILCHIMP_KEY, NEXTAUTH_SECRET).

Migrations: Neon SQL via db/migrations.

Monitoring: Sentry DSN set; alerts routed to email/Slack.

11) Endpoint & Module Map (Code Skeleton)


/app
  /shop
    page.tsx            // list w/ filters
    [id]/page.tsx       // product detail (ISR)
  /event-space/page.tsx
  /about/page.tsx
  /blog/[slug]/page.tsx
/api
  /catalog/route.ts
  /products/[id]/route.ts
  /new-arrivals/route.ts
  /checkout/route.ts
  /event-inquiry/route.ts
  /webhooks/square/route.ts
/lib
  square.ts             // Square client + helpers
  catalog.ts            // list, get, map to view model
  inventory.ts
  checkout.ts
  sanity.ts
  db.ts                 // Neon client
  cache.ts              // Redis helpers
  validate.ts           // zod schemas
12) Testing Strategy
Unit: Domain mappers (Square → view), validators, utilities.

Integration: API route tests (MSW to mock Square/Sanity).

E2E: Playwright flows (browse → add to cart → checkout link; submit event inquiry).

Accessibility: jest-axe on key pages; manual keyboard nav checks.

Performance: Lighthouse CI on Vercel Preview.

13) Roadmap (Post-MVP)
Customer accounts (order history, saved favorites).

Loyalty display (Square Loyalty).

Rich events calendar with ticketing.

Multi-location support (if store expands).

PWA install (offline catalog browsing).

Headless checkout with Stripe if ever decoupling from Square.

Deliverables for Prompt 10 (Scaffold)
Next.js project initialized with Tailwind, shadcn/ui, TypeScript.

Env wiring + minimal clients (Square, Sanity, Neon, Redis).

Route handlers with stubbed contracts above.

Initial schema for Neon + Sanity.

ISR pages for Home, Shop, Product, Event Space, Blog.

Webhook handlers + Redis cache layer.