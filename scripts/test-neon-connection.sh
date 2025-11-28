#!/bin/bash

# Test script for Neon database roles and connection pooling
# This script tests the database connection with different roles

echo "🧪 Testing Neon Database Configuration"
echo "======================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

BASE_URL="${BASE_URL:-http://localhost:3000}"

# Check if server is running
echo "1. Checking if dev server is running..."
if curl -s -m 2 "$BASE_URL" > /dev/null 2>&1; then
  echo -e "${GREEN}✅ Server is running${NC}"
else
  echo -e "${RED}❌ Server is not running${NC}"
  echo "   Start it with: npm run dev"
  exit 1
fi
echo ""

# Test health check endpoint
echo "2. Testing health check endpoint (database connection)..."
echo "   URL: $BASE_URL/api/health"
echo ""

response=$(curl -s -m 10 -w "\nHTTP_STATUS:%{http_code}" "$BASE_URL/api/health")
http_status=$(echo "$response" | grep "HTTP_STATUS" | cut -d: -f2)
body=$(echo "$response" | sed '/HTTP_STATUS/d')

if [ "$http_status" = "200" ]; then
  echo -e "${GREEN}✅ Health check passed (Status: $http_status)${NC}"
  
  # Parse database status
  db_status=$(echo "$body" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('data', {}).get('services', {}).get('database', {}).get('status', 'unknown'))" 2>/dev/null || echo "unknown")
  db_response_time=$(echo "$body" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('data', {}).get('services', {}).get('database', {}).get('responseTime', 0))" 2>/dev/null || echo "0")
  
  if [ "$db_status" = "healthy" ]; then
    echo -e "${GREEN}   ✅ Database: $db_status (Response time: ${db_response_time}ms)${NC}"
  else
    echo -e "${RED}   ❌ Database: $db_status${NC}"
  fi
  
  echo ""
  echo "   Full response:"
  echo "$body" | python3 -m json.tool 2>/dev/null || echo "$body"
else
  echo -e "${RED}❌ Health check failed (Status: $http_status)${NC}"
  echo "$body"
fi
echo ""

# Test newsletter endpoint (tests database write)
echo "3. Testing database write operation (newsletter signup)..."
echo "   URL: $BASE_URL/api/newsletter"
echo ""

test_email="test-$(date +%s)@example.com"
response=$(curl -s -m 10 -X POST \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$test_email\",\"firstName\":\"Test\",\"lastName\":\"User\"}" \
  -w "\nHTTP_STATUS:%{http_code}" \
  "$BASE_URL/api/newsletter")

http_status=$(echo "$response" | grep "HTTP_STATUS" | cut -d: -f2)
body=$(echo "$response" | sed '/HTTP_STATUS/d')

if [ "$http_status" = "200" ]; then
  echo -e "${GREEN}✅ Newsletter signup successful (Status: $http_status)${NC}"
  echo "   Test email: $test_email"
  echo ""
  echo "   Response:"
  echo "$body" | python3 -m json.tool 2>/dev/null || echo "$body"
else
  echo -e "${RED}❌ Newsletter signup failed (Status: $http_status)${NC}"
  echo "$body"
fi
echo ""

# Check connection string format
echo "4. Checking connection string configuration..."
echo ""

if [ -f ".env.local" ]; then
  if grep -q "LCT_DATABASE_URL\|DATABASE_URL" .env.local; then
    echo -e "${GREEN}✅ Database URL found in .env.local${NC}"
    
    # Check if pooling is enabled
    if grep -q "pgbouncer=true\|pooler" .env.local; then
      echo -e "${GREEN}   ✅ Connection pooling appears to be enabled${NC}"
    else
      echo -e "${YELLOW}   ⚠️  Connection pooling not detected in connection string${NC}"
      echo "      For production, add &pgbouncer=true to enable pooling"
    fi
    
    # Check if using app_user
    if grep -q "app_user" .env.local; then
      echo -e "${GREEN}   ✅ Using app_user role${NC}"
    else
      echo -e "${YELLOW}   ⚠️  Not using app_user role${NC}"
      echo "      Consider updating connection string to use app_user"
    fi
  else
    echo -e "${RED}❌ Database URL not found in .env.local${NC}"
  fi
else
  echo -e "${RED}❌ .env.local file not found${NC}"
fi
echo ""

# Summary
echo "======================================"
echo "📊 Test Summary"
echo "======================================"
echo ""
echo "✅ Completed tests:"
echo "   - Server connectivity"
echo "   - Health check endpoint"
echo "   - Database connection"
echo "   - Database write operation"
echo "   - Connection string configuration"
echo ""
echo "📋 Next steps:"
echo "   1. Run setup-neon-roles.sql in Neon SQL Editor"
echo "   2. Update .env.local with app_user connection string"
echo "   3. Enable connection pooling in Neon dashboard"
echo "   4. Test again with: ./scripts/test-neon-connection.sh"
echo ""
echo "📚 See docs/neon-database-configuration.md for details"


