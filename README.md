# Spiral Groove Records

A modern e-commerce platform for vinyl record enthusiasts, built with Next.js 14, featuring real-time Square POS integration, event management, and a vibrant neon design system.

## 🎵 Features

- **E-commerce Platform**: Complete product catalog, shopping cart, and checkout system
- **Square POS Integration**: Real-time inventory sync and payment processing
- **Event Management**: Event space booking and inquiry system
- **Community Features**: User accounts, reviews, and wishlist functionality
- **Content Management**: Blog system and dynamic page management
- **Modern Design**: Neon-themed UI with dark mode and smooth animations
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Type Safety**: Full TypeScript implementation with Zod validation
- **Performance**: Optimized with Next.js 14 App Router and serverless functions

## 🚀 Tech Stack

### Frontend
- **Next.js 14** with App Router
- **React 19** with TypeScript
- **Tailwind CSS** with custom neon theme
- **Framer Motion** for animations
- **Zustand** for state management
- **React Hook Form** with Zod validation
- **Lucide React** for icons

### Backend
- **Next.js API Routes** (serverless)
- **NextAuth.js** for authentication
- **PostgreSQL** with Prisma ORM
- **JWT** for session management
- **bcryptjs** for password hashing

### Integrations
- **Square POS/Payments** API
- **Resend/Nodemailer** for email
- **Google Analytics 4** and **Mixpanel**
- **Cloudinary** for image management
- **Vercel KV** for caching

### Development
- **TypeScript** with strict mode
- **ESLint** and **Prettier** for code quality
- **Jest** and **React Testing Library** for testing
- **Prisma** for database management

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- PostgreSQL database (or Neon for production)
- Square developer account (optional)
- Email service account (optional)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd spiral-groove
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` with your configuration:
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/spiral_groove"
   DIRECT_URL="postgresql://username:password@localhost:5432/spiral_groove"
   
   # Authentication
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-nextauth-secret"
   JWT_SECRET="your-jwt-secret"
   
   # Feature Flags (set to true to enable)
   ENABLE_SQUARE_INTEGRATION="false"
   ENABLE_EMAIL_SERVICE="false"
   ENABLE_ANALYTICS="false"
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Push schema to database
   npm run db:push
   
   # Or run migrations
   npm run db:migrate
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🗄️ Database Setup

### Using Neon (Recommended for Production)

1. Create a Neon account at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string to your `.env.local`
4. Run the schema setup:
   ```bash
   # Use the combined schema file
   psql $DATABASE_URL -f db/schema.sql
   ```

### Using Local PostgreSQL

1. Install PostgreSQL locally
2. Create a database:
   ```sql
   CREATE DATABASE spiral_groove;
   ```
3. Run the schema files in order:
   ```bash
   psql spiral_groove -f db/schema/01_users.sql
   psql spiral_groove -f db/schema/02_products.sql
   psql spiral_groove -f db/schema/03_orders.sql
   psql spiral_groove -f db/schema/04_cart.sql
   psql spiral_groove -f db/schema/05_events.sql
   psql spiral_groove -f db/schema/06_content.sql
   psql spiral_groove -f db/schema/07_indexes.sql
   ```

## 🔧 Configuration

### Feature Flags

The application uses feature flags to enable/disable integrations:

```env
# Square Integration
ENABLE_SQUARE_INTEGRATION="true"
SQUARE_APPLICATION_ID="your-app-id"
SQUARE_ACCESS_TOKEN="your-access-token"
SQUARE_ENVIRONMENT="sandbox" # or "production"

# Email Service
ENABLE_EMAIL_SERVICE="true"
EMAIL_SERVICE="resend" # or "nodemailer"
RESEND_API_KEY="your-resend-key"

# Analytics
ENABLE_ANALYTICS="true"
GOOGLE_ANALYTICS_ID="G-XXXXXXXXXX"
MIXPANEL_TOKEN="your-mixpanel-token"

# Image CDN
ENABLE_IMAGE_CDN="true"
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Caching
ENABLE_REDIS_CACHE="true"
KV_REST_API_URL="your-vercel-kv-url"
KV_REST_API_TOKEN="your-vercel-kv-token"
```

### Square Integration

1. Create a Square developer account
2. Create a new application
3. Get your Application ID and Access Token
4. Set up webhooks for real-time sync
5. Enable the feature flag and add credentials

### Email Service

Choose between Resend or Nodemailer:

**Resend (Recommended)**
```env
EMAIL_SERVICE="resend"
RESEND_API_KEY="your-resend-api-key"
```

**Nodemailer (SMTP)**
```env
EMAIL_SERVICE="nodemailer"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
```

## 📁 Project Structure

```
spiral-groove/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   ├── auth/              # Authentication pages
│   │   ├── admin/             # Admin dashboard
│   │   └── (pages)/           # Public pages
│   ├── components/            # React components
│   │   ├── ui/               # Base UI components
│   │   └── features/         # Feature-specific components
│   ├── lib/                  # Utility functions
│   │   ├── integrations/     # Third-party integrations
│   │   ├── auth.ts          # Authentication utilities
│   │   ├── api-utils.ts     # API utilities
│   │   ├── validations.ts   # Zod schemas
│   │   └── feature-flags.ts # Feature flag management
│   ├── hooks/                # Custom React hooks
│   ├── types/                # TypeScript type definitions
│   └── styles/               # Global styles
├── db/                       # Database files
│   ├── schema/              # SQL schema files
│   └── migrations/          # Database migrations
├── docs/                    # Documentation
├── prisma/                  # Prisma schema
└── public/                  # Static assets
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Start the production server**
   ```bash
   npm start
   ```

### Environment Variables for Production

Make sure to set all required environment variables in your production environment:

- Database connection strings
- Authentication secrets
- Third-party API keys
- Feature flags
- Analytics tracking IDs

## 📚 API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Product Endpoints

- `GET /api/products` - Get products with filtering and pagination
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (admin)
- `PUT /api/products/:id` - Update product (admin)
- `DELETE /api/products/:id` - Delete product (admin)

### Cart Endpoints

- `GET /api/cart` - Get user's cart
- `POST /api/cart/add` - Add item to cart
- `PUT /api/cart/:itemId` - Update cart item
- `DELETE /api/cart/:itemId` - Remove cart item

### Order Endpoints

- `GET /api/orders` - Get user's orders
- `POST /api/orders` - Create new order
- `GET /api/orders/:id` - Get order details
- `PUT /api/orders/:id/status` - Update order status (admin)

### Event Endpoints

- `GET /api/events` - Get events
- `POST /api/events` - Create event (admin)
- `POST /api/events/inquiry` - Submit event inquiry

## 🎨 Design System

The application uses a custom neon-themed design system built on Tailwind CSS:

### Colors
- **Neon Colors**: Pink, Cyan, Green, Purple, Orange, Yellow
- **Dark Theme**: 50-950 scale with vinyl-inspired accents
- **Brand Colors**: Primary and secondary color palettes

### Components
- **Buttons**: Multiple variants with neon effects
- **Cards**: Glass-morphism with neon borders
- **Inputs**: Custom styling with validation states
- **Typography**: Display fonts for headings

### Animations
- **Neon Glow**: Pulsing and glowing effects
- **Hover Effects**: Scale, lift, and glow animations
- **Page Transitions**: Smooth fade and slide effects

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@spiralgroove.com or join our Discord community.

## 🙏 Acknowledgments

- Square for POS integration
- Vercel for hosting and deployment
- The React and Next.js communities
- All the vinyl record enthusiasts who inspired this project

---

**Built with ❤️ for the vinyl community**