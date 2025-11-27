# Spiral Groove Records – Coming Soon Page

> Minimal coming soon page for Spiral Groove Records with email capture functionality.

## 🚀 Quick Start

```bash
npm install
npm run db:migrate   # apply pending database migrations
npm run dev
# open http://localhost:3000
```

## 📋 What's Included

### Pages
- **Homepage (`/`)** - Coming soon page with:
  - Spinning record logo animation
  - Store information (address, phone, hours)
  - Email signup form (first name, last name, email)
  - Social media links (Facebook, Instagram, TikTok)
  - Neon-themed gradient background

### API Routes
- **`/api/newsletter`** - Email signup endpoint
- **`/api/products`** - Get Square catalog products (cached)
- **`/api/products/[id]`** - Get single product by Square ID
- **`/api/inventory`** - Get inventory counts (cached)
- **`/api/square/test`** - Test Square SDK integration
- **`/api/square/webhooks`** - Square webhook handler

### Features
- ✅ Mobile-first responsive design
- ✅ Email capture with database storage
- ✅ Square API integration with caching
- ✅ Product catalog sync (cached)
- ✅ Webhook integration (Square, Make.com)
- ✅ SEO metadata and structured data
- ✅ Route protection (client portal)
- ✅ Role-based staff authentication & protected CRUD APIs
- ✅ TypeScript for type safety

## 🛠️ Tech Stack

- **Framework**: Next.js 15.0.3 (App Router)
- **Styling**: Tailwind CSS
- **Database**: Neon PostgreSQL (via `@neondatabase/serverless`)
- **Validation**: Zod
- **TypeScript**: Full type safety
- **Fonts**: Inter (Google Fonts)

## 📁 Project Structure

```
├── app/
│   ├── api/
│   │   └── newsletter/
│   │       └── route.ts      # Email signup API endpoint
│   ├── globals.css            # Global styles
│   ├── layout.tsx             # Root layout with SEO metadata
│   ├── page.tsx               # Coming soon page
│   └── sitemap.ts             # Sitemap generator
├── lib/
│   ├── db.ts                  # Neon database connection
│   └── validation/
│       └── schemas.ts         # Zod validation schemas
├── middleware.ts              # Route protection
└── public/                    # Static assets (logo, favicon, etc.)
```

## 🔧 Environment Variables

Create a `.env.local` file with:

```env
# Database (Vercel uses SGR_DATABASE_URL, local uses DATABASE_URL)
# Use pooled connection for production (recommended): add &pgbouncer=true
SGR_DATABASE_URL=postgresql://user:password@host/database?sslmode=require&pgbouncer=true
# Or for local development:
DATABASE_URL=postgresql://user:password@host/database?sslmode=require

# Optional: Make.com Webhook
MAKE_WEBHOOK_URL=your_make_webhook_url
```

### Database Configuration

For optimal performance and security:
- **Production**: Use connection pooling (`&pgbouncer=true` in connection string)
- **Development**: Direct connection is fine
- **Roles**: Create dedicated application role (see `scripts/setup-neon-roles.sql`)
- **Schema Management**:
  - `npm run db:migrate` – applies SQL migrations from the `migrations/` folder
  - `npm run db:migrate:status` – reports applied vs pending migrations
  - `scripts/dev-reset-schema.sql` – destructive reset for local development only

See [docs/neon-database-configuration.md](./docs/neon-database-configuration.md) for detailed setup instructions.

### Database Migrations

- Migrations live in the `migrations/` directory and are executed sequentially.
- The runner stores history in the `schema_migrations` table so every environment stays in sync.
- Commands:
  - `npm run db:migrate` – apply pending migrations
  - `npm run db:migrate:status` – list applied and pending migrations
- The initial migration mirrors `scripts/schema.sql`. Future schema changes should be captured via additional `.sql` files.

## 📊 Database Schema

### Core Tables
- `Square_Item`, `Product_Detail`
- Lookup tables: `Artist`, `Label`, `Genre`
- Junction tables: `Vinyl_Genre`, `Vinyl_Artist`
- Commerce tables: `Staff_User`, `Customer`, `Order`, `Order_Item`, `Wishlist_Item`

### Email List Table
- `id` (auto-incrementing primary key)
- `firstName` or `first_name` (optional)
- `lastName` or `last_name` (optional)
- `email` (required, unique)
- `source` (string)
- `createdAt` or `created_at` (timestamp)
- `updatedAt` or `updated_at` (timestamp)

The code automatically handles both camelCase and snake_case naming conventions.

### Square Integration
- Products are cached (1 hour) - no database needed
- Inventory is cached (5 minutes)
- Use Square IDs directly in URLs (clean, short)

## 🚦 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test` - Run Vitest suites for DAL + staff APIs
- `psql -f scripts/schema.sql` - Apply safe schema migrations
- `psql -f scripts/dev-reset-schema.sql` - Drop & recreate schema (dev only)

## 📦 Bundle Size

- **Homepage**: 8.58 kB
- **First Load JS**: 109 kB (includes shared React/Next.js runtime)
- **API Route**: 135 B

## 🔒 Security

### Route Protection
The middleware redirects all routes except `/` to the coming soon page. Only the homepage and static assets are accessible.

### Security Features
- ✅ **HTTPS Enforcement**: Automatic via Vercel
- ✅ **Security Headers**: HSTS, CSP, X-Frame-Options, and more
- ✅ **Rate Limiting**: 5 requests per 15 minutes per IP on newsletter API (pluggable provider with Redis-ready API)
- ✅ **Input Validation**: Zod schema validation on all forms
- ✅ **SQL Injection Prevention**: Parameterized queries
- ✅ **Privacy Policy**: Available at `/privacy`
- ✅ **Role-based Auth**: JWT claims carry `staff` role, enforced in middleware and staff APIs
- ✅ **Schema change tracking**: SQL migrations + history table

See [SECURITY.md](./SECURITY.md) for complete security checklist.

## 📝 Notes

- The site is currently locked to the coming soon page only
- Full site development happens on the `dev` branch
- Email signups are saved to Neon PostgreSQL
- Make.com webhook integration is optional

## 🎨 Design

- Black background with neon gradient accents
- Spinning record logo animation
- Mobile-first responsive layout
- Clean, minimal aesthetic

---

Built with ❤️ for Spiral Groove Records
