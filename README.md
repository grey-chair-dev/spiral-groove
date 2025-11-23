# Spiral Groove Records – Coming Soon Page

> Minimal coming soon page for Spiral Groove Records with email capture functionality.

## 🚀 Quick Start

```bash
npm install
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
- **`/api/newsletter`** - Email signup endpoint that:
  - Validates input with Zod
  - Saves to Neon PostgreSQL database
  - Optionally sends to Make.com webhook
  - Handles both camelCase and snake_case database schemas

### Features
- ✅ Mobile-first responsive design
- ✅ Email capture with database storage
- ✅ Webhook integration (Make.com)
- ✅ SEO metadata and structured data
- ✅ Route protection (only coming soon page accessible)
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
SGR_DATABASE_URL=your_neon_postgresql_connection_string
# Or for local development:
DATABASE_URL=your_neon_postgresql_connection_string

# Optional: Make.com Webhook
MAKE_WEBHOOK_URL=your_make_webhook_url
```

## 📊 Database Schema

The `email_list` table should have:
- `id` (auto-incrementing primary key)
- `firstName` or `first_name` (optional)
- `lastName` or `last_name` (optional)
- `email` (required, unique)
- `source` (string)
- `createdAt` or `created_at` (timestamp)
- `updatedAt` or `updated_at` (timestamp)

The code automatically handles both camelCase (Prisma default) and snake_case naming conventions.

## 🚦 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

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
- ✅ **Rate Limiting**: 5 requests per 15 minutes per IP on API routes
- ✅ **Input Validation**: Zod schema validation on all forms
- ✅ **SQL Injection Prevention**: Parameterized queries
- ✅ **Privacy Policy**: Available at `/privacy`

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
