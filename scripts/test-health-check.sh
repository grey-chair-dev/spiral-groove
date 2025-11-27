#!/bin/bash

# Test script for the health check endpoint
# Usage: ./scripts/test-health-check.sh

BASE_URL="${BASE_URL:-http://localhost:3000}"

echo "🏥 Testing Health Check Endpoint"
echo "=================================="
echo ""

# Test 1: Basic health check
echo "1. Testing GET /api/health..."
echo "   URL: $BASE_URL/api/health"
echo ""

response=$(curl -s -m 10 -w "\nHTTP_STATUS:%{http_code}" "$BASE_URL/api/health")
http_status=$(echo "$response" | grep "HTTP_STATUS" | cut -d: -f2)
body=$(echo "$response" | sed '/HTTP_STATUS/d')

echo "   Status Code: $http_status"
echo "   Response:"
echo "$body" | jq '.' 2>/dev/null || echo "$body"
echo ""

# Test 2: Check if rate limiting headers are present
echo "2. Checking rate limit headers..."
echo ""

headers=$(curl -s -m 5 -I "$BASE_URL/api/health" | grep -i "rate-limit" || echo "   (No rate limit headers - expected, health endpoint is excluded)")
echo "$headers"
echo ""

# Test 3: Test rate limiting on another endpoint
echo "3. Testing rate limiting on /api/newsletter (public endpoint)..."
echo "   Making multiple requests to check rate limit headers..."
echo ""

for i in {1..3}; do
  echo "   Request $i..."
  # Use newsletter endpoint which is public and doesn't require auth
  rate_limit_headers=$(curl -s -m 5 -I "$BASE_URL/api/newsletter" 2>&1 | grep -i "x-ratelimit" || echo "")
  if [ -n "$rate_limit_headers" ]; then
    echo "$rate_limit_headers"
  else
    echo "   (No rate limit headers found)"
  fi
  sleep 0.3
done

echo ""
echo "✅ Health check test complete!"
echo ""
echo "Expected results:"
echo "  - Health endpoint should return 200 with database and Square status"
echo "  - Health endpoint should NOT have rate limit headers"
echo "  - Other endpoints should have X-RateLimit-* headers"
echo "  - After exceeding limits, endpoints should return 429"

