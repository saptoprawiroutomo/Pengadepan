const { MongoClient } = require('mongodb');

// MongoDB connection string - production
const MONGODB_URI = 'mongodb+srv://saptoprawiroutomo:Sapto123@cluster0.ixqhj.mongodb.net/intermedia?retryWrites=true&w=majority&appName=Cluster0';

async function createRealOrder() {
  console.log('🛒 CREATING REAL ORDER IN PRODUCTION DATABASE');
  console.log('==============================================');
  
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db('intermedia');
    
    // Get a product
    const product = await db.collection('products').findOne({ isActive: true });
    if (!product) {
      console.log('❌ No active products found');
      return;
    }
    
    console.log(`📦 Product: ${product.name}`);
    console.log(`💰 Price: Rp ${product.price.toLocaleString()}`);
    console.log(`⚖️ Weight: ${product.weight}g`);
    
    // Calculate shipping (using API)
    const shippingResponse = await fetch('https://inter-media-apps.vercel.app/api/shipping/calculate', {
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
    
    // Generate order number
    const orderNumber = `ORD-${Date.now()}`;
    
    // Create order document
    const orderDoc = {
      orderNumber,
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
        fullAddress: 'Jl. Sudirman No. 123, RT 01/RW 02, dekat Plaza Indonesia',
        addressLabel: 'Rumah'
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
      paymentMethod: 'transfer',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Insert order
    const result = await db.collection('orders').insertOne(orderDoc);
    
    // Update product stock
    await db.collection('products').updateOne(
      { _id: product._id },
      { $inc: { stock: -1 } }
    );
    
    console.log('✅ Order created successfully!');
    console.log(`📋 Order ID: ${result.insertedId}`);
    console.log(`🔢 Order Number: ${orderNumber}`);
    console.log(`💰 Total: Rp ${orderDoc.total.toLocaleString()}`);
    console.log(`📦 Product: ${product.name}`);
    console.log(`🚚 Shipping: ${shipping.courier} - Rp ${shipping.cost.toLocaleString()}`);
    
    // Verify order exists
    const createdOrder = await db.collection('orders').findOne({ _id: result.insertedId });
    if (createdOrder) {
      console.log('✅ Order verified in database');
      console.log(`📅 Created: ${createdOrder.createdAt}`);
      console.log(`📊 Status: ${createdOrder.status}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.close();
    console.log('🔌 Database connection closed');
  }
}

createRealOrder();
