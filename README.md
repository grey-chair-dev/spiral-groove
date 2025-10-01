# Spiral Groove Records

A modern e-commerce platform for a vinyl record store built with Next.js 14, TypeScript, and Tailwind CSS.

## 🎵 Features

- **E-commerce Integration**: Square API integration for products, inventory, and checkout
- **Modern UI**: Responsive design with Tailwind CSS and custom components
- **Performance**: Server-side rendering with ISR (Incremental Static Regeneration)
- **Caching**: Redis integration for optimal performance
- **Newsletter**: Mailchimp integration for email marketing
- **Analytics**: Google Analytics 4 and Hotjar integration
- **SEO Optimized**: Built-in SEO features for better search visibility

## 🛠 Technology Stack

### Frontend
- **Framework**: Next.js 14 (React)
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **UI Components**: Custom component system with Headless UI

### Backend
- **API**: Next.js API routes
- **Payments**: Square APIs (Catalog, Inventory, Orders, Checkout)
- **Email/CRM**: Mailchimp integration
- **Authentication**: NextAuth.js (future roadmap)

### Database & Cache
- **Primary Store**: Square (source of truth)
- **Cache Layer**: Redis (Upstash)
- **Future DB**: PostgreSQL (for blog content, advanced CRM)

### Hosting & CDN
- **Platform**: Vercel
- **CDN**: Vercel Edge Network
- **Serverless Functions**: Vercel Functions

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Square Developer Account
- Upstash Redis Account (optional)
- Mailchimp Account (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/grey-chair-dev/spiral-groove.git
   cd spiral-groove
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Fill in your environment variables:
   ```env
   # Square API Configuration
   SQUARE_APPLICATION_ID=your_square_application_id
   SQUARE_ACCESS_TOKEN=your_square_access_token
   SQUARE_ENVIRONMENT=sandbox
   SQUARE_WEBHOOK_SIGNATURE_KEY=your_webhook_signature_key
   
   # Redis Configuration (Upstash)
   UPSTASH_REDIS_REST_URL=your_upstash_redis_url
   UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_token
   
   # NextAuth Configuration
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_nextauth_secret
   
   # Mailchimp Configuration
   MAILCHIMP_API_KEY=your_mailchimp_api_key
   MAILCHIMP_SERVER_PREFIX=your_server_prefix
   MAILCHIMP_LIST_ID=your_list_id
   
   # Analytics
   GOOGLE_ANALYTICS_ID=your_ga4_id
   HOTJAR_ID=your_hotjar_id
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── products/      # Products API
│   │   ├── checkout/      # Checkout API
│   │   ├── webhooks/      # Webhook handlers
│   │   └── newsletter/    # Newsletter API
│   ├── products/          # Products pages
│   ├── events/            # Events pages
│   ├── blog/              # Blog pages
│   ├── about/             # About page
│   └── contact/           # Contact page
├── components/            # React components
│   ├── layout/           # Layout components
│   └── ui/               # UI components
├── lib/                  # Utility libraries
│   ├── square.ts         # Square API integration
│   └── redis.ts          # Redis cache service
└── types/                # TypeScript type definitions
```

## 🔧 API Endpoints

### Products
- `GET /api/products` - Fetch all products
- `POST /api/products` - Refresh products cache

### Checkout
- `POST /api/checkout` - Create checkout session
- `GET /api/checkout?sessionId=xxx` - Get order details

### Webhooks
- `POST /api/webhooks/square` - Square webhook handler

### Newsletter
- `POST /api/newsletter` - Subscribe to newsletter

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect your repository to Vercel**
2. **Set environment variables** in Vercel dashboard
3. **Deploy** - Vercel will automatically build and deploy

### Manual Deployment

```bash
npm run build
npm start
```

## 🔐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `SQUARE_APPLICATION_ID` | Square application ID | Yes |
| `SQUARE_ACCESS_TOKEN` | Square access token | Yes |
| `SQUARE_ENVIRONMENT` | Square environment (sandbox/production) | Yes |
| `SQUARE_WEBHOOK_SIGNATURE_KEY` | Square webhook signature key | Yes |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis URL | No |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis token | No |
| `MAILCHIMP_API_KEY` | Mailchimp API key | No |
| `MAILCHIMP_LIST_ID` | Mailchimp list ID | No |
| `GOOGLE_ANALYTICS_ID` | Google Analytics 4 ID | No |
| `HOTJAR_ID` | Hotjar ID | No |

## 📊 Features Roadmap

### Phase 1 (Current)
- [x] Basic e-commerce functionality
- [x] Square API integration
- [x] Product catalog
- [x] Checkout process
- [x] Newsletter signup
- [x] Basic CMS pages

### Phase 2 (Future)
- [ ] User authentication
- [ ] Customer accounts
- [ ] Order history
- [ ] Wishlist functionality
- [ ] Advanced search and filters
- [ ] Product reviews

### Phase 3 (Future)
- [ ] Record-of-the-Month subscription
- [ ] Loyalty program
- [ ] Advanced analytics
- [ ] Mobile app
- [ ] Social features

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you have any questions or need help, please:

1. Check the [Issues](https://github.com/grey-chair-dev/spiral-groove/issues) page
2. Create a new issue if your question isn't answered
3. Contact us at info@spiralgrooverecords.com

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing React framework
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [Square](https://squareup.com/) for the payment and e-commerce APIs
- [Vercel](https://vercel.com/) for the hosting platform
- [Upstash](https://upstash.com/) for the Redis service