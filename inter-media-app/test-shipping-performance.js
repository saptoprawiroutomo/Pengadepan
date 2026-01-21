const https = require('https');

const BASE_URL = 'https://inter-media-apps.vercel.app';

async function makeRequest(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const req = https.request(url, {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        ...options.headers
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = data ? JSON.parse(data) : {};
          resolve({ status: res.statusCode, data: parsed, headers: res.headers, cookies: res.headers['set-cookie'] });
        } catch (e) {
          resolve({ status: res.statusCode, data: data, headers: res.headers, cookies: res.headers['set-cookie'] });
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

async function testShippingPerformance() {
  console.log('⚡ Testing Shipping Performance After Optimization...\n');
  
  const testCases = [
    { city: 'Jakarta Pusat', weight: 1500, desc: 'Light package to Jakarta' },
    { city: 'Bandung', weight: 5000, desc: 'Medium package to Bandung' },
    { city: 'Surabaya', weight: 25000, desc: 'Heavy package to Surabaya (cargo)' },
    { city: 'Jakarta Pusat', weight: 1500, desc: 'Same request (should be cached)' }
  ];
  
  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    console.log(`${i+1}. ${testCase.desc}`);
    
    const startTime = Date.now();
    
    const response = await makeRequest('/api/shipping/calculate', {
      method: 'POST',
      body: {
        totalWeight: testCase.weight,
        destination: testCase.city
      }
    });
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`   Status: ${response.status}`);
    console.log(`   Response Time: ${duration}ms`);
    console.log(`   Options Available: ${response.data.shippingOptions?.length || 0}`);
    
    if (response.data.shippingOptions?.length > 0) {
      const cheapest = response.data.shippingOptions[0];
      const recommended = response.data.shippingOptions.find(opt => opt.recommended);
      
      console.log(`   Cheapest: ${cheapest.courier} - Rp ${cheapest.cost.toLocaleString()}`);
      if (recommended) {
        console.log(`   Recommended: ${recommended.courier} - Rp ${recommended.cost.toLocaleString()}`);
      }
    }
    
    // Performance indicator
    if (duration < 500) {
      console.log(`   ✅ Fast response (${duration}ms)`);
    } else if (duration < 1000) {
      console.log(`   ⚠️  Moderate response (${duration}ms)`);
    } else {
      console.log(`   ❌ Slow response (${duration}ms)`);
    }
    
    console.log('');
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log('📊 Performance Test Summary:');
  console.log('- Optimizations implemented: Caching, Debouncing, Priority Loading');
  console.log('- Expected improvement: 60-80% faster for cached requests');
  console.log('- Backend optimization: Priority expedisi processing');
}

testShippingPerformance();
