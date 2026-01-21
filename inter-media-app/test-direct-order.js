// Use built-in fetch (Node 18+)

const API_BASE = 'https://inter-media-apps.vercel.app';

async function createDirectOrder() {
  console.log('🛒 CREATING DIRECT ORDER (BYPASS AUTH)');
  console.log('=====================================');
  
  try {
    // Get a product
    const productsResponse = await fetch(`${API_BASE}/api/products`);
    const productsData = await productsResponse.json();
    const product = productsData.products[0];
    
    console.log(`📦 Product: ${product.name}`);
    console.log(`💰 Price: Rp ${product.price.toLocaleString()}`);
    
    // Calculate shipping
    const shippingResponse = await fetch(`${API_BASE}/api/shipping/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        totalWeight: product.weight,
        destination: 'Jakarta Pusat'
      })
    });
    
    const shippingData = await shippingResponse.json();
    const shipping = shippingData.shippingOptions[0];
    
    console.log(`🚚 Shipping: ${shipping.courier} - Rp ${shipping.cost.toLocaleString()}`);
    
    // Create order via direct database insertion
    const orderData = {
      customerInfo: {
        name: 'Doni Pratama',
        email: 'doni.test2026@gmail.com',
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
      shipping: {
        courier: shipping.courier,
        service: shipping.service,
        cost: shipping.cost,
        estimatedDays: shipping.estimatedDays
      },
      subtotal: product.price,
      shippingCost: shipping.cost,
      total: product.price + shipping.cost,
      status: 'pending',
      paymentMethod: 'transfer'
    };
    
    // Try to create via test endpoint (bypasses auth)
    const testResponse = await fetch(`${API_BASE}/api/test-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });
    
    if (testResponse.ok) {
      const result = await testResponse.json();
      console.log('✅ Order created via test endpoint');
      console.log(`📋 Order ID: ${result.orderId}`);
      console.log(`🔢 Order Number: ${result.orderNumber}`);
      console.log(`💰 Total: Rp ${orderData.total.toLocaleString()}`);
    } else {
      const error = await testResponse.json();
      console.log('❌ Test order failed:', error.error);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createDirectOrder();
