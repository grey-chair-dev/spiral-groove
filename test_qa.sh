#!/bin/bash
# Comprehensive QA Testing Script
# Tests edge cases and captures all error codes

API_BASE="http://localhost:3001/api"
RESULTS_FILE="QA_TEST_RESULTS.md"

echo "=== QA TESTING SCRIPT ==="
echo "Testing API: $API_BASE"
echo "Results will be logged to: $RESULTS_FILE"
echo ""

# Function to test and log results
test_endpoint() {
    local test_name="$1"
    local method="$2"
    local endpoint="$3"
    local data="$4"
    local headers="$5"
    
    echo "Testing: $test_name"
    
    if [ -z "$headers" ]; then
        headers="-H 'Content-Type: application/json'"
    fi
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" "$API_BASE$endpoint" 2>&1)
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" $headers --data "$data" "$API_BASE$endpoint" 2>&1)
    fi
    
    http_code=$(echo "$response" | tail -1)
    body=$(echo "$response" | sed '$d')
    
    echo "  Status: $http_code"
    echo "  Response: $body" | head -3
    echo ""
    
    # Append to results file
    echo "### $test_name" >> "$RESULTS_FILE"
    echo "**Endpoint:** $method $endpoint" >> "$RESULTS_FILE"
    echo "**Status Code:** $http_code" >> "$RESULTS_FILE"
    echo "**Response:** \`\`\`json" >> "$RESULTS_FILE"
    echo "$body" | head -20 >> "$RESULTS_FILE"
    echo "\`\`\`" >> "$RESULTS_FILE"
    echo "" >> "$RESULTS_FILE"
}

# Wait for server to be ready
echo "Waiting for API server..."
for i in {1..10}; do
    if curl -s "$API_BASE/products" > /dev/null 2>&1; then
        echo "Server is ready!"
        break
    fi
    sleep 1
done

echo ""
echo "=== CONTACT INQUIRY TESTS ==="

# Test 1: Empty payload
test_endpoint "Empty Payload" "POST" "/contact-inquiry" "{}"

# Test 2: Missing required fields
test_endpoint "Missing Required Fields" "POST" "/contact-inquiry" '{"name":"Test"}'

# Test 3: XSS attempt
test_endpoint "XSS Attempt" "POST" "/contact-inquiry" '{"name":"<script>alert(\"xss\")</script>","email":"test@test.com","message":"test"}'

# Test 4: SQL injection attempt
test_endpoint "SQL Injection Attempt" "POST" "/contact-inquiry" '{"name":"'\''; DROP TABLE users; --","email":"test@test.com","message":"test"}'

# Test 5: Invalid email
test_endpoint "Invalid Email Format" "POST" "/contact-inquiry" '{"name":"Test","email":"not-an-email","message":"test"}'

# Test 6: Personal subject (should be rejected)
test_endpoint "Personal Subject Rejection" "POST" "/contact-inquiry" '{"name":"Test","email":"test@test.com","subject":"Personal","message":"test"}'

# Test 7: Wrong HTTP method
test_endpoint "Wrong HTTP Method (GET)" "GET" "/contact-inquiry" ""

# Test 8: Invalid JSON
test_endpoint "Invalid JSON Body" "POST" "/contact-inquiry" "not json" "-H 'Content-Type: application/json'"

# Test 9: Missing Content-Type
test_endpoint "Missing Content-Type" "POST" "/contact-inquiry" '{"name":"Test","email":"test@test.com","message":"test"}' ""

# Test 10: Very long name
long_name=$(python3 -c "print('A' * 10000)")
test_endpoint "Very Long Name" "POST" "/contact-inquiry" "{\"name\":\"$long_name\",\"email\":\"test@test.com\",\"message\":\"test\"}"

# Test 11: Null values
test_endpoint "Null Values" "POST" "/contact-inquiry" '{"name":null,"email":null,"message":null}'

# Test 12: Special characters
test_endpoint "Special Characters" "POST" "/contact-inquiry" '{"name":"Test !@#$%^&*()","email":"test@test.com","message":"test"}'

# Test 13: Unicode characters
test_endpoint "Unicode Characters" "POST" "/contact-inquiry" '{"name":"测试 🎵","email":"test@test.com","message":"test"}'

# Test 14: Invalid phone number
test_endpoint "Invalid Phone Number" "POST" "/contact-inquiry" '{"name":"Test","phone":"123","message":"test"}'

# Test 15: Valid phone number
test_endpoint "Valid Phone Number" "POST" "/contact-inquiry" '{"name":"Test","phone":"5551234567","message":"test"}'

echo ""
echo "=== PRODUCTS API TESTS ==="

# Test 16: Products endpoint
test_endpoint "Get Products" "GET" "/products" ""

# Test 17: Products with invalid query
test_endpoint "Products Invalid Query" "GET" "/products?limit=-1" ""

# Test 18: Products with very large limit
test_endpoint "Products Large Limit" "GET" "/products?limit=999999" ""

echo ""
echo "=== EVENT INQUIRY TESTS ==="

# Test 19: Empty event inquiry
test_endpoint "Empty Event Inquiry" "POST" "/event-inquiry" "{}"

# Test 20: Missing required fields event
test_endpoint "Missing Required Event Fields" "POST" "/event-inquiry" '{"name":"Test"}'

echo ""
echo "=== PAYMENT API TESTS ==="

# Test 21: Empty payment
test_endpoint "Empty Payment" "POST" "/pay" "{}"

# Test 22: Invalid payment data
test_endpoint "Invalid Payment Data" "POST" "/pay" '{"amount":"invalid"}'

echo ""
echo "=== ORDERS API TESTS ==="

# Test 23: Get orders without auth
test_endpoint "Get Orders No Auth" "GET" "/orders" ""

echo ""
echo "=== OTHER ENDPOINTS ==="

# Test 24: Events endpoint
test_endpoint "Get Events" "GET" "/events" ""

# Test 25: Newsletter endpoint
test_endpoint "Newsletter Empty" "POST" "/newsletter" "{}"

# Test 26: Signup endpoint
test_endpoint "Signup Empty" "POST" "/signup" "{}"

# Test 27: Forgot password empty
test_endpoint "Forgot Password Empty" "POST" "/forgot-password" "{}"

# Test 28: Non-existent endpoint
test_endpoint "Non-existent Endpoint" "GET" "/nonexistent" ""

echo ""
echo "=== TESTING COMPLETE ==="
echo "Results saved to: $RESULTS_FILE"
