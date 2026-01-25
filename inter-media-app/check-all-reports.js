const mongoose = require('mongoose');

async function checkAllReports() {
  try {
    console.log('📊 Checking all reports data...\n');

    await mongoose.connect('mongodb+srv://saptoprawiroutomo_db_user:1234qwer@cluster0.z3wyzso.mongodb.net/intermediadb?retryWrites=true&w=majority&appName=Cluster0');

    const db = mongoose.connection.db;

    // 1. SALES REPORT (POS + Online)
    console.log('🛒 SALES REPORT:');
    console.log('═'.repeat(50));
    
    const posTransactions = await db.collection('salestransactions').find({}).toArray();
    const onlineOrders = await db.collection('orders').find({}).toArray();
    
    const posRevenue = posTransactions.reduce((sum, txn) => sum + (txn.total || 0), 0);
    const onlineRevenue = onlineOrders.reduce((sum, order) => sum + (order.total || 0), 0);
    
    console.log(`📟 POS Transactions: ${posTransactions.length}`);
    console.log(`💰 POS Revenue: Rp ${posRevenue.toLocaleString('id-ID')}`);
    console.log(`🌐 Online Orders: ${onlineOrders.length}`);
    console.log(`💰 Online Revenue: Rp ${onlineRevenue.toLocaleString('id-ID')}`);
    console.log(`📈 TOTAL Revenue: Rp ${(posRevenue + onlineRevenue).toLocaleString('id-ID')}`);
    console.log(`📊 TOTAL Transactions: ${posTransactions.length + onlineOrders.length}`);

    // Show recent POS transactions
    console.log('\n📟 Recent POS Transactions:');
    posTransactions.slice(-5).forEach((txn, i) => {
      console.log(`${i+1}. ${txn.transactionCode} - ${txn.customerName} - Rp ${txn.total.toLocaleString('id-ID')}`);
    });

    // Show online orders
    console.log('\n🌐 Online Orders:');
    onlineOrders.forEach((order, i) => {
      console.log(`${i+1}. ${order.orderNumber || order.orderCode} - ${order.customerInfo?.name} - Rp ${order.total.toLocaleString('id-ID')}`);
    });

    // 2. STOCK REPORT
    console.log('\n\n📦 STOCK REPORT:');
    console.log('═'.repeat(50));
    
    const products = await db.collection('products').aggregate([
      {
        $lookup: {
          from: 'categories',
          localField: 'categoryId',
          foreignField: '_id',
          as: 'category'
        }
      },
      {
        $addFields: {
          categoryName: { $arrayElemAt: ['$category.name', 0] }
        }
      }
    ]).toArray();

    const totalProducts = products.length;
    const totalStock = products.reduce((sum, p) => sum + (p.stock || 0), 0);
    const outOfStock = products.filter(p => (p.stock || 0) === 0).length;
    const lowStock = products.filter(p => (p.stock || 0) > 0 && (p.stock || 0) <= 10).length;

    console.log(`📦 Total Products: ${totalProducts}`);
    console.log(`📊 Total Stock: ${totalStock}`);
    console.log(`❌ Out of Stock: ${outOfStock}`);
    console.log(`⚠️  Low Stock: ${lowStock}`);
    console.log(`✅ Available: ${totalProducts - outOfStock - lowStock}`);

    // Show stock status by category
    const categoryStock = {};
    products.forEach(p => {
      const cat = p.categoryName || 'Unknown';
      if (!categoryStock[cat]) {
        categoryStock[cat] = { total: 0, stock: 0 };
      }
      categoryStock[cat].total++;
      categoryStock[cat].stock += p.stock || 0;
    });

    console.log('\n📊 Stock by Category:');
    Object.entries(categoryStock).forEach(([cat, data]) => {
      console.log(`${cat}: ${data.total} products, ${data.stock} total stock`);
    });

    // 3. SERVICES REPORT
    console.log('\n\n🔧 SERVICES REPORT:');
    console.log('═'.repeat(50));
    
    const services = await db.collection('servicerequests').find({}).toArray();
    const totalServices = services.length;
    const totalServiceRevenue = services.reduce((sum, s) => sum + (s.totalCost || 0), 0);
    
    console.log(`🔧 Total Services: ${totalServices}`);
    console.log(`💰 Service Revenue: Rp ${totalServiceRevenue.toLocaleString('id-ID')}`);
    
    if (services.length > 0) {
      const statusGroups = services.reduce((acc, s) => {
        const status = s.status || 'pending';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});
      
      console.log('\n📊 Services by Status:');
      Object.entries(statusGroups).forEach(([status, count]) => {
        console.log(`${status}: ${count}`);
      });

      console.log('\n🔧 Recent Services:');
      services.slice(-3).forEach((service, i) => {
        console.log(`${i+1}. ${service.serviceCode} - ${service.deviceType} - ${service.status} - Rp ${(service.totalCost || 0).toLocaleString('id-ID')}`);
      });
    }

    // 4. TOP PRODUCTS REPORT
    console.log('\n\n🏆 TOP PRODUCTS REPORT:');
    console.log('═'.repeat(50));
    
    // Aggregate from POS transactions
    const posProductSales = {};
    posTransactions.forEach(txn => {
      txn.items?.forEach(item => {
        const productName = item.nameSnapshot;
        if (!posProductSales[productName]) {
          posProductSales[productName] = { sold: 0, revenue: 0 };
        }
        posProductSales[productName].sold += item.qty || 0;
        posProductSales[productName].revenue += (item.qty || 0) * (item.price || 0);
      });
    });

    // Aggregate from Online orders
    const onlineProductSales = {};
    onlineOrders.forEach(order => {
      order.items?.forEach(item => {
        const productName = item.nameSnapshot;
        if (!onlineProductSales[productName]) {
          onlineProductSales[productName] = { sold: 0, revenue: 0 };
        }
        onlineProductSales[productName].sold += item.quantity || 0;
        onlineProductSales[productName].revenue += (item.quantity || 0) * (item.price || 0);
      });
    });

    // Combine POS and Online
    const allProductSales = {};
    Object.entries(posProductSales).forEach(([product, data]) => {
      allProductSales[product] = { ...data, source: 'POS' };
    });
    Object.entries(onlineProductSales).forEach(([product, data]) => {
      if (allProductSales[product]) {
        allProductSales[product].sold += data.sold;
        allProductSales[product].revenue += data.revenue;
        allProductSales[product].source = 'Both';
      } else {
        allProductSales[product] = { ...data, source: 'Online' };
      }
    });

    // Sort by quantity sold
    const topProducts = Object.entries(allProductSales)
      .sort(([,a], [,b]) => b.sold - a.sold)
      .slice(0, 10);

    console.log('🏆 Top 10 Products:');
    topProducts.forEach(([product, data], i) => {
      console.log(`${i+1}. ${product}`);
      console.log(`   Sold: ${data.sold} | Revenue: Rp ${data.revenue.toLocaleString('id-ID')} | Source: ${data.source}`);
    });

    // 5. SUMMARY
    console.log('\n\n📈 OVERALL SUMMARY:');
    console.log('═'.repeat(50));
    console.log(`💰 Total Business Revenue: Rp ${(posRevenue + onlineRevenue + totalServiceRevenue).toLocaleString('id-ID')}`);
    console.log(`🛒 Sales Revenue: Rp ${(posRevenue + onlineRevenue).toLocaleString('id-ID')}`);
    console.log(`🔧 Service Revenue: Rp ${totalServiceRevenue.toLocaleString('id-ID')}`);
    console.log(`📊 Total Transactions: ${posTransactions.length + onlineOrders.length + totalServices}`);
    console.log(`📦 Products in Catalog: ${totalProducts}`);
    console.log(`📊 Total Stock Units: ${totalStock}`);

    console.log('\n🌐 All data is ready for reports at: /admin/reports');
    console.log('✅ All reports are populated with test data!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkAllReports();
