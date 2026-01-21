const https = require('https');

const BASE_URL = 'https://inter-media-apps.vercel.app';

async function makeRequest(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const req = https.request(url, {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Test-Script/1.0',
        ...options.headers
      }
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

async function testOrderFlow() {
  console.log('🧪 Testing Order Flow...\n');
  
  try {
    // 1. Test login dengan akun kasir
    console.log('1. Testing login...');
    const loginResponse = await makeRequest('/api/auth/signin', {
      method: 'POST',
      body: {
        email: 'kasir@intermedia.com',
        password: 'kasir123'
      }
    });
    
    console.log(`Login Status: ${loginResponse.status}`);
    
    // 2. Test get products
    console.log('\n2. Testing get products...');
    const productsResponse = await makeRequest('/api/products');
    console.log(`Products Status: ${productsResponse.status}`);
    console.log(`Products Count: ${productsResponse.data.products?.length || 0}`);
    
    // 3. Test shipping calculation
    console.log('\n3. Testing shipping calculation...');
    const shippingResponse = await makeRequest('/api/shipping/calculate', {
      method: 'POST',
      body: {
        totalWeight: 2000, // 2kg
        destination: 'Jakarta Pusat'
      }
    });
    
    console.log(`Shipping Status: ${shippingResponse.status}`);
    console.log(`Shipping Options: ${shippingResponse.data.shippingOptions?.length || 0}`);
    
    if (shippingResponse.data.shippingOptions?.length > 0) {
      console.log('Available shipping options:');
      shippingResponse.data.shippingOptions.slice(0, 3).forEach((option, i) => {
        console.log(`  ${i+1}. ${option.courier} - Rp ${option.cost.toLocaleString()} (${option.estimatedDays})`);
      });
    }
    
    // 4. Test checkout page access
    console.log('\n4. Testing checkout page access...');
    const checkoutResponse = await makeRequest('/checkout-new');
    console.log(`Checkout Page Status: ${checkoutResponse.status}`);
    
    console.log('\n✅ Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testOrderFlow();
