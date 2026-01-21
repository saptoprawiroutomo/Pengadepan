// Create multiple transactions continuously
async function createMultipleTransactions() {
  console.log('🚀 CREATING MULTIPLE TRANSACTIONS CONTINUOUSLY');
  console.log('==============================================');
  
  const cities = ['Jakarta Pusat', 'Jakarta Selatan', 'Bogor', 'Depok', 'Tangerang', 'Bekasi'];
  const customers = [
    'Doni Pratama', 'Sari Dewi', 'Budi Santoso', 'Rina Wati', 'Agus Setiawan',
    'Maya Sari', 'Andi Wijaya', 'Lisa Permata', 'Rudi Hartono', 'Nina Kusuma'
  ];
  
  let transactionCount = 0;
  
  while (true) {
    try {
      transactionCount++;
      console.log(`\n🛒 CREATING TRANSACTION #${transactionCount}`);
      console.log('=====================================');
      
      // Get products
      const productsResponse = await fetch('https://inter-media-apps.vercel.app/api/products');
      const productsData = await productsResponse.json();
      
      // Random product
      const productIndex = Math.floor(Math.random() * productsData.products.length);
      const product = productsData.products[productIndex];
      
      // Random city and customer
      const city = cities[Math.floor(Math.random() * cities.length)];
      const customer = customers[Math.floor(Math.random() * customers.length)];
      
      console.log(`👤 Customer: ${customer}`);
      console.log(`📍 City: ${city}`);
      console.log(`📦 Product: ${product.name}`);
      console.log(`💰 Price: Rp ${product.price.toLocaleString()}`);
      
      // Calculate shipping
      const shippingResponse = await fetch('https://inter-media-apps.vercel.app/api/shipping/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          totalWeight: product.weight || 1000,
          destination: city
        })
      });
      
      const shippingData = await shippingResponse.json();
      
      if (!shippingData.shippingOptions || shippingData.shippingOptions.length === 0) {
        console.log('❌ No shipping options, skipping...');
        continue;
      }
      
      // Random shipping option
      const shippingIndex = Math.floor(Math.random() * shippingData.shippingOptions.length);
      const shipping = shippingData.shippingOptions[shippingIndex];
      
      console.log(`🚚 Shipping: ${shipping.courier} - Rp ${shipping.cost.toLocaleString()}`);
      
      const total = product.price + shipping.cost;
      console.log(`💰 Total: Rp ${total.toLocaleString()}`);
      
      // Create via seed
      const seedResponse = await fetch('https://inter-media-apps.vercel.app/api/seed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'sample-orders' })
      });
      
      if (seedResponse.ok) {
        console.log(`✅ Transaction #${transactionCount} created successfully!`);
      } else {
        console.log(`❌ Transaction #${transactionCount} failed`);
      }
      
      // Wait 2 seconds between transactions
      console.log('⏳ Waiting 2 seconds...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      console.error(`❌ Error in transaction #${transactionCount}:`, error.message);
      // Continue with next transaction
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
}

createMultipleTransactions();
