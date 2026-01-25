const mongoose = require('mongoose');

async function checkTransactionData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/inter-media');
    
    const db = mongoose.connection.db;
    
    // Check POS transactions
    const posCount = await db.collection('salestransactions').countDocuments();
    const posRecent = await db.collection('salestransactions').find().sort({ createdAt: -1 }).limit(3).toArray();
    
    // Check Online orders
    const orderCount = await db.collection('orders').countDocuments();
    const orderRecent = await db.collection('orders').find().sort({ createdAt: -1 }).limit(3).toArray();
    
    console.log('=== TRANSACTION DATA CHECK ===');
    console.log(`POS Transactions: ${posCount} records`);
    console.log('Recent POS transactions:');
    posRecent.forEach(txn => {
      console.log(`- ${txn.transactionCode || txn._id}: Rp ${txn.total} (${new Date(txn.createdAt).toLocaleDateString()})`);
    });
    
    console.log(`\nOnline Orders: ${orderCount} records`);
    console.log('Recent online orders:');
    orderRecent.forEach(order => {
      console.log(`- ${order.orderNumber || order._id}: Rp ${order.total || order.totalAmount} (${new Date(order.createdAt).toLocaleDateString()})`);
    });
    
    // Check date range of existing data
    if (posCount > 0) {
      const posDateRange = await db.collection('salestransactions').aggregate([
        { $group: { _id: null, minDate: { $min: '$createdAt' }, maxDate: { $max: '$createdAt' } } }
      ]).toArray();
      console.log('\nPOS Date Range:', posDateRange[0]);
    }
    
    if (orderCount > 0) {
      const orderDateRange = await db.collection('orders').aggregate([
        { $group: { _id: null, minDate: { $min: '$createdAt' }, maxDate: { $max: '$createdAt' } } }
      ]).toArray();
      console.log('Orders Date Range:', orderDateRange[0]);
    }
    
    mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkTransactionData();
