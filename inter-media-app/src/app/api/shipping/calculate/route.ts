import { NextRequest, NextResponse } from 'next/server';

// Data kota/kabupaten dengan zona ongkir dan estimasi jarak
const SHIPPING_ZONES = {
  // Zona 1: Dalam kota (terdekat)
  'jakarta-pusat': { zone: 1, name: 'Jakarta Pusat', distance: 5 },
  'jakarta-utara': { zone: 1, name: 'Jakarta Utara', distance: 8 },
  'jakarta-selatan': { zone: 1, name: 'Jakarta Selatan', distance: 7 },
  'jakarta-barat': { zone: 1, name: 'Jakarta Barat', distance: 6 },
  'jakarta-timur': { zone: 1, name: 'Jakarta Timur', distance: 9 },
  
  // Zona 2: Jabodetabek
  'bogor': { zone: 2, name: 'Bogor', distance: 35 },
  'depok': { zone: 2, name: 'Depok', distance: 25 },
  'tangerang': { zone: 2, name: 'Tangerang', distance: 30 },
  'bekasi': { zone: 2, name: 'Bekasi', distance: 28 },
  
  // Zona 3: Jawa Barat
  'bandung': { zone: 3, name: 'Bandung', distance: 150 },
  'cirebon': { zone: 3, name: 'Cirebon', distance: 250 },
  'sukabumi': { zone: 3, name: 'Sukabumi', distance: 120 },
  
  // Zona 4: Pulau Jawa
  'surabaya': { zone: 4, name: 'Surabaya', distance: 800 },
  'yogyakarta': { zone: 4, name: 'Yogyakarta', distance: 560 },
  'semarang': { zone: 4, name: 'Semarang', distance: 450 },
  'malang': { zone: 4, name: 'Malang', distance: 850 },
  
  // Zona 5: Luar Jawa
  'medan': { zone: 5, name: 'Medan', distance: 1400 },
  'palembang': { zone: 5, name: 'Palembang', distance: 650 },
  'makassar': { zone: 5, name: 'Makassar', distance: 1500 },
  'balikpapan': { zone: 5, name: 'Balikpapan', distance: 1200 }
};

// Tarif ongkir per zona dan per kg
const SHIPPING_RATES = {
  'JNE REG': { 
    zone1: 8000, zone2: 12000, zone3: 15000, zone4: 20000, zone5: 30000,
    perKg: { zone1: 4000, zone2: 6000, zone3: 8000, zone4: 10000, zone5: 15000 },
    estimatedDays: { zone1: '1', zone2: '1-2', zone3: '2-3', zone4: '3-4', zone5: '4-6' }
  },
  'JNE YES': { 
    zone1: 15000, zone2: 20000, zone3: 25000, zone4: 35000, zone5: 50000,
    perKg: { zone1: 8000, zone2: 10000, zone3: 12000, zone4: 15000, zone5: 20000 },
    estimatedDays: { zone1: '1', zone2: '1', zone3: '1-2', zone4: '2-3', zone5: '3-4' }
  },
  'TIKI REG': { 
    zone1: 7000, zone2: 11000, zone3: 14000, zone4: 18000, zone5: 28000,
    perKg: { zone1: 3500, zone2: 5500, zone3: 7000, zone4: 9000, zone5: 14000 },
    estimatedDays: { zone1: '1-2', zone2: '2-3', zone3: '3-4', zone4: '4-5', zone5: '5-7' }
  },
  'POS REG': { 
    zone1: 6000, zone2: 9000, zone3: 12000, zone4: 16000, zone5: 25000,
    perKg: { zone1: 3000, zone2: 4500, zone3: 6000, zone4: 8000, zone5: 12000 },
    estimatedDays: { zone1: '2-3', zone2: '3-4', zone3: '4-5', zone4: '5-6', zone5: '6-8' }
  },
  'J&T REG': { 
    zone1: 7500, zone2: 11500, zone3: 14500, zone4: 19000, zone5: 29000,
    perKg: { zone1: 3800, zone2: 5800, zone3: 7300, zone4: 9500, zone5: 14500 },
    estimatedDays: { zone1: '1-2', zone2: '2-3', zone3: '3-4', zone4: '4-5', zone5: '5-7' }
  },
  'SiCepat REG': { 
    zone1: 7000, zone2: 11000, zone3: 14000, zone4: 18000, zone5: 28000,
    perKg: { zone1: 3500, zone2: 5500, zone3: 7000, zone4: 9000, zone5: 14000 },
    estimatedDays: { zone1: '1-2', zone2: '2-3', zone3: '3-4', zone4: '4-5', zone5: '5-7' }
  }
};

