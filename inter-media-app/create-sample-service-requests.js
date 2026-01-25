const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb+srv://saptoprawiroutomo_db_user:1234qwer@cluster0.z3wyzso.mongodb.net/intermediadb?retryWrites=true&w=majority&appName=Cluster0';

async function createSampleServiceRequests() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db('intermediadb');
    const collection = db.collection('servicerequests');

    // Sample service requests
    const sampleRequests = [
      {
        serviceCode: 'SRV-' + Date.now(),
        deviceType: 'printer',
        complaint: 'Printer tidak bisa print, lampu error menyala terus',
        address: 'Jl. Sudirman No. 123, Jakarta Pusat',
        phone: '081234567890',
        status: 'received',
        createdAt: new Date()
      },
      {
        serviceCode: 'SRV-' + (Date.now() + 1000),
        deviceType: 'fotocopy',
        complaint: 'Mesin fotocopy macet, kertas sering nyangkut',
        address: 'Jl. Thamrin No. 456, Jakarta Pusat',
        phone: '081234567891',
        status: 'checking',
        createdAt: new Date(Date.now() - 86400000) // 1 day ago
      },
      {
        serviceCode: 'SRV-' + (Date.now() + 2000),
        deviceType: 'komputer',
        complaint: 'Komputer sering hang dan restart sendiri',
        address: 'Jl. Gatot Subroto No. 789, Jakarta Selatan',
        phone: '081234567892',
        status: 'repairing',
        createdAt: new Date(Date.now() - 172800000) // 2 days ago
      },
      {
        serviceCode: 'SRV-' + (Date.now() + 3000),
        deviceType: 'printer',
        complaint: 'Hasil print buram dan tinta tidak keluar sempurna',
        address: 'Jl. Kuningan No. 321, Jakarta Selatan',
        phone: '081234567893',
        status: 'done',
        createdAt: new Date(Date.now() - 259200000) // 3 days ago
      }
    ];

    const result = await collection.insertMany(sampleRequests);
    console.log(`✅ ${result.insertedCount} sample service requests created`);
    
    // Show created data
    const requests = await collection.find({}).toArray();
    console.log('\n📋 Service Requests in database:');
    requests.forEach(req => {
      console.log(`- ${req.serviceCode}: ${req.deviceType} (${req.status})`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

createSampleServiceRequests();
