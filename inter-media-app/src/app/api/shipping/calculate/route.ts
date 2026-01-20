import { NextRequest, NextResponse } from 'next/server';

// Data kota/kabupaten dengan zona ongkir
const SHIPPING_ZONES = {
  // Zona 1: Dalam kota (terdekat)
  'jakarta-pusat': { zone: 1, name: 'Jakarta Pusat' },
  'jakarta-utara': { zone: 1, name: 'Jakarta Utara' },
  'jakarta-selatan': { zone: 1, name: 'Jakarta Selatan' },
  'jakarta-barat': { zone: 1, name: 'Jakarta Barat' },
  'jakarta-timur': { zone: 1, name: 'Jakarta Timur' },
  
  // Zona 2: Jabodetabek
  'bogor': { zone: 2, name: 'Bogor' },
  'depok': { zone: 2, name: 'Depok' },
  'tangerang': { zone: 2, name: 'Tangerang' },
  'bekasi': { zone: 2, name: 'Bekasi' },
  
  // Zona 3: Jawa Barat
  'bandung': { zone: 3, name: 'Bandung' },
  'cirebon': { zone: 3, name: 'Cirebon' },
  'sukabumi': { zone: 3, name: 'Sukabumi' },
  
  // Zona 4: Pulau Jawa
  'surabaya': { zone: 4, name: 'Surabaya' },
  'yogyakarta': { zone: 4, name: 'Yogyakarta' },
  'semarang': { zone: 4, name: 'Semarang' },
  'malang': { zone: 4, name: 'Malang' },
  
  // Zona 5: Luar Jawa
  'medan': { zone: 5, name: 'Medan' },
  'palembang': { zone: 5, name: 'Palembang' },
  'makassar': { zone: 5, name: 'Makassar' },
  'balikpapan': { zone: 5, name: 'Balikpapan' }
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

// Kurir toko untuk zona 1 dan 2 saja
const STORE_COURIER_RATES = {
  'KURIR TOKO': {
    zone1: 5000, // Dalam kota Jakarta
    zone2: 8000, // Jabodetabek
    perKm: 1000, // Tambahan per km
    estimatedDays: { zone1: 'Same Day', zone2: '1 hari' }
  }
};

// GoSend untuk Jabodetabek (zona 1 dan 2)
const GOSEND_RATES = {
  'GOSEND INSTANT': {
    zone1: { base: 15000, perKm: 2500, maxKm: 25 }, // Jakarta: 15rb + 2.5rb/km
    zone2: { base: 20000, perKm: 3000, maxKm: 40 }, // Jabodetabek: 20rb + 3rb/km
    estimatedDays: { zone1: '1-2 jam', zone2: '2-4 jam' },
    maxWeight: 20000 // Max 20kg
  },
  'GOSEND SAME DAY': {
    zone1: { base: 12000, perKm: 2000, maxKm: 25 }, // Jakarta: 12rb + 2rb/km
    zone2: { base: 15000, perKm: 2500, maxKm: 40 }, // Jabodetabek: 15rb + 2.5rb/km
    estimatedDays: { zone1: '4-8 jam', zone2: '6-12 jam' },
    maxWeight: 20000 // Max 20kg
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
    const zoneInfo = SHIPPING_ZONES[destinationKey];
    
    if (!zoneInfo) {
      return NextResponse.json({ error: 'Destination not supported' }, { status: 400 });
    }

    // Konversi gram ke kg (minimum 1kg) - optimized calculation
    const weightInKg = Math.max(1, Math.ceil(totalWeight / 1000));
    const zone = zoneInfo.zone;

    // Pre-allocate array for better performance
    const shippingOptions = [];

    // Ekspedisi reguler - optimized loop
    for (const [courier, rates] of Object.entries(SHIPPING_RATES)) {
      const baseRate = rates[`zone${zone}` as keyof typeof rates] as number;
      const perKgRate = rates.perKg[`zone${zone}` as keyof typeof rates.perKg] as number;
      const estimatedDays = rates.estimatedDays[`zone${zone}` as keyof typeof rates.estimatedDays] as string;
      
      const cost = baseRate + (perKgRate * (weightInKg - 1));
      
      shippingOptions.push({
        courier,
        service: 'REG',
        cost,
        estimatedDays,
        description: `${courier} - ${estimatedDays} hari - ${zoneInfo.name}`,
        type: 'ekspedisi'
      });
    }

    // Kurir toko hanya untuk zona 1 dan 2 - conditional check
    if (zone <= 2) {
      const storeRates = STORE_COURIER_RATES['KURIR TOKO'];
      const baseRate = zone === 1 ? storeRates.zone1 : storeRates.zone2;
      const estimatedDays = storeRates.estimatedDays[`zone${zone}` as keyof typeof storeRates.estimatedDays];
      
      // Estimasi jarak berdasarkan zona (pre-calculated)
      const estimatedDistance = zone === 1 ? 5 : 15;
      const cost = baseRate + (estimatedDistance * storeRates.perKm);
      
      shippingOptions.push({
        courier: 'KURIR TOKO',
        service: 'ANTAR',
        cost,
        estimatedDays,
        description: `Kurir Toko - ${estimatedDays} - ${zoneInfo.name} (~${estimatedDistance}km)`,
        type: 'kurir-toko'
      });
    }

    // GoSend untuk zona 1 dan 2 (Jabodetabek) dengan batas berat 20kg
    if (zone <= 2 && totalWeight <= 20000) {
      for (const [serviceName, rates] of Object.entries(GOSEND_RATES)) {
        const zoneRates = rates[`zone${zone}` as keyof typeof rates] as any;
        const estimatedDays = rates.estimatedDays[`zone${zone}` as keyof typeof rates.estimatedDays];
        
        // Estimasi jarak berdasarkan zona
        const estimatedDistance = zone === 1 ? 8 : 20; // Jakarta: 8km, Jabodetabek: 20km
        
        // Pastikan tidak melebihi max km
        if (estimatedDistance <= zoneRates.maxKm) {
          const cost = zoneRates.base + (estimatedDistance * zoneRates.perKm);
          
          shippingOptions.push({
            courier: serviceName,
            service: 'GOSEND',
            cost,
            estimatedDays,
            description: `${serviceName} - ${estimatedDays} - ${zoneInfo.name} (~${estimatedDistance}km)`,
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
      shippingOptions
    });

  } catch (error: any) {
    console.error('Shipping cost calculation error:', error);
    return NextResponse.json({ error: 'Calculation failed' }, { status: 500 });
  }
}
