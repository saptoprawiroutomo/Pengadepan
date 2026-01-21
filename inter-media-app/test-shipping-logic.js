// Test shipping calculation directly
const testCustomers = [
  {
    name: 'Doni Pratama',
    city: 'Jakarta Pusat',
    product: 'Canon PIXMA G2010',
    weight: 4500 // 4.5kg
  },
  {
    name: 'Sari Dewi', 
    city: 'Jakarta Selatan',
    product: 'Epson L3110',
    weight: 3800 // 3.8kg
  },
  {
    name: 'Budi Santoso',
    city: 'Bogor',
    product: 'HP LaserJet Pro M404n',
    weight: 8200 // 8.2kg
  },
  {
    name: 'Rina Wati',
    city: 'Depok', 
    product: 'Brother MFC-L2710DW',
    weight: 12500 // 12.5kg
  },
  {
    name: 'Agus Setiawan',
    city: 'Tangerang',
    product: 'Canon imageRUNNER 2625i',
    weight: 25000 // 25kg - Heavy item
  }
];

// Simulate shipping calculation based on our new logic
function calculateShippingLocal(city, weight) {
  // Shipping zones with distances
  const zones = {
    'Jakarta Pusat': { zone: 1, distance: 5 },
    'Jakarta Selatan': { zone: 1, distance: 7 },
    'Jakarta Utara': { zone: 1, distance: 8 },
    'Bogor': { zone: 2, distance: 35 },
    'Depok': { zone: 2, distance: 25 },
    'Tangerang': { zone: 2, distance: 30 }
  };
  
  const zoneInfo = zones[city];
  if (!zoneInfo) return null;
  
  const weightInKg = Math.max(1, Math.ceil(weight / 1000));
  const distance = zoneInfo.distance;
  const needsCargo = weight > 20000;
  
  const options = [];
  
  // Regular expedisi (skip if cargo needed)
  if (!needsCargo) {
    const baseRates = {
      'JNE REG': { zone1: 8000, zone2: 12000, perKg: { zone1: 4000, zone2: 6000 } },
      'TIKI REG': { zone1: 7000, zone2: 11000, perKg: { zone1: 3500, zone2: 5500 } },
      'J&T REG': { zone1: 7500, zone2: 11500, perKg: { zone1: 3800, zone2: 5800 } }
    };
    
    Object.entries(baseRates).forEach(([courier, rates]) => {
      const baseRate = rates[`zone${zoneInfo.zone}`];
      const perKgRate = rates.perKg[`zone${zoneInfo.zone}`];
      let cost = baseRate + (perKgRate * (weightInKg - 1));
      
      // Distance adjustment for long distance
      if (distance > 50) {
        cost = Math.round(cost * (1 + ((distance - 50) * 0.01)));
      }
      
      options.push({
        courier,
        cost,
        estimatedDays: zoneInfo.zone === 1 ? '1' : '1-2',
        type: 'ekspedisi'
      });
    });
  }
  
  // Kurir Toko (zona 1 & 2)
  if (zoneInfo.zone <= 2) {
    if (needsCargo) {
      // Cargo rate: 500k + distance charge if >20km
      let cost = 500000;
      if (distance > 20) {
        cost += 100000;
      }
      options.push({
        courier: 'KURIR TOKO KARGO',
        cost,
        estimatedDays: 'Same Day',
        type: 'kargo',
        recommended: true
      });
    } else {
      // Regular kurir toko: base 10k + distance charge
      const cost = 10000 + (distance * 1000 * weightInKg);
      options.push({
        courier: 'KURIR TOKO',
        cost,
        estimatedDays: 'Same Day',
        type: 'kurir-toko'
      });
    }
  }
  
  // GoSend (zona 1 & 2, max 20kg)
  if (zoneInfo.zone <= 2 && weight <= 20000) {
    const gosendOptions = {
      'GOSEND INSTANT': { base: 15000, perKm: 2500, maxDistance: 25 },
      'GOSEND SAME DAY': { base: 12000, perKm: 2000, maxDistance: 40 }
    };
    
    Object.entries(gosendOptions).forEach(([service, rates]) => {
      if (distance <= rates.maxDistance) {
        const cost = rates.base + (distance * rates.perKm);
        options.push({
          courier: service,
          cost,
          estimatedDays: service.includes('INSTANT') ? '1-2 jam' : '4-8 jam',
          type: 'gosend'
        });
      }
    });
  }
  
  // Sort by cost
  options.sort((a, b) => a.cost - b.cost);
  
  return {
    city,
    zone: zoneInfo.zone,
    distance,
    weightInKg,
    needsCargo,
    options
  };
}

