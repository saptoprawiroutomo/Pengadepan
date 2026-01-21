// Real purchase test with Jabodetabek addresses
const testPurchases = [
  {
    customer: {
      email: 'doni.test2026@gmail.com',
      password: 'doni123456',
      name: 'Doni Pratama',
      city: 'Jakarta Pusat'
    },
    shippingAddress: {
      receiverName: 'Doni Pratama',
      phone: '081234567890',
      province: 'DKI Jakarta',
      city: 'Jakarta Pusat',
      district: 'Menteng',
      postalCode: '10310',
      fullAddress: 'Jl. Sudirman No. 123, RT 01/RW 05, dekat Plaza Indonesia',
      addressLabel: 'Kantor'
    }
  },
  {
    customer: {
      email: 'budi.test2026@gmail.com',
      password: 'budi123456',
      name: 'Budi Santoso',
      city: 'Bogor'
    },
    shippingAddress: {
      receiverName: 'Budi Santoso',
      phone: '081234567892',
      province: 'Jawa Barat',
      city: 'Bogor',
      district: 'Bogor Tengah',
      postalCode: '16121',
      fullAddress: 'Jl. Ahmad Yani No. 789, RT 05/RW 02, dekat Botani Square',
      addressLabel: 'Rumah'
    }
  },
  {
    customer: {
      email: 'rina.test2026@gmail.com',
      password: 'rina123456',
      name: 'Rina Wati',
      city: 'Depok'
    },
    shippingAddress: {
      receiverName: 'Rina Wati',
      phone: '081234567893',
      province: 'Jawa Barat',
      city: 'Depok',
      district: 'Pancoran Mas',
      postalCode: '16431',
      fullAddress: 'Jl. Diponegoro No. 321, RT 03/RW 01, dekat UI Depok',
      addressLabel: 'Rumah'
    }
  }
];

const API_BASE = 'https://inter-media-apps.vercel.app';

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

async function loginCustomer(email, password) {
  console.log(`🔐 Logging in: ${email}`);
  
  // Try NextAuth credentials login
  const result = await makeAPICall('/api/auth/callback/credentials', 'POST', {
    email,
    password,
    redirect: false,
    json: true
  });
  
  if (result.cookies || result.success) {
    console.log(`✅ Login successful`);
    return result.cookies || 'logged-in';
  } else {
    console.log(`❌ Login failed:`, result.data?.error);
    return null;
  }
}

async function getProducts(cookies) {
  const result = await makeAPICall('/api/products', 'GET', null, cookies);
  
  if (result.success && result.data?.products) {
    return result.data.products;
  }
  return [];
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
  
  return result.success ? result.data : null;
}

async function createOrder(orderData, cookies) {
  const result = await makeAPICall('/api/orders', 'POST', orderData, cookies);
  return result;
}

