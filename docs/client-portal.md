# Client Portal

A password-protected area for clients to access private information and resources.

## Setup

1. **Set Environment Variables**

   Add to your `.env.local` file:
   ```env
   CLIENT_PASSWORD=your-secure-password-here
   AUTH_SECRET=your-jwt-secret-key-here-change-in-production
   ```

   **Important**: 
   - Use a strong password for `CLIENT_PASSWORD`
   - Use a random, secure string for `AUTH_SECRET` (at least 32 characters)
   - Never commit these values to git

2. **Access the Portal**

   - Login page: `/login`
   - Protected area: `/` (homepage)

## Features

- **Password Authentication**: Simple password-based login
- **Session Management**: JWT-based sessions with 7-day expiration
- **Secure Cookies**: HTTP-only cookies for session storage
- **Route Protection**: Middleware automatically protects `/client` routes
- **Logout**: Users can log out, which clears their session

## Security

- Passwords are compared securely (consider using bcrypt for production)
- Sessions use JWT tokens with expiration
- Cookies are HTTP-only and secure in production
- Middleware protects routes before they're accessed

## Customization

The client portal page (`/app/client/page.tsx`) can be customized with:
- Dashboard widgets
- Client-specific content
- Links to resources
- Any other content needed

## API Routes

- `POST /api/auth/login` - Authenticate with password
- `POST /api/auth/logout` - End session
- `GET /api/auth/check` - Check authentication status

