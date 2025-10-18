# Spiral Groove Records - Website Scaffold

A production-ready, unbranded website scaffold for Spiral Groove Records - an independent vinyl record shop in Milford, OH. Built with Next.js 14, TypeScript, and Tailwind CSS, featuring a warm analog design system and comprehensive e-commerce functionality.

## 🎵 Overview

This scaffold implements a complete website foundation for a vinyl record store, including:
- **Warm Analog Design System** - Cream, teal, and amber color palette with Playfair Display typography
- **E-commerce Functionality** - Product catalog, filtering, and checkout integration
- **Event Space Rental** - Inquiry forms and event management
- **Content Management** - Blog system and newsletter signup
- **Mobile-First Responsive Design** - Optimized for all devices
- **SEO & Performance** - Meta tags, structured data, and Core Web Vitals optimization

## 🚀 Quick Start

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd spiral-groove
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

3. **Start Development**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Styling**: Custom design system with CSS variables
- **Components**: Radix UI primitives with custom styling
- **Forms**: React Hook Form with Zod validation
- **Icons**: Heroicons and custom SVG icons
- **Fonts**: Playfair Display, Inter, Poppins (Google Fonts)

### Project Structure
```
src/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── catalog/       # Product catalog API
│   │   ├── products/      # Product details API
│   │   ├── checkout/      # Checkout API
│   │   ├── contact/       # Contact form API
│   │   ├── event-inquiry/ # Event inquiry API
│   │   └── newsletter/    # Newsletter signup API
│   ├── shop/              # Shop pages
│   ├── about/             # About page
│   ├── event-space/       # Event space page
│   ├── contact/           # Contact page
│   ├── blog/              # Blog pages
│   ├── globals.css        # Global styles & design tokens
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Homepage
│   ├── sitemap.ts         # Dynamic sitemap
│   └── robots.ts          # Robots.txt
├── components/            # React components
│   ├── navigation/        # Header, Footer
│   ├── sections/          # Page sections (Hero, About, etc.)
│   ├── pages/             # Full page components
│   └── ui/                # Reusable UI components
├── lib/                   # Utility functions & services
│   ├── integrations/      # External service integrations
│   ├── feature-flags.ts   # Feature flag management
│   ├── mock-data.ts       # Mock data for development
│   ├── constants.ts       # Application constants
│   └── utils.ts           # Helper functions
└── styles/                # Additional stylesheets
```

## 🎨 Design System

### Color Palette
- **Primary Black**: `#111111` - Main text and accents
- **Cream**: `#F5F3EE` - Background and light text
- **Muted Teal**: `#3E787C` - Primary accent color
- **Vintage Amber**: `#DDAA44` - Secondary accent
- **Vinyl Red**: `#9C2830` - Error states and highlights
- **Slate Gray**: `#7A7A7A` - Muted text and borders

### Typography
- **Display**: Playfair Display (headlines)
- **Body**: Inter (body text)
- **Accent**: Poppins (buttons and CTAs)

### Spacing Scale
- `xxs`: 4px, `xs`: 8px, `sm`: 16px, `md`: 24px, `lg`: 32px, `xl`: 64px, `xxl`: 96px

## 🔧 Configuration

### Environment Variables

Copy `.env.example` to `.env.local` and configure:

```bash
# Feature Flags
FEATURE_SQUARE_LIVE=false              # Enable live Square API
FEATURE_NEWSLETTER_ACTIVE=false        # Enable newsletter signup
FEATURE_CHECKOUT_ENABLED=false         # Enable checkout functionality
FEATURE_EVENT_INQUIRIES=true           # Enable event inquiry forms
FEATURE_BLOG_ENABLED=true              # Enable blog functionality

# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Square Integration (when FEATURE_SQUARE_LIVE=true)
SQUARE_APPLICATION_ID=your_app_id
SQUARE_ACCESS_TOKEN=your_access_token
SQUARE_ENVIRONMENT=sandbox

# Email/Marketing (when FEATURE_NEWSLETTER_ACTIVE=true)
MAILCHIMP_API_KEY=your_api_key
MAILCHIMP_LIST_ID=your_list_id

# Analytics (optional)
NEXT_PUBLIC_GA_ID=your_ga_id
```