async function processRealPurchase(testCase) {
  const { customer, shippingAddress } = testCase;
  
  console.log(`\n🛒 REAL PURCHASE TEST: ${customer.name}`);
  console.log(`📧 Email: ${customer.email}`);
  console.log(`📍 Shipping to: ${shippingAddress.city}, ${shippingAddress.province}`);
  
  try {
    // 1. Login
    const cookies = await loginCustomer(customer.email, customer.password);
    if (!cookies) {
      console.log('❌ Login failed, skipping purchase');
      return null;
    }
    
    // 2. Get products
    const products = await getProducts(cookies);
    if (products.length === 0) {
      console.log('❌ No products available');
      return null;
    }
    
    // 3. Select random product (prefer printers/electronics)
    const preferredProducts = products.filter(p => 
      p.name.toLowerCase().includes('printer') ||
      p.name.toLowerCase().includes('canon') ||
      p.name.toLowerCase().includes('epson') ||
      p.name.toLowerCase().includes('hp')
    );
    
    const selectedProduct = preferredProducts.length > 0 ? 
      preferredProducts[Math.floor(Math.random() * preferredProducts.length)] :
      products[Math.floor(Math.random() * products.length)];
    
    console.log(`📦 Selected Product: ${selectedProduct.name}`);
    console.log(`💰 Price: Rp ${selectedProduct.price?.toLocaleString() || 'N/A'}`);
    console.log(`⚖️ Weight: ${selectedProduct.weight || 5000}g`);
    
    // 4. Add to cart
    const cartAdded = await addToCart(selectedProduct._id, cookies);
    if (!cartAdded) {
      console.log('❌ Failed to add to cart');
      return null;
    }
    console.log('✅ Added to cart successfully');
    
    // 5. Get cart
    const cart = await getCart(cookies);
    if (!cart || cart.length === 0) {
      console.log('❌ Cart is empty');
      return null;
    }
    
    // 6. Calculate shipping
    const totalWeight = cart.reduce((sum, item) => 
      sum + ((item.productId.weight || 5000) * item.qty), 0
    );
    
    console.log(`📊 Total Weight: ${totalWeight}g (${Math.ceil(totalWeight/1000)}kg)`);
    
    const shippingData = await calculateShipping(customer.city, totalWeight, cookies);
    if (!shippingData || !shippingData.shippingOptions?.length) {
      console.log('❌ No shipping options available');
      return null;
    }
    
    console.log(`🚚 Shipping Options Available: ${shippingData.shippingOptions.length}`);
    console.log(`📍 Distance: ${shippingData.distance}km, Zone: ${shippingData.zone}`);
    
    if (shippingData.needsCargo) {
      console.log('⚠️ Heavy item - Cargo shipping required');
    }
    
    // Select recommended or cheapest shipping
    const selectedShipping = shippingData.shippingOptions.find(opt => opt.recommended) || 
                            shippingData.shippingOptions[0];
    
    console.log(`✅ Selected Shipping: ${selectedShipping.courier}`);
    console.log(`💰 Shipping Cost: Rp ${selectedShipping.cost.toLocaleString()}`);
    console.log(`⏱️ Estimated: ${selectedShipping.estimatedDays}`);
    
    // 7. Create real order
    const totalProductPrice = cart.reduce((sum, item) => sum + (item.priceSnapshot * item.qty), 0);
    const totalAmount = totalProductPrice + selectedShipping.cost;
    
    const orderData = {
      items: cart.map(item => ({
        productId: item.productId._id,
        qty: item.qty,
        priceSnapshot: item.priceSnapshot
      })),
      shippingAddress,
      paymentMethod: 'transfer',
      shippingCost: selectedShipping.cost,
      shippingCourier: selectedShipping.courier,
      shippingService: selectedShipping.service,
      totalAmount,
      notes: `Real test purchase from ${customer.name} - Jabodetabek shipping test`
    };
    
    console.log(`💳 Creating order - Total: Rp ${totalAmount.toLocaleString()}`);
    
    const orderResult = await createOrder(orderData, cookies);
    
    if (orderResult.success) {
      const orderId = orderResult.data?.orderId || orderResult.data?.order?._id;
      console.log(`🎉 ORDER CREATED SUCCESSFULLY!`);
      console.log(`🆔 Order ID: ${orderId}`);
      console.log(`💰 Total Amount: Rp ${totalAmount.toLocaleString()}`);
      
      return {
        customer: customer.name,
        email: customer.email,
        orderId,
        product: selectedProduct.name,
        productPrice: totalProductPrice,
        shippingCost: selectedShipping.cost,
        shippingMethod: selectedShipping.courier,
        totalAmount,
        city: customer.city,
        weight: Math.ceil(totalWeight/1000),
        distance: shippingData.distance,
        needsCargo: shippingData.needsCargo
      };
    } else {
      console.log('❌ Order creation failed:', orderResult.data?.error);
      return null;
    }
    
  } catch (error) {
    console.error(`❌ Purchase failed for ${customer.name}:`, error.message);
    return null;
  }
}

async function runRealPurchaseTests() {
  console.log('🚀 REAL PURCHASE TESTS - JABODETABEK');
  console.log('====================================');
  console.log('⚠️  Creating REAL orders in production database!');
  console.log('📊 All orders will appear in admin reports\n');
  
  const results = [];
  let successCount = 0;
  
  for (const testCase of testPurchases) {
    const result = await processRealPurchase(testCase);
    
    if (result) {
      results.push(result);
      successCount++;
    }
    
    // Wait between purchases
    console.log('\n⏳ Waiting 3 seconds before next purchase...');
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
  
  // Final Summary
  console.log('\n📊 REAL PURCHASE SUMMARY');
  console.log('========================');
  console.log(`✅ Successful orders: ${successCount}/${testPurchases.length}`);
  console.log(`❌ Failed orders: ${testPurchases.length - successCount}/${testPurchases.length}`);
  
  if (results.length > 0) {
    const totalRevenue = results.reduce((sum, r) => sum + r.totalAmount, 0);
    const totalShipping = results.reduce((sum, r) => sum + r.shippingCost, 0);
    
    console.log('\n💰 REVENUE SUMMARY');
    console.log('==================');
    console.log(`💵 Total Revenue: Rp ${totalRevenue.toLocaleString()}`);
    console.log(`🚚 Total Shipping: Rp ${totalShipping.toLocaleString()}`);
    console.log(`📊 Average Order: Rp ${Math.round(totalRevenue/results.length).toLocaleString()}`);
    
    console.log('\n📋 ORDER DETAILS');
    console.log('================');
    results.forEach((result, index) => {
      console.log(`${index + 1}. ${result.customer} (${result.city})`);
      console.log(`   🆔 Order ID: ${result.orderId}`);
      console.log(`   📦 ${result.product}`);
      console.log(`   🚚 ${result.shippingMethod} - Rp ${result.shippingCost.toLocaleString()}`);
      console.log(`   💰 Total: Rp ${result.totalAmount.toLocaleString()}`);
      console.log(`   📊 ${result.weight}kg, ${result.distance}km${result.needsCargo ? ' (CARGO)' : ''}`);
      console.log('');
    });
    
    console.log('🎯 VERIFICATION STEPS:');
    console.log('======================');
    console.log('1. Check admin panel - orders should appear in "Kelola Pesanan"');
    console.log('2. Check reports - revenue should be updated');
    console.log('3. Check inventory - stock should be reduced');
    console.log('4. Verify shipping calculations are correct');
  }
}

// Run the real purchase tests
runRealPurchaseTests().catch(console.error);
