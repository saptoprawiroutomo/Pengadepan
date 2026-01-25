#!/bin/bash

echo "🔧 Testing Inter Media API Endpoints"
echo "===================================="

BASE_URL="http://localhost:3000"

# Test API endpoints
echo "1. Testing Products API..."
response=$(curl -s $BASE_URL/api/products | jq -r '.products | length' 2>/dev/null || echo "0")
echo "   📦 Products found: $response"

echo "2. Testing Categories API..."
response=$(curl -s $BASE_URL/api/categories | jq -r '.categories | length' 2>/dev/null || echo "0")
echo "   🏷️  Categories found: $response"

echo "3. Testing Auth Session API..."
response=$(curl -s -o /dev/null -w "%{http_code}" $BASE_URL/api/auth/session)
echo "   🔐 Auth session endpoint: HTTP $response"

echo "4. Testing Cart API (requires auth)..."
response=$(curl -s -o /dev/null -w "%{http_code}" $BASE_URL/api/cart)
echo "   🛒 Cart endpoint: HTTP $response"

echo "5. Testing Service Requests API..."
response=$(curl -s -o /dev/null -w "%{http_code}" $BASE_URL/api/service-requests)
echo "   🔧 Service requests: HTTP $response"

echo "6. Testing Messages API..."
response=$(curl -s -o /dev/null -w "%{http_code}" $BASE_URL/api/messages)
echo "   💬 Messages endpoint: HTTP $response"

echo ""
echo "🌐 Testing Frontend Pages..."

# Test frontend pages
pages=("/" "/products" "/login" "/register" "/about" "/contact")
for page in "${pages[@]}"; do
    response=$(curl -s -o /dev/null -w "%{http_code}" $BASE_URL$page)
    if [ $response -eq 200 ]; then
        echo "   ✅ $page - OK"
    else
        echo "   ❌ $page - HTTP $response"
    fi
done

echo ""
echo "📱 Testing Admin Pages (may require auth)..."
admin_pages=("/admin" "/admin/dashboard" "/admin/products" "/admin/orders")
for page in "${admin_pages[@]}"; do
    response=$(curl -s -o /dev/null -w "%{http_code}" $BASE_URL$page)
    if [ $response -eq 200 ]; then
        echo "   ✅ $page - OK"
    elif [ $response -eq 401 ] || [ $response -eq 403 ]; then
        echo "   🔒 $page - Protected (HTTP $response)"
    else
        echo "   ❌ $page - HTTP $response"
    fi
done

echo ""
echo "📊 API Test Summary Complete!"
