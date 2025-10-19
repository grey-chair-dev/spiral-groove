# Google My Business Hours Integration Setup

This guide explains how to set up automatic synchronization of store hours from Google My Business to your Spiral Groove Records website.

## Overview

The website now automatically syncs business hours from your Google My Business listing, ensuring that:
- Store hours are always up-to-date across all pages
- Hours display consistently in the footer and about page
- Real-time "Open/Closed" status is shown
- Fallback hours are used if Google API is unavailable

## Setup Steps

### 1. Google My Business API Setup

1. **Enable Google My Business API**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Enable the "Google My Business API" in the API Library

2. **Create API Credentials**
   - Go to "Credentials" in the Google Cloud Console
   - Create an API Key
   - Create an OAuth 2.0 Client ID for server-to-server authentication

3. **Get Your Business Information**
   - Find your Google My Business Account ID
   - Find your Location ID for Spiral Groove Records
   - Generate an access token with appropriate permissions

### 2. Environment Variables

Add these variables to your `.env.local` file:

```bash
# Google My Business API
GOOGLE_MY_BUSINESS_API_KEY=your_api_key_here
GOOGLE_MY_BUSINESS_ACCOUNT_ID=your_account_id_here
GOOGLE_MY_BUSINESS_LOCATION_ID=your_location_id_here
GOOGLE_MY_BUSINESS_ACCESS_TOKEN=your_access_token_here

# Feature Flags
ENABLE_GOOGLE_HOURS_SYNC=true
```

### 3. API Permissions Required

The Google My Business API requires these permissions:
- `https://www.googleapis.com/auth/plus.business.manage`
- `https://www.googleapis.com/auth/business.manage`

### 4. Testing the Integration

1. **Check Fallback Hours**: Without API credentials, the system uses fallback hours
2. **Test API Connection**: Add credentials and verify hours sync
3. **Verify Display**: Check footer and about page show correct hours
4. **Test Status**: Verify "Open/Closed" status updates correctly

## How It Works

### Components

- **`lib/google-business.ts`**: Core API integration and data processing
- **`lib/hooks/useBusinessHours.ts`**: React hook for managing hours state
- **`components/BusinessHours.tsx`**: Reusable component for displaying hours

### Features

1. **Automatic Sync**: Hours are fetched from Google My Business on page load
2. **Real-time Status**: Shows if store is currently open or closed
3. **Fallback System**: Uses hardcoded hours if API is unavailable
4. **Multiple Formats**: Supports full and compact hour displays
5. **Error Handling**: Gracefully handles API failures

### Display Variants

- **Full Format**: "Monday - Friday: 10:00 AM - 7:00 PM"
- **Compact Format**: "Mon-Sat: 10:00 AM - 7:00 PM"
- **Status Indicator**: Green dot for open, red dot for closed

## Troubleshooting

### Common Issues

1. **Hours Not Syncing**
   - Check API credentials are correct
   - Verify `ENABLE_GOOGLE_HOURS_SYNC=true`
   - Check browser console for API errors

2. **Wrong Hours Displayed**
   - Verify Google My Business listing has correct hours
   - Check timezone settings
   - Clear browser cache

3. **API Rate Limits**
   - Google My Business API has rate limits
   - Consider caching hours data
   - Implement retry logic if needed

### Debug Mode

Enable debug logging by adding to your environment:
```bash
NODE_ENV=development
```

## Security Notes

- Keep API credentials secure
- Use environment variables, never commit credentials
- Rotate access tokens regularly
- Monitor API usage for unusual activity

## Future Enhancements

- **Caching**: Implement Redis or database caching for hours
- **Webhooks**: Real-time updates when hours change in Google
- **Multiple Locations**: Support for multiple store locations
- **Holiday Hours**: Special hours for holidays and events
- **Time Zone Support**: Automatic timezone conversion

## Support

For issues with Google My Business API:
- [Google My Business API Documentation](https://developers.google.com/my-business)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Google My Business Help Center](https://support.google.com/business/)

For website integration issues:
- Check the browser console for errors
- Verify environment variables are set correctly
- Test with fallback hours first
