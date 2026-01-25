#!/bin/bash

echo "🚀 Testing Inter Media Application Functions"
echo "============================================="

BASE_URL="http://localhost:3000"

# Test 1: Homepage
echo "1. Testing Homepage..."
response=$(curl -s -o /dev/null -w "%{http_code}" $BASE_URL)
if [ $response -eq 200 ]; then
    echo "   ✅ Homepage loaded successfully"
else
    echo "   ❌ Homepage failed (HTTP $response)"
fi

# Test 2: Products page
echo "2. Testing Products page..."
response=$(curl -s -o /dev/null -w "%{http_code}" $BASE_URL/products)
if [ $response -eq 200 ]; then
    echo "   ✅ Products page loaded"
else
    echo "   ❌ Products page failed (HTTP $response)"
fi

# Test 3: Login page
echo "3. Testing Login page..."
response=$(curl -s -o /dev/null -w "%{http_code}" $BASE_URL/login)
if [ $response -eq 200 ]; then
    echo "   ✅ Login page loaded"
else
    echo "   ❌ Login page failed (HTTP $response)"
fi

# Test 4: Register page
echo "4. Testing Register page..."
response=$(curl -s -o /dev/null -w "%{http_code}" $BASE_URL/register)
if [ $response -eq 200 ]; then
    echo "   ✅ Register page loaded"
else
    echo "   ❌ Register page failed (HTTP $response)"
fi

# Test 5: Cart page
echo "5. Testing Cart page..."
response=$(curl -s -o /dev/null -w "%{http_code}" $BASE_URL/cart)
if [ $response -eq 200 ]; then
    echo "   ✅ Cart page loaded"
else
    echo "   ❌ Cart page failed (HTTP $response)"
fi

# Test 6: API Health Check
echo "6. Testing API endpoints..."
response=$(curl -s -o /dev/null -w "%{http_code}" $BASE_URL/api/products)
if [ $response -eq 200 ]; then
    echo "   ✅ Products API working"
else
    echo "   ❌ Products API failed (HTTP $response)"
fi

# Test 7: Socket.IO server
echo "7. Testing Socket.IO server..."
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/socket.io/)
if [ $response -eq 200 ] || [ $response -eq 400 ]; then
    echo "   ✅ Socket.IO server running"
else
    echo "   ❌ Socket.IO server not responding"
fi

echo ""
echo "📊 Basic functionality test completed!"
echo "🌐 Application is running at: $BASE_URL"
echo "💬 Socket.IO server at: http://localhost:3001"
