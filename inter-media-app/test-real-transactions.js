// Real transaction test - no mocks, all data goes to database

// Real customers untuk test
const testCustomers = [
  {
    name: 'Doni Pratama',
    email: 'doni.test2026@gmail.com',
    password: 'doni123456',
    phone: '081234567890',
    address: 'Jl. Sudirman No. 123, RT 01/RW 05, Jakarta Pusat',
    city: 'Jakarta Pusat',
    province: 'DKI Jakarta',
    postalCode: '10110'
  },
  {
    name: 'Sari Dewi',
    email: 'sari.test2026@gmail.com', 
    password: 'sari123456',
    phone: '081234567891',
    address: 'Jl. Gatot Subroto No. 456, RT 02/RW 03, Jakarta Selatan',
    city: 'Jakarta Selatan',
    province: 'DKI Jakarta',
    postalCode: '12950'
  },
  {
    name: 'Budi Santoso',
    email: 'budi.test2026@gmail.com',
    password: 'budi123456', 
    phone: '081234567892',
    address: 'Jl. Ahmad Yani No. 789, RT 05/RW 02, Bogor Tengah',
    city: 'Bogor',
    province: 'Jawa Barat',
    postalCode: '16121'
  },
  {
    name: 'Rina Wati',
    email: 'rina.test2026@gmail.com',
    password: 'rina123456',
    phone: '081234567893', 
    address: 'Jl. Diponegoro No. 321, RT 03/RW 01, Depok',
    city: 'Depok',
    province: 'Jawa Barat',
    postalCode: '16431'
  },
  {
    name: 'Agus Setiawan',
    email: 'agus.test2026@gmail.com',
    password: 'agus123456',
    phone: '081234567894',
    address: 'Jl. Pahlawan No. 654, RT 01/RW 04, Tangerang', 
    city: 'Tangerang',
    province: 'Banten',
    postalCode: '15111'
  }
];

// Production API base URL - using localhost for direct testing
const API_BASE = 'http://localhost:3000';

async function makeAPICall(endpoint, method = 'GET', data = null, cookies = '') {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookies
      }
    };
    
    if (data) {
      options.body = JSON.stringify(data);
    }
    
    const response = await fetch(`${API_BASE}${endpoint}`, options);
    
    // Get cookies from response
    const setCookies = response.headers.get('set-cookie') || '';
    
    let result;
    try {
      result = await response.json();
    } catch (e) {
      result = { error: 'Invalid JSON response' };
    }
    
    return {
      success: response.ok,
      status: response.status,
      data: result,
      cookies: setCookies
    };
  } catch (error) {
    console.error(`❌ API call failed for ${endpoint}:`, error.message);
    return { success: false, error: error.message };
  }
}

async function registerCustomer(customer) {
  console.log(`\n📝 Registering: ${customer.name}`);
  
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
    console.log(`⚠️ ${customer.name} registration: ${result.data?.message || 'May already exist'}`);
    return true; // Continue even if exists
  }
}

async function loginCustomer(customer) {
  console.log(`🔐 Logging in: ${customer.name}`);
  
  // Use NextAuth signin endpoint
  const result = await makeAPICall('/api/auth/callback/credentials', 'POST', {
    email: customer.email,
    password: customer.password,
    redirect: false
  });
  
  if (result.cookies) {
    console.log(`✅ ${customer.name} logged in successfully`);
    return result.cookies;
  } else {
    console.log(`❌ ${customer.name} login failed`);
    return null;
  }
}

async function getProducts(cookies) {
  console.log('📦 Fetching products...');
  
  const result = await makeAPICall('/api/products', 'GET', null, cookies);
  
  if (result.success && result.data?.products) {
    console.log(`✅ Found ${result.data.products.length} products`);
    return result.data.products;
  } else {
    console.log('❌ Failed to fetch products');
    return [];
  }
}

async function addToCart(productId, cookies) {
  const result = await makeAPICall('/api/cart', 'POST', {
    productId,
    qty: 1
  }, cookies);
  
  return result.success;
}

