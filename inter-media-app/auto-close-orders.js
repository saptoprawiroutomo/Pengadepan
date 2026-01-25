const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/inter-media-app');

async function autoCloseOrders() {
  try {
    await new Promise((resolve) => {
      mongoose.connection.once('open', resolve);
    });

    console.log('🔄 Checking orders for auto-close...');

    // Find orders delivered more than 3 days ago
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const ordersToClose = await mongoose.connection.db.collection('orders')
      .find({
        status: 'delivered',
        deliveredAt: { $lt: threeDaysAgo }
      })
      .toArray();

    console.log(`Found ${ordersToClose.length} orders to auto-close`);

    if (ordersToClose.length > 0) {
      // Update orders to completed
      const result = await mongoose.connection.db.collection('orders').updateMany(
        {
          status: 'delivered',
          deliveredAt: { $lt: threeDaysAgo }
        },
        {
          $set: {
            status: 'completed',
            completedAt: new Date(),
            autoCompleted: true,
            updatedAt: new Date()
          }
        }
      );

      console.log(`✅ Auto-closed ${result.modifiedCount} orders`);

      // Log the auto-closed orders
      ordersToClose.forEach(order => {
        console.log(`  - ${order.orderCode} (delivered: ${order.deliveredAt})`);
      });
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

autoCloseOrders();
