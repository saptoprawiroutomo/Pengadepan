const mongoose = require('mongoose');

async function createSampleTransactions() {
  try {
    console.log('🔄 Creating sample transactions...');

    // Connect and wait for connection
    await mongoose.connect('mongodb+srv://saptoprawiroutomo_db_user:1234qwer@cluster0.z3wyzso.mongodb.net/intermediadb?retryWrites=true&w=majority&appName=Cluster0');
    console.log('✅ Connected to database');

    const db = mongoose.connection.db;

    // Sample POS Transactions
    const posTransactions = [
      {
        transactionCode: 'POS-001',
        cashierName: 'Kasir 1',
        customerName: 'Walk-in Customer',
        items: [
          { nameSnapshot: 'Printer Canon PIXMA G2010', qty: 1, price: 1850000 },
          { nameSnapshot: 'Tinta Canon GI-790 Black', qty: 2, price: 85000 }
        ],
        total: 2020000,
        paymentMethod: 'cash',
        createdAt: new Date('2024-01-20')
      },
      {
        transactionCode: 'POS-002',
        cashierName: 'Kasir 1',
        customerName: 'Budi Santoso',
        items: [
          { nameSnapshot: 'Kertas A4 80gsm', qty: 5, price: 45000 }
        ],
        total: 225000,
        paymentMethod: 'cash',
        createdAt: new Date('2024-01-21')
      },
      {
        transactionCode: 'POS-003',
        cashierName: 'Kasir 2',
        customerName: 'Walk-in Customer',
        items: [
          { nameSnapshot: 'Scanner Canon CanoScan LiDE 300', qty: 1, price: 850000 },
          { nameSnapshot: 'Kabel USB Printer', qty: 1, price: 25000 }
        ],
        total: 875000,
        paymentMethod: 'debit',
        createdAt: new Date('2024-01-22')
      }
    ];

    // Sample Online Orders
    const onlineOrders = [
      {
        orderNumber: 'ORD-001',
        orderCode: 'ORD-001',
        customerInfo: { name: 'Siti Aminah', email: 'siti@email.com', phone: '081234567890' },
        items: [
          { nameSnapshot: 'Laptop ASUS VivoBook 14', quantity: 1, price: 6500000 },
          { nameSnapshot: 'Mouse Gaming Logitech G502', quantity: 1, price: 650000 }
        ],
        total: 7150000,
        status: 'delivered',
        paymentMethod: 'transfer',
        shippingAddress: 'Jakarta Selatan',
        createdAt: new Date('2024-01-19')
      },
      {
        orderNumber: 'ORD-002',
        orderCode: 'ORD-002',
        customerInfo: { name: 'Ahmad Rahman', email: 'ahmad@email.com', phone: '081234567891' },
        items: [
          { nameSnapshot: 'Monitor LG 27" 4K', quantity: 1, price: 4500000 }
        ],
        total: 4500000,
        status: 'shipped',
        paymentMethod: 'transfer',
        shippingAddress: 'Bandung',
        createdAt: new Date('2024-01-20')
      },
      {
        orderNumber: 'ORD-003',
        orderCode: 'ORD-003',
        customerInfo: { name: 'Maya Sari', email: 'maya@email.com', phone: '081234567892' },
        items: [
          { nameSnapshot: 'SSD Samsung 970 EVO 500GB', quantity: 2, price: 850000 },
          { nameSnapshot: 'RAM DDR4 8GB 3200MHz', quantity: 1, price: 450000 }
        ],
        total: 2150000,
        status: 'processing',
        paymentMethod: 'transfer',
        shippingAddress: 'Surabaya',
        createdAt: new Date('2024-01-21')
      }
    ];

    // Clear existing data first
    await db.collection('salestransactions').deleteMany({});
    await db.collection('orders').deleteMany({});
    console.log('✅ Cleared existing data');

    // Insert POS transactions
    await db.collection('salestransactions').insertMany(posTransactions);
    console.log('✅ Created', posTransactions.length, 'POS transactions');

    // Insert Online orders
    await db.collection('orders').insertMany(onlineOrders);
    console.log('✅ Created', onlineOrders.length, 'Online orders');

    // Summary
    const posTotal = posTransactions.reduce((sum, txn) => sum + txn.total, 0);
    const onlineTotal = onlineOrders.reduce((sum, order) => sum + order.total, 0);
    
    console.log('\n📊 Sample Data Summary:');
    console.log(`💰 POS Revenue: Rp ${posTotal.toLocaleString('id-ID')}`);
    console.log(`🌐 Online Revenue: Rp ${onlineTotal.toLocaleString('id-ID')}`);
    console.log(`📈 Total Revenue: Rp ${(posTotal + onlineTotal).toLocaleString('id-ID')}`);
    console.log('\n🌐 Access reports at: /admin/reports');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createSampleTransactions();
