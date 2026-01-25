#!/bin/bash

echo "🔍 DETAILED FRONTEND & BACKEND ANALYSIS"
echo "======================================"

BASE_URL="http://localhost:3000"

echo "1. Testing Page Content in Detail..."
echo "-----------------------------------"

# Test About page content
echo "📄 About Page Content:"
curl -s $BASE_URL/about | grep -i "tentang\|sejarah\|visi\|misi" | head -3

echo ""
echo "📄 Contact Page Content:"
curl -s $BASE_URL/contact | grep -i "hubungi\|alamat\|telepon" | head -3

echo ""
echo "📄 Products Page Content:"
curl -s $BASE_URL/products | grep -i "produk\|kategori\|printer" | head -3

echo ""
echo "2. Testing Specific API Endpoints..."
echo "-----------------------------------"

# Test Orders API with different methods
echo "📡 Orders API (GET):"
curl -s -o /dev/null -w "Status: %{http_code}" $BASE_URL/api/orders
echo ""

echo "📡 Orders API (POST):"
curl -s -o /dev/null -w "Status: %{http_code}" -X POST $BASE_URL/api/orders
echo ""

# Test Admin endpoints
echo "📡 Admin Dashboard:"
curl -s -o /dev/null -w "Status: %{http_code}" $BASE_URL/api/admin/dashboard
echo ""

echo "📡 Admin Users:"
curl -s -o /dev/null -w "Status: %{http_code}" $BASE_URL/api/admin/users
echo ""

echo "📡 Admin Products:"
curl -s -o /dev/null -w "Status: %{http_code}" $BASE_URL/api/admin/products
echo ""

echo ""
echo "3. Testing POS System..."
echo "----------------------"

echo "📡 POS Sales:"
curl -s -o /dev/null -w "Status: %{http_code}" $BASE_URL/api/pos/sales
echo ""

echo "📡 POS Reports:"
curl -s -o /dev/null -w "Status: %{http_code}" $BASE_URL/api/pos/reports
echo ""

echo ""
echo "4. Testing Chat System..."
echo "------------------------"

echo "📡 Chat Send (POST):"
curl -s -o /dev/null -w "Status: %{http_code}" -X POST $BASE_URL/api/chat/send
echo ""

echo "📡 Chat History:"
curl -s -o /dev/null -w "Status: %{http_code}" $BASE_URL/api/chat/history
echo ""

echo ""
echo "5. Testing Form Submissions..."
echo "-----------------------------"

# Test registration form
echo "📝 Registration Form:"
curl -s -o /dev/null -w "Status: %{http_code}" -X POST $BASE_URL/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@test.com","password":"test123"}'
echo ""

# Test login form
echo "📝 Login Form:"
curl -s -o /dev/null -w "Status: %{http_code}" -X POST $BASE_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'
echo ""

echo ""
echo "6. Testing Database Operations..."
echo "-------------------------------"

# Test product creation (should fail without auth)
echo "📝 Create Product (No Auth):"
curl -s -o /dev/null -w "Status: %{http_code}" -X POST $BASE_URL/api/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Product","price":100000}'
echo ""

# Test service request
echo "📝 Service Request:"
curl -s -o /dev/null -w "Status: %{http_code}" -X POST $BASE_URL/api/service-requests \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","phone":"081234567890","issue":"Test issue"}'
echo ""

echo ""
echo "✅ Detailed analysis completed!"
