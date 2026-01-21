// Test customers data
const testCustomers = [
  {
    name: 'Doni Pratama',
    email: 'doni.pratama@gmail.com',
    password: 'doni123',
    phone: '081234567890',
    address: 'Jl. Sudirman No. 123, Jakarta Pusat',
    city: 'Jakarta Pusat'
  },
  {
    name: 'Sari Dewi',
    email: 'sari.dewi@gmail.com', 
    password: 'sari123',
    phone: '081234567891',
    address: 'Jl. Gatot Subroto No. 456, Jakarta Selatan',
    city: 'Jakarta Selatan'
  },
  {
    name: 'Budi Santoso',
    email: 'budi.santoso@gmail.com',
    password: 'budi123', 
    phone: '081234567892',
    address: 'Jl. Ahmad Yani No. 789, Bogor',
    city: 'Bogor'
  },
  {
    name: 'Rina Wati',
    email: 'rina.wati@gmail.com',
    password: 'rina123',
    phone: '081234567893', 
    address: 'Jl. Diponegoro No. 321, Depok',
    city: 'Depok'
  },
  {
    name: 'Agus Setiawan',
    email: 'agus.setiawan@gmail.com',
    password: 'agus123',
    phone: '081234567894',
    address: 'Jl. Pahlawan No. 654, Tangerang', 
    city: 'Tangerang'
  }
];

async function makeAPICall(endpoint, method = 'GET', data = null, headers = {}) {
  // Use development URL from environment
  const baseURL = 'https://bookish-yodel-7xg75gj4pgvhp64g-3000.app.github.dev';
  
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };
    
    if (data) {
      options.body = JSON.stringify(data);
    }
    
    const response = await fetch(`${baseURL}${endpoint}`, options);
    const result = await response.json();
    
    return {
      success: response.ok,
      status: response.status,
      data: result
    };
  } catch (error) {
    console.error(`❌ API call failed for ${endpoint}:`, error.message);
    return { success: false, error: error.message };
  }
}

async function registerCustomer(customer) {
  console.log(`\n📝 Registering customer: ${customer.name}`);
  
  const result = await makeAPICall('/api/auth/register', 'POST', {
    name: customer.name,
    email: customer.email,
    password: customer.password,
    phone: customer.phone,
    address: customer.address,
    role: 'customer'
  });
  
  if (result.success) {
    console.log(`✅ ${customer.name} registered successfully`);
    return true;
  } else {
    console.log(`⚠️ ${customer.name} registration:`, result.data?.message || result.data?.error || 'May already exist');
    return true; // Continue even if already exists
  }
}

async function getProducts() {
  console.log('\n📦 Fetching products...');
  
  const result = await makeAPICall('/api/products');
  
  if (result.success && result.data?.products) {
    const printers = result.data.products.filter(p => 
      p.name.toLowerCase().includes('printer') || 
      p.name.toLowerCase().includes('canon') ||
      p.name.toLowerCase().includes('epson') ||
      p.name.toLowerCase().includes('hp') ||
      p.category?.name?.toLowerCase().includes('printer')
    );
    
    console.log(`✅ Found ${printers.length} printer products`);
    if (printers.length > 0) {
      console.log(`📋 Available printers: ${printers.map(p => p.name).join(', ')}`);
    }
    return printers.length > 0 ? printers : result.data.products.slice(0, 5); // Fallback to any products
  } else {
    console.log('❌ Failed to fetch products');
    return [];
  }
}

async function calculateShipping(city, totalWeight = 5000) {
  console.log(`🚚 Calculating shipping for ${city}, weight: ${totalWeight}g`);
  
  const result = await makeAPICall('/api/shipping/calculate', 'POST', {
    totalWeight,
    destination: city
  });
  
  if (result.success) {
    console.log(`✅ Shipping calculated successfully`);
    console.log(`📍 Distance: ${result.data.distance}km, Zone: ${result.data.zone}`);
    console.log(`⚖️ Weight: ${result.data.weightInKg}kg, Cargo needed: ${result.data.needsCargo ? 'Yes' : 'No'}`);
    
    if (result.data.recommendations?.heavyItem) {
      console.log(`⚠️ ${result.data.recommendations.heavyItem}`);
    }
    
    return result.data;
  } else {
    console.log('❌ Failed to calculate shipping:', result.data?.error);
    return null;
  }
}

