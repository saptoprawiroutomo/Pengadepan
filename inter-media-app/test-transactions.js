const mongoose = require('mongoose');

async function testTransactions() {
  try {
    console.log('🔄 Testing 10 transactions...');

    await mongoose.connect('mongodb+srv://saptoprawiroutomo_db_user:1234qwer@cluster0.z3wyzso.mongodb.net/intermediadb?retryWrites=true&w=majority&appName=Cluster0');
    console.log('✅ Connected to database');

    const db = mongoose.connection.db;

    // Get products for testing
    const products = await db.collection('products').find({ isActive: true }).limit(20).toArray();
    console.log(`📦 Found ${products.length} products for testing`);

    // Test transactions data
    const testTransactions = [
      {
        customerName: 'Budi Santoso',
        email: 'budi@email.com',
        phone: '081234567890',
        products: [
          { product: products[0], qty: 2 },
          { product: products[1], qty: 1 }
        ]
      },
      {
        customerName: 'Siti Aminah',
        email: 'siti@email.com', 
        phone: '081234567891',
        products: [
          { product: products[2], qty: 1 },
          { product: products[3], qty: 2 }
        ]
      },
      {
        customerName: 'Ahmad Rahman',
        email: 'ahmad@email.com',
        phone: '081234567892',
        products: [
          { product: products[4], qty: 2 }
        ]
      },
      {
        customerName: 'Maya Dewi',
        email: 'maya@email.com',
        phone: '081234567893',
        products: [
          { product: products[5], qty: 1 },
          { product: products[6], qty: 1 },
          { product: products[7], qty: 1 }
        ]
      },
      {
        customerName: 'Rudi Hartono',
        email: 'rudi@email.com',
        phone: '081234567894',
        products: [
          { product: products[8], qty: 2 },
          { product: products[9], qty: 1 }
        ]
      },
      {
        customerName: 'Lina Sari',
        email: 'lina@email.com',
        phone: '081234567895',
        products: [
          { product: products[10], qty: 1 }
        ]
      },
      {
        customerName: 'Eko Prasetyo',
        email: 'eko@email.com',
        phone: '081234567896',
        products: [
          { product: products[11], qty: 2 },
          { product: products[12], qty: 2 }
        ]
      },
      {
        customerName: 'Dewi Kartika',
        email: 'dewi@email.com',
        phone: '081234567897',
        products: [
          { product: products[13], qty: 1 },
          { product: products[14], qty: 1 }
        ]
      },
      {
        customerName: 'Agus Setiawan',
        email: 'agus@email.com',
        phone: '081234567898',
        products: [
          { product: products[15], qty: 2 }
        ]
      },
      {
        customerName: 'Rina Wati',
        email: 'rina@email.com',
        phone: '081234567899',
        products: [
          { product: products[16], qty: 1 },
          { product: products[17], qty: 1 },
          { product: products[18], qty: 1 }
        ]
      }
    ];

    console.log('\n🛒 Creating test transactions...\n');

    let totalRevenue = 0;
    const results = [];

    for (let i = 0; i < testTransactions.length; i++) {
      const testTxn = testTransactions[i];
      
      // Calculate transaction total
      let transactionTotal = 0;
      const items = testTxn.products.map(item => {
        const subtotal = item.product.price * item.qty;
        transactionTotal += subtotal;
        return {
          nameSnapshot: item.product.name,
          qty: item.qty,
          price: item.product.price,
          subtotal: subtotal
        };
      });

      // Create POS transaction
      const posTransaction = {
        transactionCode: `POS-TEST-${String(i + 1).padStart(3, '0')}`,
        cashierName: 'Kasir Test',
        customerName: testTxn.customerName,
        customerEmail: testTxn.email,
        customerPhone: testTxn.phone,
        items: items,
        total: transactionTotal,
        paymentMethod: Math.random() > 0.5 ? 'cash' : 'debit',
        createdAt: new Date()
      };

      // Insert to database
      await db.collection('salestransactions').insertOne(posTransaction);
      
      totalRevenue += transactionTotal;
      
      // Store result
      results.push({
        no: i + 1,
        customer: testTxn.customerName,
        items: items.length,
        total: transactionTotal,
        products: items.map(item => `${item.nameSnapshot} (${item.qty}x)`).join(', ')
      });

      console.log(`✅ Transaction ${i + 1}: ${testTxn.customerName} - Rp ${transactionTotal.toLocaleString('id-ID')}`);
    }

    console.log('\n📊 TRANSACTION TEST RESULTS:');
    console.log('═'.repeat(80));
    
    results.forEach(result => {
      console.log(`${result.no}. ${result.customer}`);
      console.log(`   Items: ${result.items} | Total: Rp ${result.total.toLocaleString('id-ID')}`);
      console.log(`   Products: ${result.products}`);
      console.log('');
    });

    console.log('═'.repeat(80));
    console.log(`💰 TOTAL REVENUE: Rp ${totalRevenue.toLocaleString('id-ID')}`);
    console.log(`📈 AVERAGE PER TRANSACTION: Rp ${Math.round(totalRevenue / testTransactions.length).toLocaleString('id-ID')}`);
    console.log(`🛍️ TOTAL TRANSACTIONS: ${testTransactions.length}`);
    
    // Check database totals
    const dbTotal = await db.collection('salestransactions').countDocuments();
    const dbRevenue = await db.collection('salestransactions').aggregate([
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]).toArray();
    
    console.log('\n📊 DATABASE VERIFICATION:');
    console.log(`🗄️ Total transactions in DB: ${dbTotal}`);
    console.log(`💵 Total revenue in DB: Rp ${(dbRevenue[0]?.total || 0).toLocaleString('id-ID')}`);
    
    console.log('\n🌐 Access reports at: /admin/reports');
    console.log('🎯 Test completed successfully!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testTransactions();