async function getCart(cookies) {
  const result = await makeAPICall('/api/cart', 'GET', null, cookies);
  
  if (result.success && result.data?.cart) {
    return result.data.cart;
  }
  return [];
}

async function calculateShipping(city, totalWeight, cookies) {
  const result = await makeAPICall('/api/shipping/calculate', 'POST', {
    totalWeight,
    destination: city
  }, cookies);
  
  if (result.success) {
    return result.data;
  }
  return null;
}

async function createRealOrder(customer, cart, shippingOption, cookies) {
  const totalProductPrice = cart.reduce((sum, item) => sum + (item.priceSnapshot * item.qty), 0);
  const totalAmount = totalProductPrice + shippingOption.cost;
  
  const orderData = {
    items: cart.map(item => ({
      productId: item.productId._id,
      qty: item.qty,
      priceSnapshot: item.priceSnapshot
    })),
    shippingAddress: {
      receiverName: customer.name,
      phone: customer.phone,
      fullAddress: customer.address,
      city: customer.city,
      province: customer.province,
      district: 'Test District',
      postalCode: customer.postalCode,
      addressLabel: 'Rumah'
    },
    paymentMethod: 'transfer',
    shippingCost: shippingOption.cost,
    shippingCourier: shippingOption.courier,
    shippingService: shippingOption.service,
    totalAmount: totalAmount,
    notes: `Test order from ${customer.name} - Real transaction for testing`
  };
  
  console.log(`💰 Creating order: Rp ${totalAmount.toLocaleString()}`);
  
  const result = await makeAPICall('/api/orders', 'POST', orderData, cookies);
  
  return result;
}

async function processCustomerTransaction(customer, products) {
  console.log(`\n🛒 Processing REAL transaction for: ${customer.name}`);
  console.log(`📧 Email: ${customer.email}`);
  console.log(`📍 Address: ${customer.address}`);
  
  try {
    // 1. Register customer
    await registerCustomer(customer);
    
    // 2. Login customer  
    const cookies = await loginCustomer(customer);
    if (!cookies) {
      console.log('❌ Login failed, skipping transaction');
      return null;
    }
    
    // 3. Select random product
    const randomProduct = products[Math.floor(Math.random() * products.length)];
    console.log(`📦 Selected: ${randomProduct.name} - Rp ${randomProduct.price?.toLocaleString() || 'N/A'}`);
    
    // 4. Add to cart
    const cartAdded = await addToCart(randomProduct._id, cookies);
    if (!cartAdded) {
      console.log('❌ Failed to add to cart');
      return null;
    }
    console.log('✅ Added to cart');
    
    // 5. Get cart contents
    const cart = await getCart(cookies);
    if (!cart || cart.length === 0) {
      console.log('❌ Cart is empty');
      return null;
    }
    
    // 6. Calculate shipping
    const totalWeight = cart.reduce((sum, item) => sum + ((item.productId.weight || 5000) * item.qty), 0);
    const shippingData = await calculateShipping(customer.city, totalWeight, cookies);
    
    if (!shippingData || !shippingData.shippingOptions?.length) {
      console.log('❌ No shipping options available');
      return null;
    }
    
    // Select recommended or cheapest shipping
    const selectedShipping = shippingData.shippingOptions.find(opt => opt.recommended) || shippingData.shippingOptions[0];
    console.log(`🚚 Shipping: ${selectedShipping.courier} - Rp ${selectedShipping.cost.toLocaleString()}`);
    console.log(`📊 Weight: ${shippingData.weightInKg}kg, Distance: ${shippingData.distance}km`);
    
    if (shippingData.needsCargo) {
      console.log('⚠️ Heavy item - Using cargo shipping');
    }
    
    // 7. Create REAL order in database
    const orderResult = await createRealOrder(customer, cart, selectedShipping, cookies);
    
    if (orderResult.success) {
      const orderId = orderResult.data?.orderId || orderResult.data?.order?._id;
      console.log(`✅ REAL ORDER CREATED! Order ID: ${orderId}`);
      
      const totalProductPrice = cart.reduce((sum, item) => sum + (item.priceSnapshot * item.qty), 0);
      const totalAmount = totalProductPrice + selectedShipping.cost;
      console.log(`💰 Total Amount: Rp ${totalAmount.toLocaleString()}`);
      
      return {
        customer: customer.name,
        email: customer.email,
        orderId,
        product: randomProduct.name,
        productPrice: totalProductPrice,
        shippingCost: selectedShipping.cost,
        totalAmount,
        shippingMethod: selectedShipping.courier,
        city: customer.city,
        weight: shippingData.weightInKg,
        distance: shippingData.distance,
        needsCargo: shippingData.needsCargo
      };
    } else {
      console.log('❌ Failed to create order:', orderResult.data?.error || orderResult.data?.message);
      return null;
    }
    
  } catch (error) {
    console.error(`❌ Transaction failed for ${customer.name}:`, error.message);
    return null;
  }
}

