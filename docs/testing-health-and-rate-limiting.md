# Testing Health Check & Rate Limiting

## 🏥 Health Check Endpoint

### Quick Test

1. **Start the dev server:**
   ```bash
   npm run dev
   ```

2. **Test the health endpoint:**
   ```bash
   curl http://localhost:3000/api/health | jq '.'
   ```

   Or in your browser: `http://localhost:3000/api/health`

### Expected Response

```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2024-01-15T10:30:00.000Z",
    "services": {
      "database": {
        "status": "healthy",
        "responseTime": 45
      },
      "ecs": {
        "status": "healthy",
        "responseTime": 234
      }
    }
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00.000Z",
    "responseTime": 280
  }
}
```

### Status Codes

- **200**: All services healthy
- **200**: Degraded (database OK, ECS failed - optional service)
- **503**: Unhealthy (database connection failed)

### Automated Test Script

```bash
./scripts/test-health-check.sh
```

## 🚦 Rate Limiting

### How It Works

Rate limiting is applied to all API routes except `/api/health`:

- **Auth endpoints** (`/api/auth/*`): **10 requests per 15 minutes**
- **Checkout endpoints** (`/api/checkout`): **20 requests per 5 minutes**
- **Public endpoints**: **100 requests per 15 minutes**

### Test Rate Limiting

1. **Check rate limit headers:**
   ```bash
   curl -I http://localhost:3000/api/products
   ```

   Look for:
   ```
   X-RateLimit-Limit: 100
   X-RateLimit-Remaining: 99
   X-RateLimit-Reset: 2024-01-15T10:45:00.000Z
   ```

2. **Test rate limit enforcement:**
   ```bash
   # Make 101 requests quickly to trigger rate limit
   for i in {1..101}; do
     curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/api/products
     sleep 0.1
   done
   ```

   After exceeding the limit, you'll get:
   ```json
   {
     "error": "Too many requests",
     "message": "Rate limit exceeded. Please try again later.",
     "retryAfter": 900
   }
   ```
   With HTTP status **429** and `Retry-After` header.

3. **Test auth endpoint rate limiting (stricter):**
   ```bash
   # Make 11 requests to /api/auth/login (limit is 10)
   for i in {1..11}; do
     curl -X POST http://localhost:3000/api/auth/login \
       -H "Content-Type: application/json" \
       -d '{"password":"test"}' \
       -w "\nStatus: %{http_code}\n"
   done
   ```

### Verify Health Endpoint is Excluded

The health endpoint should **NOT** have rate limiting:

```bash
curl -I http://localhost:3000/api/health | grep -i "rate-limit"
# Should return nothing (no rate limit headers)
```

## 🧪 Full Test Suite

Run the automated test script:

```bash
./scripts/test-health-check.sh
```

This will:
1. Test the health endpoint
2. Verify it's excluded from rate limiting
3. Test rate limiting on other endpoints
4. Show rate limit headers

## 📊 Monitoring

### Production Monitoring

You can set up monitoring to hit `/api/health` periodically:

- **Uptime monitoring**: Ping `/api/health` every 1-5 minutes
- **Load balancer**: Use as health check endpoint
- **Status page**: Display health status publicly

### Example Monitoring Script

```bash
#!/bin/bash
# monitor-health.sh

HEALTH_URL="https://your-domain.com/api/health"

while true; do
  response=$(curl -s -w "\n%{http_code}" "$HEALTH_URL")
  status_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | sed '$d')
  
  if [ "$status_code" != "200" ]; then
    echo "⚠️  Health check failed: $status_code"
    echo "$body" | jq '.'
    # Send alert (email, Slack, etc.)
  else
    echo "✅ Health check passed"
  fi
  
  sleep 60  # Check every minute
done
```

## 🔍 Troubleshooting

### Health Check Returns 503

- **Database connection failed**: Check `DATABASE_URL` or `LCT_DATABASE_URL`
- **ECS API failed**: Check ECS credentials (optional, won't fail overall if database is OK)

### Rate Limiting Not Working

- Check middleware is running: `middleware.ts` should be in root
- Check imports: `rateLimit` and `getClientIP` should be imported
- Check logs: Rate limit errors should appear in server logs

### Rate Limit Headers Missing

- Headers are only added to responses that pass rate limiting
- Health endpoint intentionally has no rate limit headers
- Check that you're hitting an API route (starts with `/api/`)


