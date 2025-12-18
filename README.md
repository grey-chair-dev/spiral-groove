# Spiral Groove Records – E-Commerce Website

> Full-featured e-commerce website for Spiral Groove Records with Square payment integration, order management, and analytics tracking.

## 🚀 Quick Start

```bash
npm install
npm run dev
# open http://localhost:5173
```

## 📋 What's Included

### Pages & Features
- **Homepage** - Hero section, featured products, store information
- **Catalog** - Browse all products with filtering and search
- **Product Details** - Individual product pages with add to cart
- **Shopping Cart** - View and manage cart items
- **Checkout** - Multi-step checkout with Square payment integration
- **Order Management** - Order confirmation, status lookup, order history
- **User Accounts** - Sign up, login, user dashboard
- **Newsletter** - Email signup with database storage
- **Search** - Full-text product search
- **About/Contact** - Store information and contact forms

### API Routes
- **`/api/newsletter`** - Newsletter signup endpoint
- **`/api/pay`** - Square payment processing
- **`/api/orders`** - Order lookup and management
- **`/api/orders/update`** - Order status updates (webhook)
- **`/api/products`** - Product catalog API
- **`/api/signup`** - User registration
- **`/api/forgot-password`** - Password reset

### Email System
- **Unified Email Webhook** - All emails sent via `MAKE_EMAIL_WEBHOOK_URL`
- **Email Types Supported:**
  - Newsletter signup confirmations
  - Order confirmations
  - Order status updates
  - User signup confirmations
  - Password reset emails

### Analytics
- **Google Analytics 4** - Full e-commerce tracking
- **Events Tracked:**
  - Page views
  - Product views
  - Add to cart / Remove from cart
  - Checkout initiation
  - Purchase completion
  - Search queries
  - Newsletter signups
  - User signups and logins

## 🛠️ Tech Stack

- **Framework**: React 19.2.1 with React Router
- **Build Tool**: Vite 5.4.21
- **Styling**: Tailwind CSS 3.4.19
- **Database**: Neon PostgreSQL
- **Payment**: Square Web SDK
- **Analytics**: Google Analytics 4
- **Deployment**: Vercel (Serverless Functions)
- **TypeScript**: Full type safety

## 📁 Project Structure

```
├── api/                      # Vercel serverless functions
│   ├── pay.js               # Square payment processing
│   ├── orders.js            # Order lookup
│   ├── orders/update.js     # Order status updates
│   ├── newsletter.js        # Newsletter signup
│   ├── sendEmail.js         # Unified email webhook
│   ├── emailTemplates.js    # HTML email templates
│   └── db.js                # Database connection
├── src/
│   ├── components/          # React components
│   ├── utils/               # Utilities (analytics, etc.)
│   ├── services/            # Square integration
│   └── App.tsx             # Main app component
├── public/                  # Static assets
├── scripts/                # Utility scripts
└── index.html              # Entry point
```

## 🔧 Environment Variables

Create a `.env.local` file with:

```env
# Database
DATABASE_URL=your_neon_postgresql_connection_string

# Square Payment
VITE_SQUARE_APPLICATION_ID=your_square_app_id
VITE_SQUARE_LOCATION_ID=your_square_location_id
SQUARE_ACCESS_TOKEN=your_square_access_token
VITE_SQUARE_ENVIRONMENT=sandbox  # or 'production'

# Email Webhook
MAKE_EMAIL_WEBHOOK_URL=https://hook.us2.make.com/...

# Analytics
VITE_GA4_MEASUREMENT_ID=G-XXXXXXXXXX

# Optional: Webhook Secret
WEBHOOK_SECRET=your_webhook_secret
```

## 📊 Database Schema

### Tables
- **`email_list`** - Newsletter subscribers
- **`users`** - User accounts
- **`password_reset_tokens`** - Password reset tokens
- **`customers`** - Customer information
- **`orders`** - Order records
- **`order_items`** - Order line items

See database migration files or schema documentation for details.

## 🚦 Available Scripts

- `npm run dev` - Start development server (runs `build:css` first)
- `npm run build` - Build for production (runs `build:css` first)
- `npm run build:css` - Generate Tailwind CSS
- `npm run dev:api` - Start API development server
- `npm run preview` - Preview production build

## 📧 Email System

All emails are sent through a unified webhook system:

1. **Email Types:**
   - `newsletter` - Newsletter signup confirmation
   - `order_confirmation` - Order confirmation email
   - `order_status_update` - Order status change notifications
   - `signup` - User account creation
   - `forgot_password` - Password reset

2. **Configuration:**
   - Set `MAKE_EMAIL_WEBHOOK_URL` environment variable
   - All emails include full HTML content
   - Emails match website design (fonts, colors, branding)

3. **Testing:**
   - Run `node scripts/test-emails.mjs [email]` to test all email types

## 📈 Analytics

Google Analytics 4 is integrated with comprehensive e-commerce tracking:

- **Measurement ID:** `G-7VV4DCV276`
- **Events:** All user interactions tracked
- **E-commerce:** Full purchase funnel tracking
- **Reporting:** Monthly analytics reports (see `MONTHLY_ANALYTICS_REPORTING.md`)

## 🔒 Security

- ✅ **HTTPS Enforcement**: Automatic via Vercel
- ✅ **Input Validation**: All forms validated
- ✅ **SQL Injection Prevention**: Parameterized queries
- ✅ **Payment Security**: Square PCI-compliant processing
- ✅ **Environment Variables**: Sensitive data in env vars
- ✅ **Webhook Secrets**: Optional webhook authentication

## 📝 Documentation

- **`REMAINING_TASKS.md`** - Current project status and tasks
- **`MONTHLY_ANALYTICS_REPORTING.md`** - Analytics reporting process
- **`GA4_REALTIME_VERIFICATION.md`** - GA4 verification guide
- **`SQUARE_SETUP.md`** - Square integration setup

## 🎨 Design

- Retro-inspired design with bold colors
- Custom fonts: Inter, Montserrat, Shrikhand, Gloria Hallelujah
- Mobile-first responsive layout
- Accessible components and navigation

## 🚀 Deployment

The site is deployed on Vercel:

- **Staging:** `spiralgrooverecords.greychair.io`
- **Production:** `spiralgrooverecords.com` (when live)

### Build Process
1. Generate Tailwind CSS (`npm run build:css`)
2. Build Vite app (`vite build`)
3. Deploy to Vercel (automatic on push to main)

---

Built with ❤️ for Spiral Groove Records
