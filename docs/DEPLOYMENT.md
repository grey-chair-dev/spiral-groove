# Deployment Guide

## Overview

This guide covers deploying the Spiral Groove Records application to production using Vercel for hosting and Neon for the database.

## Prerequisites

- Vercel account
- Neon account (or other PostgreSQL provider)
- Domain name (optional)
- Third-party service accounts (Square, email, analytics)

## Environment Setup

### 1. Vercel Configuration

1. **Connect Repository**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Select the project root directory

2. **Build Settings**
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

3. **Environment Variables**
   Set the following in Vercel dashboard:

   ```env
   # Database
   DATABASE_URL="postgresql://username:password@host:port/database"
   DIRECT_URL="postgresql://username:password@host:port/database"
   
   # Authentication
   NEXTAUTH_URL="https://your-domain.com"
   NEXTAUTH_SECRET="your-production-secret"
   JWT_SECRET="your-production-jwt-secret"
   
   # Feature Flags
   ENABLE_SQUARE_INTEGRATION="true"
   ENABLE_EMAIL_SERVICE="true"
   ENABLE_ANALYTICS="true"
   ENABLE_IMAGE_CDN="true"
   ENABLE_REDIS_CACHE="true"
   
   # Square Integration
   SQUARE_APPLICATION_ID="your-square-app-id"
   SQUARE_ACCESS_TOKEN="your-square-access-token"
   SQUARE_ENVIRONMENT="production"
   SQUARE_WEBHOOK_SIGNATURE_KEY="your-webhook-key"
   
   # Email Service
   EMAIL_SERVICE="resend"
   RESEND_API_KEY="your-resend-api-key"
   SMTP_FROM="noreply@your-domain.com"
   
   # Analytics
   GOOGLE_ANALYTICS_ID="G-XXXXXXXXXX"
   MIXPANEL_TOKEN="your-mixpanel-token"
   
   # Image CDN
   CLOUDINARY_CLOUD_NAME="your-cloud-name"
   CLOUDINARY_API_KEY="your-api-key"
   CLOUDINARY_API_SECRET="your-api-secret"
   
   # Caching
   KV_REST_API_URL="your-vercel-kv-url"
   KV_REST_API_TOKEN="your-vercel-kv-token"
   KV_REST_API_READ_ONLY_TOKEN="your-vercel-kv-readonly-token"
   ```

### 2. Neon Database Setup

