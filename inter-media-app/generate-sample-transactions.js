const mongoose = require('mongoose');

// Sample data generator for testing date filters
async function generateSampleTransactions() {
  try {
    // Connect to your MongoDB (update connection string as needed)
    await mongoose.connect(process.env.MONGODB_URI);
    
    const db = mongoose.connection.db;
    
    // Generate sample POS transactions for the last 30 days
    const posTransactions = [];
    const today = new Date();
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Generate 1-3 transactions per day
      const transactionsPerDay = Math.floor(Math.random() * 3) + 1;
      
      for (let j = 0; j < transactionsPerDay; j++) {
        const transaction = {
          transactionCode: `POS-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}-${j + 1}`,
          cashierName: 'Admin',
          customerName: `Customer ${i}-${j}`,
          total: Math.floor(Math.random() * 500000) + 50000, // 50k - 550k
          items: [
            {
              nameSnapshot: 'Sample Product',
              qty: Math.floor(Math.random() * 3) + 1,
              price: Math.floor(Math.random() * 200000) + 25000
            }
          ],
          createdAt: new Date(date.getTime() + (j * 3600000)), // Spread throughout the day
          updatedAt: new Date()
        };
        posTransactions.push(transaction);
      }
    }
    
    // Generate sample online orders
    const onlineOrders = [];
    
    for (let i = 0; i < 20; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - Math.floor(Math.random() * 30));
      
      const order = {
        orderNumber: `ORD-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}-${i + 1}`,
        customerName: `Online Customer ${i}`,
        status: ['pending', 'processing', 'shipped', 'delivered'][Math.floor(Math.random() * 4)],
        total: Math.floor(Math.random() * 1000000) + 100000, // 100k - 1.1M
        totalAmount: Math.floor(Math.random() * 1000000) + 100000,
        items: [
          {
            nameSnapshot: 'Online Product',
            quantity: Math.floor(Math.random() * 2) + 1,
            price: Math.floor(Math.random() * 500000) + 50000
          }
        ],
        createdAt: date,
        updatedAt: new Date()
      };
      onlineOrders.push(order);
    }
    
    // Insert sample data
    console.log('Inserting sample POS transactions...');
    await db.collection('salestransactions').insertMany(posTransactions);
    
    console.log('Inserting sample online orders...');
    await db.collection('orders').insertMany(onlineOrders);
    
    console.log(`✅ Generated ${posTransactions.length} POS transactions and ${onlineOrders.length} online orders`);
    console.log('📅 Date range: Last 30 days');
    console.log('🔍 You can now test the date filter in admin reports');
    
    mongoose.disconnect();
  } catch (error) {
    console.error('Error generating sample data:', error);
  }
}

generateSampleTransactions();
