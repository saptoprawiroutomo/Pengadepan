const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/inter-media-app');

async function createSampleOrders() {
  try {
    await new Promise((resolve) => {
      mongoose.connection.once('open', resolve);
    });

    console.log('🔄 Creating sample orders...');

    // Get admin user and products
    const admin = await mongoose.connection.db.collection('users').findOne({ email: 'admin@test.com' });
    const products = await mongoose.connection.db.collection('products').find({}).limit(3).toArray();
    
    if (!admin || products.length === 0) {
      console.log('❌ Need admin user and products first');
      process.exit(1);
    }

    // Create sample orders
    const orders = [
      {
        orderCode: 'ORD-2026-000001',
        userId: admin._id,
        items: [
          {
            productId: products[0]._id,
            nameSnapshot: products[0].name,
            priceSnapshot: products[0].price,
            qty: 2,
            subtotal: products[0].price * 2
          }
        ],
        subtotal: products[0].price * 2,
        shippingCost: 15000,
        total: (products[0].price * 2) + 15000,
        status: 'pending',
        paymentMethod: 'bank_transfer',
        shippingAddress: {
          name: 'Admin Test',
          phone: '081234567890',
          address: 'Jl. Test No. 123',
          city: 'Jakarta',
          postalCode: '12345'
        },
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        orderCode: 'ORD-2026-000002',
        userId: admin._id,
        items: [
          {
            productId: products[1]._id,
            nameSnapshot: products[1].name,
            priceSnapshot: products[1].price,
            qty: 1,
            subtotal: products[1].price
          }
        ],
        subtotal: products[1].price,
        shippingCost: 12000,
        total: products[1].price + 12000,
        status: 'confirmed',
        paymentMethod: 'bank_transfer',
        shippingAddress: {
          name: 'Admin Test',
          phone: '081234567890',
          address: 'Jl. Test No. 123',
          city: 'Jakarta',
          postalCode: '12345'
        },
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await mongoose.connection.db.collection('orders').insertMany(orders);
    console.log('✅ Sample orders created:', orders.length);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createSampleOrders();
