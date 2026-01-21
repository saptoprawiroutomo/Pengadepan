const mongoose = require('mongoose');

// Connect to database
async function connectDB() {
  try {
    await mongoose.connect('mongodb://localhost:27017/inter-media-app');
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

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

// Test printer products
const printerProducts = [
  'Canon PIXMA G2010',
  'Epson L3110', 
  'HP DeskJet 2135',
  'Brother DCP-T310',
  'Canon PIXMA G3010'
];

async function makeAPICall(endpoint, method = 'GET', data = null, headers = {}) {
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
    console.log(`⚠️ ${customer.name} registration failed:`, result.data?.error || 'Unknown error');
    return false;
  }
}

async function loginCustomer(customer) {
  console.log(`🔐 Logging in: ${customer.name}`);
  
  const result = await makeAPICall('/api/auth/signin', 'POST', {
    email: customer.email,
    password: customer.password
  });
  
  if (result.success && result.data?.token) {
    console.log(`✅ ${customer.name} logged in successfully`);
    return result.data.token;
  } else {
    console.log(`❌ ${customer.name} login failed`);
    return null;
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
      p.name.toLowerCase().includes('hp')
    );
    
    console.log(`✅ Found ${printers.length} printer products`);
    return printers;
  } else {
    console.log('❌ Failed to fetch products');
    return [];
  }
}

async function addToCart(productId, token) {
  const result = await makeAPICall('/api/cart', 'POST', {
    productId,
    qty: 1
  }, {
    'Authorization': `Bearer ${token}`
  });
  
  return result.success;
}

async function calculateShipping(city, totalWeight = 5000) {
  const result = await makeAPICall('/api/shipping/calculate', 'POST', {
    totalWeight,
    destination: city
  });
  
  if (result.success) {
    return result.data;
  }
  return null;
}

async function createOrder(customer, product, shippingOption, token) {
  const orderData = {
    items: [{
      productId: product._id,
      qty: 1,
      priceSnapshot: product.price
    }],
    shippingAddress: {
      receiverName: customer.name,
      phone: customer.phone,
      fullAddress: customer.address,
      city: customer.city,
      province: 'DKI Jakarta',
      postalCode: '12345'
    },
    paymentMethod: 'transfer',
    shippingCost: shippingOption.cost,
    shippingCourier: shippingOption.courier,
    totalAmount: product.price + shippingOption.cost
  };
  
  const result = await makeAPICall('/api/orders', 'POST', orderData, {
    'Authorization': `Bearer ${token}`
  });
  
  return result;
}

async function testCustomerTransaction(customer, products) {
  console.log(`\n🛒 Testing transaction for: ${customer.name}`);
  
  // 1. Register customer
  await registerCustomer(customer);
  
  // 2. Login customer  
  const token = await loginCustomer(customer);
  if (!token) return false;
  
  // 3. Select random printer
  const randomPrinter = products[Math.floor(Math.random() * products.length)];
  console.log(`📦 Selected product: ${randomPrinter.name} - Rp ${randomPrinter.price.toLocaleString()}`);
  
  // 4. Add to cart
  const cartAdded = await addToCart(randomPrinter._id, token);
  if (!cartAdded) {
    console.log('❌ Failed to add to cart');
    return false;
  }
  console.log('✅ Added to cart');
  
  // 5. Calculate shipping
  const shippingData = await calculateShipping(customer.city, randomPrinter.weight || 5000);
  if (!shippingData || !shippingData.shippingOptions?.length) {
    console.log('❌ Failed to calculate shipping');
    return false;
  }
  
  const selectedShipping = shippingData.shippingOptions[0]; // Cheapest option
  console.log(`🚚 Shipping: ${selectedShipping.courier} - Rp ${selectedShipping.cost.toLocaleString()}`);
  console.log(`📍 Distance: ${shippingData.distance}km, Weight: ${shippingData.weightInKg}kg`);
  
  if (shippingData.needsCargo) {
    console.log('⚠️ Heavy item - Cargo shipping recommended');
  }
  
  // 6. Create order
  const orderResult = await createOrder(customer, randomPrinter, selectedShipping, token);
  if (orderResult.success) {
    console.log(`✅ Order created successfully! Order ID: ${orderResult.data?.orderId || 'N/A'}`);
    console.log(`💰 Total: Rp ${(randomPrinter.price + selectedShipping.cost).toLocaleString()}`);
    return true;
  } else {
    console.log('❌ Failed to create order:', orderResult.data?.error);
    return false;
  }
}

async function runCustomerTests() {
  console.log('🚀 Starting Customer Transaction Tests\n');
  
  await connectDB();
  
  // Get available products
  const products = await getProducts();
  if (products.length === 0) {
    console.log('❌ No printer products found. Please seed the database first.');
    return;
  }
  
  let successCount = 0;
  
  // Test each customer
  for (let i = 0; i < testCustomers.length; i++) {
    const customer = testCustomers[i];
    const success = await testCustomerTransaction(customer, products);
    
    if (success) {
      successCount++;
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
  console.log(`✅ Successful transactions: ${successCount}/${testCustomers.length}`);
  console.log(`❌ Failed transactions: ${testCustomers.length - successCount}/${testCustomers.length}`);
  console.log(`📈 Success rate: ${Math.round((successCount / testCustomers.length) * 100)}%`);
  
  mongoose.connection.close();
}

// Run tests
runCustomerTests().catch(console.error);