### Feature Flags

The application uses feature flags to control functionality:

- **FEATURE_SQUARE_LIVE**: Toggle between mock data and live Square API
- **FEATURE_NEWSLETTER_ACTIVE**: Enable/disable newsletter signup
- **FEATURE_CHECKOUT_ENABLED**: Enable/disable checkout functionality
- **FEATURE_EVENT_INQUIRIES**: Enable/disable event space inquiries
- **FEATURE_BLOG_ENABLED**: Enable/disable blog functionality

## 📱 Pages & Features

### Homepage
- Hero section with rotating slides
- Featured products carousel
- About section
- Upcoming events
- Customer testimonials
- Newsletter signup

### Shop
- Product catalog with filtering
- Search functionality
- Pagination
- Product detail pages
- Shopping cart (when enabled)

### Event Space
- Venue information
- Pricing packages
- Inquiry form
- Photo gallery placeholder

### About
- Store history and mission
- Team information
- Values and philosophy
- Contact information

### Contact
- Contact form
- Store information
- Hours and location
- Map placeholder

### Blog
- Article listing
- Category filtering
- Individual post pages
- Author information

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript checks

# Testing
npm run test         # Run unit tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage

# Database (if using external DB)
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to database
npm run db:migrate   # Run database migrations
npm run db:studio    # Open Prisma Studio
```

### Component Development

Components are organized by type:
- **UI Components**: Reusable, unstyled components (`/components/ui/`)
- **Sections**: Page sections with content (`/components/sections/`)
- **Pages**: Full page components (`/components/pages/`)
- **Navigation**: Header and footer (`/components/navigation/`)

### API Development

API routes are located in `/app/api/` and follow RESTful conventions:
- `GET /api/catalog` - Product listing with filters
- `GET /api/products/[id]` - Product details
- `POST /api/checkout` - Create checkout session
- `POST /api/contact` - Submit contact form
- `POST /api/event-inquiry` - Submit event inquiry
- `POST /api/newsletter` - Newsletter signup

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms

The application can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- Railway
- DigitalOcean App Platform

## 📈 Performance & SEO

### Performance Optimizations
- Next.js Image optimization
- Font optimization with Google Fonts
- Lazy loading for below-fold content
- Static generation where possible
- ISR for dynamic content

### SEO Features
- Dynamic meta tags
- Open Graph tags
- Twitter Card support
- Structured data (JSON-LD)
- XML sitemap
- Robots.txt
- Canonical URLs

## 🧪 Testing

### Test Setup
- **Unit Tests**: Jest + React Testing Library
- **Component Tests**: Testing Library utilities
- **API Tests**: Mock API responses
- **Accessibility Tests**: Jest-axe integration

### Running Tests
```bash
npm run test              # Run all tests
npm run test:watch        # Watch mode
npm run test:coverage     # Coverage report
npm run test:accessibility # Accessibility tests
```

## 🔄 Next Steps (Prompt 11)

This scaffold is ready for **Prompt 11: Branding & Content Application**. The next phase should include:

1. **Brand Integration**
   - Apply Spiral Groove Records branding
   - Add real logo and imagery
   - Customize color palette if needed
   - Update copy and messaging

2. **Content Population**
   - Add real product data
   - Create actual blog posts
   - Upload store photos
   - Add real testimonials

3. **Integration Setup**
   - Configure Square API credentials
   - Set up email marketing service
   - Configure analytics
   - Set up payment processing

4. **Final Customization**
   - Add custom animations
   - Implement advanced features
   - Optimize for specific use cases
   - Add admin functionality

## 📚 Documentation

- **API Documentation**: See `/docs/API.md`
- **Database Schema**: See `/docs/DATABASE.md`
- **Deployment Guide**: See `/docs/DEPLOYMENT.md`
- **Feature Flags**: See `/docs/FEATURE_FLAGS.md`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For questions or support:
- Create an issue in the repository
- Contact: info@spiralgrooverecords.com
- Phone: (513) 555-0123

---

**Built with ❤️ for the vinyl community**