async function runRealTransactionTests() {
  console.log('🚀 STARTING REAL DATABASE TRANSACTIONS');
  console.log('======================================');
  console.log('⚠️  WARNING: This will create REAL orders in the database!');
  console.log('📊 All transactions will appear in reports and analytics\n');
  
  // Wait 3 seconds for user to cancel if needed
  console.log('⏳ Starting in 3 seconds... (Ctrl+C to cancel)');
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Get products first
  const products = await getProducts('');
  if (products.length === 0) {
    console.log('❌ No products available. Please seed database first.');
    return;
  }
  
  console.log(`📦 Found ${products.length} products available for purchase\n`);
  
  const results = [];
  let successCount = 0;
  
  // Process each customer
  for (let i = 0; i < testCustomers.length; i++) {
    const customer = testCustomers[i];
    
    const result = await processCustomerTransaction(customer, products);
    
    if (result) {
      results.push(result);
      successCount++;
    }
    
    // Wait between transactions
    if (i < testCustomers.length - 1) {
      console.log('\n⏳ Waiting 3 seconds before next transaction...');
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
  
  // Final Summary
  console.log('\n📊 REAL TRANSACTION SUMMARY');
  console.log('===========================');
  console.log(`✅ Successful orders: ${successCount}/${testCustomers.length}`);
  console.log(`❌ Failed orders: ${testCustomers.length - successCount}/${testCustomers.length}`);
  console.log(`📈 Success rate: ${Math.round((successCount / testCustomers.length) * 100)}%`);
  
  if (results.length > 0) {
    const totalRevenue = results.reduce((sum, r) => sum + r.totalAmount, 0);
    const totalShipping = results.reduce((sum, r) => sum + r.shippingCost, 0);
    const avgOrder = totalRevenue / results.length;
    
    console.log('\n💰 REVENUE ANALYSIS');
    console.log('===================');
    console.log(`💵 Total Revenue: Rp ${totalRevenue.toLocaleString()}`);
    console.log(`🚚 Total Shipping: Rp ${totalShipping.toLocaleString()}`);
    console.log(`📊 Average Order: Rp ${avgOrder.toLocaleString()}`);
    
    console.log('\n📋 ORDER DETAILS');
    console.log('================');
    results.forEach((result, index) => {
      console.log(`${index + 1}. ${result.customer} (${result.city})`);
      console.log(`   📧 ${result.email}`);
      console.log(`   🆔 Order ID: ${result.orderId}`);
      console.log(`   📦 ${result.product} - Rp ${result.productPrice.toLocaleString()}`);
      console.log(`   🚚 ${result.shippingMethod} - Rp ${result.shippingCost.toLocaleString()}`);
      console.log(`   💰 Total: Rp ${result.totalAmount.toLocaleString()}`);
      console.log(`   📊 ${result.weight}kg, ${result.distance}km${result.needsCargo ? ' (CARGO)' : ''}`);
      console.log('');
    });
    
    console.log('🎯 NEXT STEPS:');
    console.log('==============');
    console.log('1. Check admin dashboard for new orders');
    console.log('2. Verify orders appear in reports');
    console.log('3. Test order status updates');
    console.log('4. Check inventory updates');
    console.log('5. Verify customer notifications');
  }
}

// Run the real transaction tests
runRealTransactionTests().catch(console.error);