// Kurir toko dengan logika berat dan jarak baru
const STORE_COURIER_RATES = {
  'KURIR TOKO': {
    baseRate: 10000, // Base rate 1kg, 1km = 10rb
    perKmRate: 1000, // 10% dari base = 1rb per km
    cargoRate: 500000, // 500rb untuk >20kg
    cargoDistanceThreshold: 20, // km
    cargoDistanceRate: 100000, // +100rb jika >20km
    maxRegularWeight: 20000, // 20kg threshold
    estimatedDays: { zone1: 'Same Day', zone2: '1 hari' }
  }
};

// Fungsi untuk menghitung ongkir berdasarkan jarak dan berat
function calculateDistanceBasedShipping(baseRate: number, perKmRate: number, distance: number, weightInKg: number) {
  const distanceCharge = distance * perKmRate;
  const weightMultiplier = Math.max(1, weightInKg); // Minimum 1kg
  return Math.round(baseRate + (distanceCharge * weightMultiplier));
}

// Fungsi untuk menentukan apakah perlu kargo
function needsCargo(totalWeight: number) {
  return totalWeight > 20000; // >20kg
}

// Fungsi untuk menghitung kurir toko
function calculateStoreCourier(distance: number, totalWeight: number) {
  const rates = STORE_COURIER_RATES['KURIR TOKO'];
  
  if (needsCargo(totalWeight)) {
    // Kargo rate: 500rb + jarak charge jika >20km
    let cost = rates.cargoRate;
    if (distance > rates.cargoDistanceThreshold) {
      cost += rates.cargoDistanceRate;
    }
    return {
      cost,
      description: `Kurir Toko Kargo - ${Math.round(totalWeight/1000)}kg - ${distance}km`,
      type: 'kargo'
    };
  } else {
    // Regular rate: base + distance charge
    const weightInKg = Math.ceil(totalWeight / 1000);
    const cost = calculateDistanceBasedShipping(rates.baseRate, rates.perKmRate, distance, weightInKg);
    return {
      cost,
      description: `Kurir Toko - ${weightInKg}kg - ${distance}km`,
      type: 'kurir-toko'
    };
  }
}
// GoSend untuk Jabodetabek (zona 1 dan 2) dengan distance-based pricing
const GOSEND_RATES = {
  'GOSEND INSTANT': {
    baseRate: 15000, // Base rate
    perKmRate: 2500, // Per km charge
    maxWeight: 20000, // Max 20kg
    maxDistance: 25, // Max distance
    estimatedDays: { zone1: '1-2 jam', zone2: '2-4 jam' }
  },
  'GOSEND SAME DAY': {
    baseRate: 12000, // Base rate
    perKmRate: 2000, // Per km charge
    maxWeight: 20000, // Max 20kg
    maxDistance: 40, // Max distance
    estimatedDays: { zone1: '4-8 jam', zone2: '6-12 jam' }
  }
};

