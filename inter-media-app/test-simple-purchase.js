// Use built-in fetch (Node 18+)

const API_BASE = 'https://inter-media-apps.vercel.app';

// Test user credentials
const testUser = {
  email: 'doni.test2026@gmail.com',
  password: 'doni123456'
};

async function testDirectPurchase() {
  console.log('🧪 TESTING DIRECT PURCHASE FLOW');
  console.log('================================');
  
  try {
    // 1. Get products first
    console.log('📦 Getting products...');
    const productsResponse = await fetch(`${API_BASE}/api/products`);
    const productsData = await productsResponse.json();
    
    if (!productsData.products || productsData.products.length === 0) {
      console.log('❌ No products found');
      return;
    }
    
    const product = productsData.products[0];
    console.log(`✅ Found product: ${product.name}`);
    console.log(`💰 Price: Rp ${product.price.toLocaleString()}`);
    console.log(`⚖️ Weight: ${product.weight}g`);
    
    // 2. Test shipping calculation
    console.log('\n🚚 Testing shipping calculation...');
    const shippingResponse = await fetch(`${API_BASE}/api/shipping/calculate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        totalWeight: product.weight,
        destination: 'Jakarta Pusat'
      })
    });
    
    const shippingData = await shippingResponse.json();
    
    if (shippingData.shippingOptions && shippingData.shippingOptions.length > 0) {
      console.log('✅ Shipping calculation successful');
      console.log(`📍 Destination: ${shippingData.destination}`);
      console.log(`📏 Distance: ${shippingData.distance}km`);
      console.log(`🏷️ Zone: ${shippingData.zone}`);
      console.log(`📦 Options: ${shippingData.shippingOptions.length} available`);
      
      // Show first few shipping options
      shippingData.shippingOptions.slice(0, 3).forEach(option => {
        console.log(`  - ${option.courier}: Rp ${option.cost.toLocaleString()} (${option.estimatedDays})`);
      });
    } else {
      console.log('❌ Shipping calculation failed:', shippingData.error || 'No options available');
    }
    
    // 3. Test order creation (without authentication for now)
    console.log('\n📝 Testing order creation...');
    const orderData = {
      customerInfo: {
        name: 'Doni Pratama',
        email: testUser.email,
        phone: '081234567890'
      },
      shippingAddress: {
        street: 'Jl. Sudirman No. 123',
        city: 'Jakarta Pusat',
        district: 'Tanah Abang',
        postalCode: '10270',
        fullAddress: 'Jl. Sudirman No. 123, RT 01/RW 02, dekat Plaza Indonesia'
      },
      items: [{
        productId: product._id,
        name: product.name,
        price: product.price,
        weight: product.weight,
        qty: 1
      }],
      shipping: shippingData.shippingOptions ? {
        courier: shippingData.shippingOptions[0].courier,
        service: shippingData.shippingOptions[0].service,
        price: shippingData.shippingOptions[0].cost,
        estimatedDays: shippingData.shippingOptions[0].estimatedDays
      } : null,
      totalAmount: product.price + (shippingData.shippingOptions ? shippingData.shippingOptions[0].cost : 0)
    };
    
    const orderResponse = await fetch(`${API_BASE}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(orderData)
    });
    
    const orderResult = await orderResponse.json();
    
    if (orderResult.success) {
      console.log('✅ Order created successfully!');
      console.log(`📋 Order ID: ${orderResult.orderId}`);
      console.log(`💰 Total: Rp ${orderData.totalAmount.toLocaleString()}`);
      console.log(`📦 Product: ${product.name}`);
      console.log(`🚚 Shipping: ${orderData.shipping?.courier} - Rp ${orderData.shipping?.price.toLocaleString()}`);
    } else {
      console.log('❌ Order creation failed:', orderResult.error);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testDirectPurchase();