1. **Create Neon Project**
   - Go to [neon.tech](https://neon.tech)
   - Create a new project
   - Choose the region closest to your users

2. **Database Configuration**
   - Database name: `spiral_groove`
   - Enable connection pooling
   - Set up automated backups

3. **Schema Deployment**
   ```bash
   # Connect to your Neon database
   psql $DATABASE_URL -f db/schema.sql
   ```

4. **Initial Data**
   ```bash
   # Run any seed scripts
   npm run db:seed
   ```

### 3. Domain Configuration

1. **Custom Domain**
   - Add your domain in Vercel dashboard
   - Update DNS records as instructed
   - Enable SSL certificate

2. **Environment Update**
   - Update `NEXTAUTH_URL` to your custom domain
   - Update any hardcoded URLs in the application

## Third-Party Service Setup

### Square Integration

1. **Square Developer Account**
   - Create account at [developer.squareup.com](https://developer.squareup.com)
   - Create a new application
   - Get Application ID and Access Token

2. **Webhook Configuration**
   - Set webhook URL: `https://your-domain.com/api/webhooks/square`
   - Subscribe to events: `inventory.updated`, `payment.updated`, `order.updated`
   - Verify webhook signature

3. **Production Environment**
   - Switch from sandbox to production
   - Update environment variables
   - Test payment processing

### Email Service (Resend)

1. **Resend Account**
   - Sign up at [resend.com](https://resend.com)
   - Verify your domain
   - Get API key

2. **Domain Verification**
   - Add DNS records for domain verification
   - Set up SPF, DKIM, and DMARC records
   - Test email delivery

### Analytics Setup

1. **Google Analytics 4**
   - Create GA4 property
   - Get Measurement ID
   - Set up enhanced ecommerce tracking

2. **Mixpanel (Optional)**
   - Create Mixpanel project
   - Get project token
   - Configure event tracking

### Image CDN (Cloudinary)

1. **Cloudinary Account**
   - Sign up at [cloudinary.com](https://cloudinary.com)
   - Get cloud name, API key, and secret
   - Configure upload presets

2. **Image Optimization**
   - Set up automatic WebP conversion
   - Configure responsive image delivery
   - Set up image transformations

## Deployment Process

### 1. Pre-Deployment Checklist

- [ ] All environment variables configured
- [ ] Database schema deployed
- [ ] Third-party services configured
- [ ] Domain DNS updated
- [ ] SSL certificate active
- [ ] Feature flags enabled/disabled as needed

### 2. Initial Deployment

1. **Deploy to Vercel**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Login to Vercel
   vercel login
   
   # Deploy
   vercel --prod
   ```

2. **Verify Deployment**
   - Check application loads correctly
   - Test authentication flow
   - Verify database connectivity
   - Test API endpoints

### 3. Post-Deployment Setup

1. **Database Initialization**
   ```bash
   # Run any necessary migrations
   vercel env pull .env.local
   npm run db:migrate
   ```

2. **Admin User Creation**
   ```bash
   # Create admin user via API or database
   curl -X POST https://your-domain.com/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "email": "admin@your-domain.com",
       "password": "secure-password",
       "name": "Admin User"
     }'
   ```

3. **Content Setup**
   - Create initial blog posts
   - Set up static pages
   - Configure navigation menu
   - Upload product images

## Monitoring and Maintenance

### 1. Application Monitoring

**Vercel Analytics**
- Enable Vercel Analytics in dashboard
- Monitor Core Web Vitals
- Track performance metrics

**Error Tracking**
- Set up Sentry for error monitoring
- Configure alert notifications
- Monitor error rates and trends

**Uptime Monitoring**
- Use UptimeRobot or similar service
- Set up alerts for downtime
- Monitor response times

### 2. Database Monitoring

**Neon Dashboard**
- Monitor connection usage
- Track query performance
- Set up alerts for issues

**Query Optimization**
- Regular query analysis
- Index usage monitoring
- Performance tuning

### 3. Security Monitoring

**Security Headers**
- Verify security headers are set
- Monitor for security vulnerabilities
- Regular security audits

**Access Logs**
- Monitor authentication attempts
- Track suspicious activity
- Set up intrusion detection

## Performance Optimization

### 1. Frontend Optimization

**Image Optimization**
- Use Next.js Image component
- Implement WebP format
- Set up responsive images

**Code Splitting**
- Route-based code splitting
- Component lazy loading
- Bundle size optimization

**Caching Strategy**
- Static asset caching
- API response caching
- CDN configuration

### 2. Backend Optimization

**Database Optimization**
- Query optimization
- Index tuning
- Connection pooling

**API Optimization**
- Response compression
- Request batching
- Rate limiting

**Caching Implementation**
- Redis caching
- Application-level caching
- CDN caching

## Backup and Recovery

### 1. Database Backups

**Automated Backups**
- Daily full backups
- Point-in-time recovery
- Cross-region replication

**Backup Verification**
- Regular restore tests
- Data integrity checks
- Recovery time testing

### 2. Application Backups

**Code Repository**
- Git repository backup
- Branch protection rules
- Release tagging

**Configuration Backup**
- Environment variables backup
- Configuration file versioning
- Deployment history

## Scaling Considerations

### 1. Horizontal Scaling

**Load Balancing**
- Vercel automatic scaling
- CDN distribution
- Geographic distribution

**Database Scaling**
- Read replicas
- Connection pooling
- Query optimization

### 2. Vertical Scaling

**Resource Monitoring**
- CPU usage tracking
- Memory usage monitoring
- Storage capacity planning

**Performance Tuning**
- Database optimization
- Application optimization
- Infrastructure scaling

## Troubleshooting

### Common Issues

**Deployment Failures**
- Check build logs in Vercel
- Verify environment variables
- Check for TypeScript errors

**Database Connection Issues**
- Verify connection string
- Check firewall settings
- Monitor connection limits

**Third-Party Service Issues**
- Check API keys and tokens
- Verify webhook configuration
- Monitor rate limits

### Debugging Tools

**Vercel CLI**
```bash
# View deployment logs
vercel logs

# Check function logs
vercel logs --follow
```

**Database Debugging**
```bash
# Connect to database
psql $DATABASE_URL

# Check connection status
SELECT * FROM pg_stat_activity;
```

**Application Debugging**
```bash
# Enable debug mode
ENABLE_DEBUG=true

# Check feature flags
console.log(featureFlags);
```

## Maintenance Schedule

### Daily
- Monitor application health
- Check error rates
- Review performance metrics

### Weekly
- Database maintenance
- Security updates
- Performance analysis

### Monthly
- Full backup verification
- Security audit
- Performance optimization review

### Quarterly
- Disaster recovery testing
- Security penetration testing
- Infrastructure review

## Security Considerations

### 1. Environment Security

**Secrets Management**
- Use Vercel environment variables
- Rotate secrets regularly
- Monitor secret usage

**Access Control**
- Limit admin access
- Use strong passwords
- Enable 2FA where possible

### 2. Application Security

**Input Validation**
- Validate all user inputs
- Sanitize data before processing
- Use prepared statements

**Authentication Security**
- Strong password requirements
- JWT token expiration
- Rate limiting on auth endpoints

### 3. Infrastructure Security

**Network Security**
- HTTPS everywhere
- Security headers
- DDoS protection

**Data Protection**
- Encrypt sensitive data
- Regular security updates
- Vulnerability scanning

## Support and Documentation

### 1. Team Access

**Admin Access**
- Vercel team access
- Database admin access
- Third-party service access

**Documentation**
- Keep deployment docs updated
- Document troubleshooting steps
- Maintain runbooks

### 2. Emergency Procedures

**Incident Response**
- Define escalation procedures
- Create incident runbooks
- Set up alert notifications

**Recovery Procedures**
- Document recovery steps
- Test recovery procedures
- Maintain backup contacts

## Cost Optimization

### 1. Resource Monitoring

**Vercel Usage**
- Monitor function execution time
- Track bandwidth usage
- Optimize bundle sizes

**Database Costs**
- Monitor connection usage
- Optimize query performance
- Use appropriate instance sizes

### 2. Third-Party Services

**Service Usage**
- Monitor API usage
- Optimize request patterns
- Use caching effectively

**Cost Analysis**
- Regular cost reviews
- Identify optimization opportunities
- Plan for growth