export async function POST(request: NextRequest) {
  try {
    const { totalWeight, destination } = await request.json();

    // Quick validation
    if (!totalWeight || totalWeight <= 0) {
      return NextResponse.json({ error: 'Total weight is required' }, { status: 400 });
    }

    if (!destination) {
      return NextResponse.json({ error: 'Destination is required' }, { status: 400 });
    }

    // Cari zona berdasarkan destinasi (optimized lookup)
    const destinationKey = destination.toLowerCase().replace(/\s+/g, '-');
    const zoneInfo = (SHIPPING_ZONES as any)[destinationKey];
    
    if (!zoneInfo) {
      return NextResponse.json({ error: 'Destination not supported' }, { status: 400 });
    }

    // Konversi gram ke kg (minimum 1kg) - optimized calculation
    const weightInKg = Math.max(1, Math.ceil(totalWeight / 1000));
    const zone = zoneInfo.zone;
    const distance = zoneInfo.distance;

    // Pre-allocate array for better performance
    const shippingOptions = [];

    // Ekspedisi reguler dengan distance-based pricing
    for (const [courier, rates] of Object.entries(SHIPPING_RATES)) {
      const baseRate = rates[`zone${zone}` as keyof typeof rates] as number;
      const perKgRate = rates.perKg[`zone${zone}` as keyof typeof rates.perKg] as number;
      const estimatedDays = rates.estimatedDays[`zone${zone}` as keyof typeof rates.estimatedDays] as string;
      
      // Apply distance-based pricing (10% increase per km for long distance)
      let cost = baseRate + (perKgRate * (weightInKg - 1));
      if (distance > 50) { // Long distance adjustment
        const distanceMultiplier = 1 + ((distance - 50) * 0.01); // 1% per km after 50km
        cost = Math.round(cost * distanceMultiplier);
      }
      
      // Filter out unsuitable options for heavy items
      if (needsCargo(totalWeight) && !courier.includes('KARGO')) {
        continue; // Skip regular expedisi for >20kg
      }
      
      shippingOptions.push({
        courier,
        service: 'REG',
        cost,
        estimatedDays,
        description: `${courier} - ${estimatedDays} hari - ${zoneInfo.name} (${weightInKg}kg, ${distance}km)`,
        type: 'ekspedisi'
      });
    }

    // Kurir toko untuk zona 1 dan 2 dengan logika berat dan jarak baru
    if (zone <= 2) {
      const storeResult = calculateStoreCourier(distance, totalWeight);
      const estimatedDays = zone === 1 ? 'Same Day' : '1 hari';
      
      shippingOptions.push({
        courier: 'KURIR TOKO',
        service: storeResult.type === 'kargo' ? 'KARGO' : 'ANTAR',
        cost: storeResult.cost,
        estimatedDays,
        description: storeResult.description,
        type: storeResult.type,
        recommended: needsCargo(totalWeight) // Recommend for heavy items
      });
    }

    // GoSend untuk zona 1 dan 2 (Jabodetabek) dengan batas berat 20kg
    if (zone <= 2 && totalWeight <= 20000) {
      for (const [serviceName, rates] of Object.entries(GOSEND_RATES)) {
        const estimatedDays = zone === 1 ? 
          (serviceName.includes('INSTANT') ? '1-2 jam' : '4-8 jam') :
          (serviceName.includes('INSTANT') ? '2-4 jam' : '6-12 jam');
        
        // Check distance limit
        if (distance <= rates.maxDistance) {
          const cost = calculateDistanceBasedShipping(rates.baseRate, rates.perKmRate, distance, weightInKg);
          
          shippingOptions.push({
            courier: serviceName,
            service: 'GOSEND',
            cost,
            estimatedDays,
            description: `${serviceName} - ${estimatedDays} - ${zoneInfo.name} (${weightInKg}kg, ${distance}km)`,
            type: 'gosend'
          });
        }
      }
    }

    // Sort by cost (optimized sort)
    shippingOptions.sort((a, b) => a.cost - b.cost);

    return NextResponse.json({
      totalWeight,
      weightInKg,
      destination: zoneInfo.name,
      zone,
      distance,
      needsCargo: needsCargo(totalWeight),
      shippingOptions,
      recommendations: {
        heavyItem: needsCargo(totalWeight) ? 'Disarankan menggunakan Kurir Toko Kargo untuk barang >20kg' : null,
        cheapest: shippingOptions.length > 0 ? shippingOptions[0].courier : null
      }
    });

  } catch (error: any) {
    console.error('Shipping cost calculation error:', error);
    return NextResponse.json({ error: 'Calculation failed' }, { status: 500 });
  }
}
