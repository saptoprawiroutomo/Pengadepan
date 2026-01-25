const mongoose = require('mongoose');

async function createSampleServicesData() {
  try {
    console.log('🔄 Creating sample services data...');

    await mongoose.connect('mongodb+srv://saptoprawiroutomo_db_user:1234qwer@cluster0.z3wyzso.mongodb.net/intermediadb?retryWrites=true&w=majority&appName=Cluster0');
    console.log('✅ Connected to database');

    const db = mongoose.connection.db;

    // Get some user IDs
    const users = await db.collection('users').find({}).limit(3).toArray();
    const userIds = users.map(u => u._id);

    // Sample service requests
    const services = [
      {
        serviceCode: 'SRV-001',
        userId: userIds[0],
        deviceType: 'Printer',
        complaint: 'Printer tidak bisa print, lampu error menyala',
        status: 'completed',
        laborCost: 150000,
        partsCost: 75000,
        totalCost: 225000,
        phone: '081234567890',
        address: 'Jakarta Selatan',
        createdAt: new Date('2024-01-18'),
        completedAt: new Date('2024-01-20')
      },
      {
        serviceCode: 'SRV-002',
        userId: userIds[1],
        deviceType: 'Fotocopy',
        complaint: 'Hasil fotocopy bergaris dan buram',
        status: 'in_progress',
        laborCost: 200000,
        partsCost: 120000,
        totalCost: 320000,
        phone: '081234567891',
        address: 'Bandung',
        createdAt: new Date('2024-01-19')
      },
      {
        serviceCode: 'SRV-003',
        userId: userIds[2],
        deviceType: 'Komputer',
        complaint: 'Komputer sering hang dan restart sendiri',
        status: 'completed',
        laborCost: 300000,
        partsCost: 450000,
        totalCost: 750000,
        phone: '081234567892',
        address: 'Surabaya',
        createdAt: new Date('2024-01-20'),
        completedAt: new Date('2024-01-22')
      },
      {
        serviceCode: 'SRV-004',
        userId: userIds[0],
        deviceType: 'Scanner',
        complaint: 'Scanner tidak terdeteksi di komputer',
        status: 'pending',
        laborCost: 100000,
        partsCost: 0,
        totalCost: 100000,
        phone: '081234567890',
        address: 'Jakarta Selatan',
        createdAt: new Date('2024-01-21')
      },
      {
        serviceCode: 'SRV-005',
        userId: userIds[1],
        deviceType: 'Printer',
        complaint: 'Tinta tidak keluar meskipun cartridge baru',
        status: 'completed',
        laborCost: 125000,
        partsCost: 85000,
        totalCost: 210000,
        phone: '081234567891',
        address: 'Bandung',
        createdAt: new Date('2024-01-21'),
        completedAt: new Date('2024-01-22')
      }
    ];

    // Clear existing services
    await db.collection('servicerequests').deleteMany({});
    
    // Insert sample services
    await db.collection('servicerequests').insertMany(services);
    console.log('✅ Created', services.length, 'service requests');

    // Summary
    const totalRevenue = services.reduce((sum, s) => sum + s.totalCost, 0);
    const completedServices = services.filter(s => s.status === 'completed').length;
    
    console.log('\n📊 Services Summary:');
    console.log(`🔧 Total Services: ${services.length}`);
    console.log(`✅ Completed: ${completedServices}`);
    console.log(`💰 Total Revenue: Rp ${totalRevenue.toLocaleString('id-ID')}`);
    console.log('\n🌐 Access services report at: /admin/reports (Services tab)');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createSampleServicesData();