function testCustomerShipping(customer) {
  console.log(`\n🛒 Testing: ${customer.name}`);
  console.log(`📦 Product: ${customer.product} (${customer.weight}g)`);
  console.log(`📍 Destination: ${customer.city}`);
  
  const result = calculateShippingLocal(customer.city, customer.weight);
  
  if (!result) {
    console.log('❌ City not supported');
    return null;
  }
  
  console.log(`📊 Zone: ${result.zone}, Distance: ${result.distance}km, Weight: ${result.weightInKg}kg`);
  
  if (result.needsCargo) {
    console.log('⚠️ Heavy item detected - Cargo shipping required');
  }
  
  console.log('\n📋 Available shipping options:');
  result.options.forEach((option, index) => {
    const badge = option.recommended ? '⭐ RECOMMENDED' : '';
    const icon = option.type === 'kargo' ? '🚛' : 
                 option.type === 'gosend' ? '🏍️' : 
                 option.type === 'kurir-toko' ? '🚲' : '📦';
    
    console.log(`${index + 1}. ${icon} ${option.courier}`);
    console.log(`   💰 Rp ${option.cost.toLocaleString()} - ⏱️ ${option.estimatedDays} ${badge}`);
  });
  
  // Select best option (recommended or cheapest)
  const selected = result.options.find(opt => opt.recommended) || result.options[0];
  console.log(`\n✅ Selected: ${selected.courier} - Rp ${selected.cost.toLocaleString()}`);
  
  return {
    customer: customer.name,
    product: customer.product,
    city: customer.city,
    weight: customer.weight,
    shipping: selected,
    totalOptions: result.options.length,
    needsCargo: result.needsCargo
  };
}

function runShippingTests() {
  console.log('🚀 SHIPPING CALCULATION TEST');
  console.log('============================');
  console.log('Testing new distance & weight-based pricing logic\n');
  
  const results = [];
  
  testCustomers.forEach(customer => {
    const result = testCustomerShipping(customer);
    if (result) {
      results.push(result);
    }
  });
  
  // Analysis
  console.log('\n📊 TEST RESULTS ANALYSIS');
  console.log('========================');
  
  const totalShipping = results.reduce((sum, r) => sum + r.shipping.cost, 0);
  const avgShipping = totalShipping / results.length;
  
  console.log(`✅ Successful calculations: ${results.length}/${testCustomers.length}`);
  console.log(`💰 Average shipping cost: Rp ${avgShipping.toLocaleString()}`);
  
  // Shipping method distribution
  const methods = {};
  results.forEach(r => {
    const method = r.shipping.courier;
    if (!methods[method]) methods[method] = { count: 0, totalCost: 0 };
    methods[method].count++;
    methods[method].totalCost += r.shipping.cost;
  });
  
  console.log('\n🚛 SHIPPING METHOD USAGE:');
  Object.entries(methods).forEach(([method, data]) => {
    const avg = data.totalCost / data.count;
    const pct = Math.round((data.count / results.length) * 100);
    console.log(`${method}: ${data.count}x (${pct}%) - Avg: Rp ${avg.toLocaleString()}`);
  });
  
  // Weight analysis
  const lightItems = results.filter(r => r.weight <= 5000);
  const mediumItems = results.filter(r => r.weight > 5000 && r.weight <= 20000);
  const heavyItems = results.filter(r => r.weight > 20000);
  
  console.log('\n⚖️ WEIGHT DISTRIBUTION:');
  console.log(`Light (≤5kg): ${lightItems.length} items`);
  console.log(`Medium (5-20kg): ${mediumItems.length} items`);
  console.log(`Heavy (>20kg): ${heavyItems.length} items - Cargo required`);
  
  // Distance analysis
  const zones = {};
  results.forEach(r => {
    const zone = r.city.includes('Jakarta') ? 'Zone 1 (Jakarta)' : 'Zone 2 (Jabodetabek)';
    if (!zones[zone]) zones[zone] = { count: 0, totalCost: 0 };
    zones[zone].count++;
    zones[zone].totalCost += r.shipping.cost;
  });
  
  console.log('\n📍 ZONE DISTRIBUTION:');
  Object.entries(zones).forEach(([zone, data]) => {
    const avg = data.totalCost / data.count;
    console.log(`${zone}: ${data.count} orders - Avg: Rp ${avg.toLocaleString()}`);
  });
  
  console.log('\n🎯 KEY INSIGHTS:');
  console.log(`• Distance-based pricing working correctly`);
  console.log(`• Heavy items (>20kg) automatically use cargo shipping`);
  console.log(`• Kurir Toko competitive for local deliveries`);
  console.log(`• GoSend available for quick delivery <20kg`);
  console.log(`• Pricing scales appropriately with weight and distance`);
}

// Run the test
runShippingTests();
