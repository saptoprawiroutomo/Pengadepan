#!/usr/bin/env node

const http = require('http');
const https = require('https');

const BASE_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000';

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const req = protocol.request(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = data ? JSON.parse(data) : {};
          resolve({ status: res.statusCode, data: parsed, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, data: data, headers: res.headers });
        }
      });
    });
    
    req.on('error', reject);
    
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    
    req.end();
  });
}

async function testEndpoint(name, url, expectedStatus = 200, options = {}) {
  try {
    console.log(`🧪 Testing ${name}...`);
    const response = await makeRequest(`${BASE_URL}${url}`, options);
    
    if (response.status === expectedStatus) {
      console.log(`✅ ${name}: PASSED (${response.status})`);
      return true;
    } else {
      console.log(`❌ ${name}: FAILED (Expected ${expectedStatus}, got ${response.status})`);
      return false;
    }
  } catch (error) {
    console.log(`❌ ${name}: ERROR (${error.message})`);
    return false;
  }
}

async function testAPIEndpoints() {
  console.log('🚀 Testing API Endpoints...\n');
  
  const tests = [
    // Health checks
    { name: 'Health Check', url: '/api/health' },
    { name: 'Ping', url: '/api/ping' },
    
    // Public endpoints
    { name: 'Products List', url: '/api/products' },
    { name: 'Categories List', url: '/api/categories' },
    { name: 'Payment Info', url: '/api/payment-info' },
    
    // Debug endpoints
    { name: 'Debug Session', url: '/api/debug-session' },
    { name: 'Test DB', url: '/api/test-db' },
    
    // Reports (might need auth)
    { name: 'Sales Report', url: '/api/reports/sales', expectedStatus: [200, 401] },
    { name: 'Stock Report', url: '/api/reports/stock', expectedStatus: [200, 401] },
    { name: 'Services Report', url: '/api/reports/services', expectedStatus: [200, 401] },
    
    // Admin endpoints (should require auth)
    { name: 'Admin Products', url: '/api/admin/products', expectedStatus: [200, 401] },
    { name: 'Admin Users', url: '/api/admin/users', expectedStatus: [200, 401] },
    { name: 'Admin Orders', url: '/api/admin/orders', expectedStatus: [200, 401] },
    { name: 'Admin Categories', url: '/api/admin/categories', expectedStatus: [200, 401] }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    try {
      const expectedStatuses = Array.isArray(test.expectedStatus) ? test.expectedStatus : [test.expectedStatus || 200];
      const response = await makeRequest(`${BASE_URL}${test.url}`);
      
      if (expectedStatuses.includes(response.status)) {
        console.log(`✅ ${test.name}: PASSED (${response.status})`);
        passed++;
      } else {
        console.log(`❌ ${test.name}: FAILED (Expected ${expectedStatuses.join(' or ')}, got ${response.status})`);
        failed++;
      }
    } catch (error) {
      console.log(`❌ ${test.name}: ERROR (${error.message})`);
      failed++;
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log('\n📊 API Test Results:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
  
  return failed === 0;
}

async function testPageRoutes() {
  console.log('\n🧪 Testing Page Routes...\n');
  
  const routes = [
    { name: 'Home Page', url: '/' },
    { name: 'Products Page', url: '/products' },
    { name: 'Login Page', url: '/login' },
    { name: 'Register Page', url: '/register' },
    { name: 'Cart Page', url: '/cart' },
    { name: 'Service Request Page', url: '/service-request' },
    { name: 'Admin Dashboard', url: '/admin', expectedStatus: [200, 302, 401] },
    { name: 'POS System', url: '/kasir/pos', expectedStatus: [200, 302, 401] }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const route of routes) {
    try {
      const expectedStatuses = Array.isArray(route.expectedStatus) ? route.expectedStatus : [route.expectedStatus || 200];
      const response = await makeRequest(`${BASE_URL}${route.url}`);
      
      if (expectedStatuses.includes(response.status)) {
        console.log(`✅ ${route.name}: PASSED (${response.status})`);
        passed++;
      } else {
        console.log(`❌ ${route.name}: FAILED (Expected ${expectedStatuses.join(' or ')}, got ${response.status})`);
        failed++;
      }
    } catch (error) {
      console.log(`❌ ${route.name}: ERROR (${error.message})`);
      failed++;
    }
    
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log('\n📊 Page Route Test Results:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
  
  return failed === 0;
}

async function main() {
  console.log('🚀 Starting API and Route Testing...\n');
  console.log(`🌐 Testing against: ${BASE_URL}\n`);
  
  const apiSuccess = await testAPIEndpoints();
  const routeSuccess = await testPageRoutes();
  
  console.log('\n🏁 Overall Test Summary:');
  if (apiSuccess && routeSuccess) {
    console.log('🎉 All tests passed! Your application endpoints are working correctly.');
  } else {
    console.log('⚠️  Some tests failed. Please check the application server and database connection.');
  }
  
  process.exit((apiSuccess && routeSuccess) ? 0 : 1);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testAPIEndpoints, testPageRoutes };
