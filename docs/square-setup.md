# Square API Integration Setup

This guide will help you set up Square API integration for Spiral Groove Records.

## 🔧 **Square Developer Setup**

### 1. **Create Square Developer Account**
- Go to [Square Developer Dashboard](https://developer.squareup.com/)
- Sign up or log in with your Square account
- Create a new application

### 2. **Get Your Credentials**
You'll need these values from your Square Developer Dashboard:

- **Application ID** - Found in your app's settings
- **Access Token** - Generate a new access token
- **Location ID** - Your business location ID
- **Webhook Signature Key** - For webhook verification

### 3. **Environment Configuration**

Create a `.env.local` file with your Square credentials:

```bash
# Square API Configuration
SQUARE_ACCESS_TOKEN=your_square_access_token_here
SQUARE_ENVIRONMENT=sandbox
SQUARE_APPLICATION_ID=your_square_application_id_here
SQUARE_LOCATION_ID=your_square_location_id_here
SQUARE_WEBHOOK_SIGNATURE_KEY=your_webhook_signature_key_here
```

## 🛠 **Features Enabled**

### **Product Sync**
- Automatically sync products from Square catalog
- Real-time inventory updates
- Product images and descriptions

### **Order Management**
- Create orders in Square
- Track order status
- Customer order history

### **Payment Processing**
- Secure payment processing
- Multiple payment methods
- Refund capabilities

### **Inventory Management**
- Real-time stock levels
- Low stock alerts
- Automatic inventory updates

## 📋 **API Endpoints**

### **Products**
- `GET /api/square/products` - Fetch all products
- `GET /api/square/products/[id]` - Fetch specific product

### **Orders**
- `POST /api/square/orders` - Create new order
- `GET /api/square/orders` - Fetch orders
- `GET /api/square/orders/[id]` - Fetch specific order

### **Payments**
- `POST /api/square/payments` - Process payment
- `GET /api/square/payments` - Fetch payments
- `GET /api/square/payments/[id]` - Fetch specific payment

## 🔄 **Webhook Setup**

### **Configure Webhooks**
1. Go to Square Developer Dashboard
2. Navigate to your application
3. Go to Webhooks section
4. Add webhook URL: `https://yourdomain.com/api/square/webhooks`
5. Select events to listen for:
   - `inventory.updated`
   - `order.updated`
   - `payment.updated`

### **Webhook Events**
- **Inventory Updates** - Sync stock levels
- **Order Updates** - Track order status
- **Payment Updates** - Process payment confirmations

## 🧪 **Testing**

### **Sandbox Mode**
- Use sandbox environment for testing
- Test with Square's test card numbers
- Verify webhook functionality

### **Production Mode**
- Switch to production environment
- Use real payment methods
- Monitor webhook delivery

## 🔒 **Security**

### **Environment Variables**
- Never commit `.env.local` to version control
- Use different credentials for staging/production
- Rotate access tokens regularly

### **Webhook Verification**
- Verify webhook signatures
- Use HTTPS for webhook URLs
- Implement rate limiting

## 📊 **Monitoring**

### **Logs**
- Monitor API calls in Square Dashboard
- Check application logs for errors
- Track webhook delivery status

### **Analytics**
- View transaction reports
- Monitor payment success rates
- Track inventory movement

## 🚀 **Deployment**

### **Vercel Environment Variables**
1. Go to Vercel Dashboard
2. Navigate to your project
3. Go to Settings > Environment Variables
4. Add all Square credentials
5. Deploy your application

### **Production Checklist**
- [ ] Square credentials configured
- [ ] Webhook URLs set up
- [ ] SSL certificate installed
- [ ] Error monitoring enabled
- [ ] Backup procedures in place

## 🆘 **Troubleshooting**

### **Common Issues**
- **Invalid credentials** - Check environment variables
- **Webhook failures** - Verify URL and SSL
- **Payment errors** - Check card details and limits
- **Sync issues** - Review API rate limits

### **Support**
- Square Developer Documentation
- Square Developer Community
- Square Support (for production issues)

## 📞 **Need Help?**

If you encounter any issues:
1. Check the Square Developer Documentation
2. Review application logs
3. Test in sandbox mode first
4. Contact Square support for production issues

---

**Note**: Always test thoroughly in sandbox mode before going to production!
