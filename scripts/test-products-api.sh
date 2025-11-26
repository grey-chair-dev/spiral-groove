#!/bin/bash

# Test script for Products API endpoints

echo "🧪 Testing Products API Endpoints"
echo ""

BASE_URL="http://localhost:3000"

# Test 1: Get all products
echo "1️⃣  Testing GET /api/products"
echo "----------------------------------------"
curl -s "$BASE_URL/api/products" | python3 -m json.tool | head -20
echo ""
echo ""

# Test 2: Get products with limit
echo "2️⃣  Testing GET /api/products?limit=5"
echo "----------------------------------------"
curl -s "$BASE_URL/api/products?limit=5" | python3 -m json.tool | head -20
echo ""
echo ""

# Test 3: Check if we have any products
echo "3️⃣  Checking product count"
echo "----------------------------------------"
PRODUCT_COUNT=$(curl -s "$BASE_URL/api/products" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('total', 0))" 2>/dev/null || echo "0")
echo "Total products: $PRODUCT_COUNT"
echo ""

# Test 4: Get a specific product (if we have products)
if [ "$PRODUCT_COUNT" -gt "0" ]; then
  echo "4️⃣  Getting first product ID"
  echo "----------------------------------------"
  FIRST_ID=$(curl -s "$BASE_URL/api/products?limit=1" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data['products'][0]['id'])" 2>/dev/null || echo "")
  
  if [ ! -z "$FIRST_ID" ]; then
    echo "Product ID: $FIRST_ID"
    echo ""
    echo "5️⃣  Testing GET /api/products/$FIRST_ID"
    echo "----------------------------------------"
    curl -s "$BASE_URL/api/products/$FIRST_ID" | python3 -m json.tool | head -30
    echo ""
  else
    echo "Could not get product ID"
  fi
else
  echo "4️⃣  No products found - skipping single product test"
  echo "   (This is normal if Square catalog is empty)"
fi

echo ""
echo "✅ Testing complete!"
echo ""
echo "💡 Tips:"
echo "   - If you see 0 products, add items to your Square catalog"
echo "   - Products are cached for 1 hour"
echo "   - Use POST /api/products/revalidate to refresh cache"