async function testShippingCalculation(customer, product) {
  console.log(`\n🛒 Testing shipping for: ${customer.name}`);
  console.log(`📦 Product: ${product.name} - Rp ${product.price?.toLocaleString() || 'N/A'}`);
  
  // Calculate shipping with product weight
  const productWeight = product.weight || 5000; // Default 5kg if not specified
  const shippingData = await calculateShipping(customer.city, productWeight);
  
  if (!shippingData || !shippingData.shippingOptions?.length) {
    console.log('❌ No shipping options available');
    return false;
  }
  
  console.log(`\n📋 Available shipping options for ${customer.city}:`);
  shippingData.shippingOptions.forEach((option, index) => {
    const badge = option.recommended ? '⭐ RECOMMENDED' : '';
    const type = option.type === 'kargo' ? '🚛' : option.type === 'gosend' ? '🏍️' : option.type === 'kurir-toko' ? '🚲' : '📦';
    
    console.log(`${index + 1}. ${type} ${option.courier} - Rp ${option.cost.toLocaleString()} - ${option.estimatedDays} ${badge}`);
    console.log(`   ${option.description}`);
  });
  
  // Select cheapest or recommended option
  const selectedShipping = shippingData.shippingOptions.find(opt => opt.recommended) || shippingData.shippingOptions[0];
  console.log(`\n✅ Selected: ${selectedShipping.courier} - Rp ${selectedShipping.cost.toLocaleString()}`);
  
  // Calculate total
  const productPrice = product.price || 100000; // Default price if not available
  const total = productPrice + selectedShipping.cost;
  console.log(`💰 Total Order: Rp ${productPrice.toLocaleString()} + Rp ${selectedShipping.cost.toLocaleString()} = Rp ${total.toLocaleString()}`);
  
  return {
    customer,
    product,
    shipping: selectedShipping,
    total,
    shippingData
  };
}

async function runShippingTests() {
  console.log('🚀 Starting Customer Shipping Tests');
  console.log('=====================================\n');
  
  // Get available products
  const products = await getProducts();
  if (products.length === 0) {
    console.log('❌ No products found. Cannot proceed with tests.');
    return;
  }
  
  let successCount = 0;
  const testResults = [];
  
  // Test each customer
  for (let i = 0; i < testCustomers.length; i++) {
    const customer = testCustomers[i];
    
    // Register customer first
    await registerCustomer(customer);
    
    // Select random product for each customer
    const randomProduct = products[Math.floor(Math.random() * products.length)];
    
    const result = await testShippingCalculation(customer, randomProduct);
    
    if (result) {
      successCount++;
      testResults.push(result);
    }
    
    // Wait between tests
    if (i < testCustomers.length - 1) {
      console.log('\n⏳ Waiting 2 seconds before next test...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  // Summary
  console.log('\n📊 TEST SUMMARY');
  console.log('================');
  console.log(`✅ Successful shipping calculations: ${successCount}/${testCustomers.length}`);
  console.log(`❌ Failed calculations: ${testCustomers.length - successCount}/${testCustomers.length}`);
  console.log(`📈 Success rate: ${Math.round((successCount / testCustomers.length) * 100)}%`);
  
  if (testResults.length > 0) {
    console.log('\n💰 PRICING ANALYSIS');
    console.log('===================');
    
    const totalOrders = testResults.reduce((sum, r) => sum + r.total, 0);
    const avgOrder = totalOrders / testResults.length;
    const totalShipping = testResults.reduce((sum, r) => sum + r.shipping.cost, 0);
    const avgShipping = totalShipping / testResults.length;
    
    console.log(`📦 Average order value: Rp ${avgOrder.toLocaleString()}`);
    console.log(`🚚 Average shipping cost: Rp ${avgShipping.toLocaleString()}`);
    console.log(`📊 Shipping percentage: ${Math.round((avgShipping / avgOrder) * 100)}%`);
    
    // Shipping method analysis
    const shippingMethods = {};
    testResults.forEach(r => {
      const method = r.shipping.courier;
      if (!shippingMethods[method]) {
        shippingMethods[method] = { count: 0, totalCost: 0 };
      }
      shippingMethods[method].count++;
      shippingMethods[method].totalCost += r.shipping.cost;
    });
    
    console.log('\n🚛 SHIPPING METHOD USAGE');
    console.log('========================');
    Object.entries(shippingMethods).forEach(([method, data]) => {
      const avgCost = data.totalCost / data.count;
      const percentage = Math.round((data.count / testResults.length) * 100);
      console.log(`${method}: ${data.count}x (${percentage}%) - Avg: Rp ${avgCost.toLocaleString()}`);
    });
  }
}

// Run tests
runShippingTests().catch(console.error);
