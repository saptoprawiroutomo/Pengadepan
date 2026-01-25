const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

mongoose.connect('mongodb://localhost:27017/inter-media-app');

async function createCompleteTestData() {
  try {
    await new Promise((resolve) => {
      mongoose.connection.once('open', resolve);
    });

    console.log('🔄 Creating complete test data for e-commerce flow...\n');

    // 1. Create Customer User
    console.log('1️⃣ Creating customer user...');
    const customerPassword = await bcrypt.hash('customer123', 12);
    
    await mongoose.connection.db.collection('users').deleteOne({ email: 'customer@test.com' });
    const customer = await mongoose.connection.db.collection('users').insertOne({
      name: 'Budi Santoso',
      email: 'customer@test.com',
      passwordHash: customerPassword,
      role: 'customer',
      phone: '081234567890',
      address: 'Jl. Merdeka No. 45, Jakarta Pusat',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log('✅ Customer created:', customer.insertedId);

    // 2. Get existing products and categories
    console.log('\n2️⃣ Getting products...');
    const products = await mongoose.connection.db.collection('products').find({}).toArray();
    console.log('✅ Found products:', products.length);

    // 3. Create Cart for Customer
    console.log('\n3️⃣ Creating shopping cart...');
    await mongoose.connection.db.collection('carts').deleteOne({ userId: customer.insertedId });
    const cart = await mongoose.connection.db.collection('carts').insertOne({
      userId: customer.insertedId,
      items: [
        {
          productId: products[0]._id,
          qty: 2,
          priceSnapshot: products[0].price
        },
        {
          productId: products[1]._id,
          qty: 1,
          priceSnapshot: products[1].price
        }
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log('✅ Cart created with 2 items');

    // 4. Create Order from Cart
    console.log('\n4️⃣ Creating order...');
    const orderItems = [
      {
        productId: products[0]._id,
        nameSnapshot: products[0].name,
        priceSnapshot: products[0].price,
        qty: 2,
        subtotal: products[0].price * 2
      },
      {
        productId: products[1]._id,
        nameSnapshot: products[1].name,
        priceSnapshot: products[1].price,
        qty: 1,
        subtotal: products[1].price
      }
    ];

    const subtotal = orderItems.reduce((sum, item) => sum + item.subtotal, 0);
    const shippingCost = 15000;
    const total = subtotal + shippingCost;

    const order = await mongoose.connection.db.collection('orders').insertOne({
      orderCode: 'ORD-2026-' + Date.now().toString().slice(-6),
      userId: customer.insertedId,
      items: orderItems,
      subtotal: subtotal,
      shippingCost: shippingCost,
      total: total,
      status: 'pending',
      paymentMethod: 'bank_transfer',
      shippingAddress: {
        name: 'Budi Santoso',
        phone: '081234567890',
        address: 'Jl. Merdeka No. 45',
        city: 'Jakarta Pusat',
        postalCode: '10110',
        province: 'DKI Jakarta'
      },
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log('✅ Order created:', order.insertedId);
    console.log('   Order Code:', 'ORD-2026-' + Date.now().toString().slice(-6));
    console.log('   Total:', total.toLocaleString('id-ID'));

    // 5. Simulate Payment Proof Upload
    console.log('\n5️⃣ Uploading payment proof...');
    await mongoose.connection.db.collection('orders').updateOne(
      { _id: order.insertedId },
      {
        $set: {
          paymentProof: '/uploads/payment-proof-' + Date.now() + '.jpg',
          paymentProofUploadedAt: new Date(),
          updatedAt: new Date()
        }
      }
    );
    console.log('✅ Payment proof uploaded');

    // 6. Admin Confirms Payment
    console.log('\n6️⃣ Admin confirming payment...');
    await mongoose.connection.db.collection('orders').updateOne(
      { _id: order.insertedId },
      {
        $set: {
          status: 'confirmed',
          confirmedAt: new Date(),
          updatedAt: new Date()
        }
      }
    );
    console.log('✅ Payment confirmed by admin');

    // 7. Admin Processes Order
    console.log('\n7️⃣ Processing order...');
    await mongoose.connection.db.collection('orders').updateOne(
      { _id: order.insertedId },
      {
        $set: {
          status: 'processing',
          processedAt: new Date(),
          updatedAt: new Date()
        }
      }
    );
    console.log('✅ Order being processed');

    // 8. Admin Ships Order
    console.log('\n8️⃣ Shipping order...');
    const trackingNumber = 'JNE' + Date.now().toString().slice(-8);
    await mongoose.connection.db.collection('orders').updateOne(
      { _id: order.insertedId },
      {
        $set: {
          status: 'shipped',
          trackingNumber: trackingNumber,
          courier: 'JNE',
          shippedAt: new Date(),
          updatedAt: new Date()
        }
      }
    );
    console.log('✅ Order shipped with tracking:', trackingNumber);

    // 9. Customer Receives Order
    console.log('\n9️⃣ Order delivered...');
    await mongoose.connection.db.collection('orders').updateOne(
      { _id: order.insertedId },
      {
        $set: {
          status: 'delivered',
          deliveredAt: new Date(),
          updatedAt: new Date()
        }
      }
    );
    console.log('✅ Order delivered successfully');

    // 10. Create Sales Transaction Record for Reports
    console.log('\n🔟 Recording sales transaction...');
    const salesTransaction = await mongoose.connection.db.collection('salestransactions').insertOne({
      orderId: order.insertedId,
      orderCode: 'ORD-2026-' + Date.now().toString().slice(-6),
      customerId: customer.insertedId,
      customerName: 'Budi Santoso',
      items: orderItems.map(item => ({
        productId: item.productId,
        productName: item.nameSnapshot,
        qty: item.qty,
        price: item.priceSnapshot,
        subtotal: item.subtotal
      })),
      subtotal: subtotal,
      shippingCost: shippingCost,
      total: total,
      paymentMethod: 'bank_transfer',
      transactionDate: new Date(),
      status: 'completed',
      createdAt: new Date()
    });
    console.log('✅ Sales transaction recorded for reports');

    // 11. Update Product Stock
    console.log('\n1️⃣1️⃣ Updating product stock...');
    for (const item of orderItems) {
      await mongoose.connection.db.collection('products').updateOne(
        { _id: item.productId },
        { 
          $inc: { stock: -item.qty },
          $set: { updatedAt: new Date() }
        }
      );
    }
    console.log('✅ Product stock updated');

    // 12. Clear Customer Cart
    console.log('\n1️⃣2️⃣ Clearing customer cart...');
    await mongoose.connection.db.collection('carts').deleteOne({ userId: customer.insertedId });
    console.log('✅ Cart cleared');

    console.log('\n🎉 COMPLETE E-COMMERCE TRANSACTION TEST SUCCESSFUL!');
    console.log('\n📊 SUMMARY:');
    console.log('👤 Customer: Budi Santoso (customer@test.com)');
    console.log('🛒 Items: 2 products');
    console.log('💰 Total: Rp', total.toLocaleString('id-ID'));
    console.log('📦 Status: Delivered');
    console.log('📈 Recorded in sales reports');
    console.log('\n🔑 LOGIN CREDENTIALS:');
    console.log('Customer: customer@test.com / customer123');
    console.log('Admin: admin@test.com / 123456');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createCompleteTestData();
