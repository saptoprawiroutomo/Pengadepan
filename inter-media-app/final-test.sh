#!/bin/bash

echo "🔧 FINAL TEST - Inter Media Application"
echo "======================================"

BASE_URL="http://localhost:3000"

echo "1. Testing Core Pages..."
curl -L -s -o /dev/null -w "Homepage: %{http_code}\n" $BASE_URL/
curl -L -s -o /dev/null -w "Products: %{http_code}\n" $BASE_URL/products
curl -L -s -o /dev/null -w "About: %{http_code}\n" $BASE_URL/about
curl -L -s -o /dev/null -w "Contact: %{http_code}\n" $BASE_URL/contact
curl -L -s -o /dev/null -w "Login: %{http_code}\n" $BASE_URL/login
curl -L -s -o /dev/null -w "Register: %{http_code}\n" $BASE_URL/register

echo ""
echo "2. Testing API Endpoints..."
products=$(curl -s $BASE_URL/api/products | jq -r '.products | length' 2>/dev/null || echo "0")
categories=$(curl -s $BASE_URL/api/categories | jq '. | length' 2>/dev/null || echo "0")
echo "Products API: $products items"
echo "Categories API: $categories items"

echo ""
echo "3. Testing Chat API..."
curl -s -o /dev/null -w "Chat History: %{http_code}\n" $BASE_URL/api/chat/history
curl -s -o /dev/null -w "Chat Send: %{http_code}\n" $BASE_URL/api/chat/send

echo ""
echo "4. Testing Service Features..."
curl -s -o /dev/null -w "Service Requests: %{http_code}\n" $BASE_URL/api/service-requests
curl -s -o /dev/null -w "Socket.IO: %{http_code}\n" http://localhost:3001/socket.io/

echo ""
echo "✅ All tests completed!"
