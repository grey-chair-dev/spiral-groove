# Square API Credentials Setup Guide

## 🔑 **Getting Your Square Credentials**

### **Step 1: Square Developer Account**
1. Go to [Square Developer Dashboard](https://developer.squareup.com/)
2. Sign up or log in with your Square account
3. Create a new application

### **Step 2: Get Your Credentials**

#### **Application ID**
- Found in your app's **Settings** tab
- Copy the **Application ID** (starts with `sandbox-` for sandbox)

#### **Access Token**
- Go to **Credentials** tab in your app
- Click **Generate Token** 
- Copy the **Access Token** (keep this secure!)

#### **Location ID**
- Go to **Locations** tab
- Copy your **Location ID** (starts with `L`)

#### **Webhook Signature Key**
- Go to **Webhooks** tab
- Click **Generate Signature Key**
- Copy the **Webhook Signature Key**

### **Step 3: Configure Environment Variables**

Create a `.env.local` file in your project root:

```bash
# Square API Configuration
SQUARE_ACCESS_TOKEN=your_access_token_here
SQUARE_ENVIRONMENT=sandbox
SQUARE_APPLICATION_ID=your_application_id_here
SQUARE_LOCATION_ID=your_location_id_here
SQUARE_WEBHOOK_SIGNATURE_KEY=your_webhook_signature_key_here
```

## 🧪 **Testing Your Setup**

### **Sandbox Mode (Recommended for Testing)**
- Use `SQUARE_ENVIRONMENT=sandbox`
- Test with Square's test card numbers
- No real money transactions

### **Test Card Numbers**
- **Visa**: 4111 1111 1111 1111
- **Mastercard**: 5555 5555 5555 4444
- **American Express**: 3782 822463 10005
- **CVV**: Any 3 digits
- **Expiry**: Any future date

## 🚀 **Production Setup**

### **Switch to Production**
1. Change `SQUARE_ENVIRONMENT=production`
2. Get production credentials from Square
3. Update all environment variables
4. Test thoroughly before going live

### **Vercel Deployment**
1. Go to Vercel Dashboard
2. Navigate to your project
3. Go to **Settings** → **Environment Variables**
4. Add all Square credentials
5. Deploy your application

## 🔒 **Security Best Practices**

### **Environment Variables**
- ✅ Never commit `.env.local` to version control
- ✅ Use different credentials for staging/production
- ✅ Rotate access tokens regularly
- ✅ Use HTTPS for webhook URLs

### **Webhook Security**
- ✅ Verify webhook signatures
- ✅ Use HTTPS endpoints
- ✅ Implement rate limiting
- ✅ Monitor webhook delivery

## 📊 **Monitoring & Analytics**

### **Square Dashboard**
- View transaction reports
- Monitor payment success rates
- Track inventory movement
- Check API usage

### **Application Logs**
- Monitor API calls
- Check error logs
- Track webhook delivery
- Review sync status

## 🆘 **Troubleshooting**

### **Common Issues**

#### **"Square API not configured"**
- Check environment variables are set
- Verify `.env.local` file exists
- Restart your development server

#### **"Invalid credentials"**
- Verify access token is correct
- Check application ID
- Ensure location ID is valid

#### **"Webhook signature invalid"**
- Verify webhook signature key
- Check webhook URL is HTTPS
- Ensure timestamp is included

#### **"Payment failed"**
- Check card details
- Verify amount format (cents)
- Check Square dashboard for errors

### **Debug Steps**
1. Check environment variables
2. Test API endpoints manually
3. Review Square dashboard logs
4. Check application console logs

## 📞 **Support Resources**

### **Square Documentation**
- [Square Developer Docs](https://developer.squareup.com/docs)
- [API Reference](https://developer.squareup.com/reference)
- [Webhook Guide](https://developer.squareup.com/docs/webhooks-api)

### **Community Support**
- [Square Developer Community](https://developer.squareup.com/community)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/square)
- [GitHub Issues](https://github.com/square/connect-api-examples)

### **Square Support**
- [Square Support Center](https://squareup.com/help)
- [Developer Support](https://developer.squareup.com/support)
- [Phone Support](https://squareup.com/help/us/en/contact)

## ✅ **Setup Checklist**

- [ ] Square Developer account created
- [ ] Application created
- [ ] Credentials obtained:
  - [ ] Application ID
  - [ ] Access Token
  - [ ] Location ID
  - [ ] Webhook Signature Key
- [ ] Environment variables configured
- [ ] Sandbox testing completed
- [ ] Webhook endpoints configured
- [ ] Production credentials ready
- [ ] Vercel environment variables set
- [ ] Security measures implemented
- [ ] Monitoring setup complete

## 🎯 **Next Steps**

1. **Test Integration**: Use the admin dashboard to test Square connection
2. **Sync Products**: Import your catalog from Square
3. **Configure Webhooks**: Set up real-time updates
4. **Test Payments**: Process test transactions
5. **Go Live**: Switch to production mode

---

**Need Help?** Check the [Square Setup Guide](./square-setup.md) for detailed integration instructions.
