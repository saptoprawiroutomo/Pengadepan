const { MongoClient, ObjectId } = require('mongodb');

const MONGODB_URI = 'mongodb+srv://saptoprawiroutomo:Sapto123@cluster0.ixqhj.mongodb.net/intermedia?retryWrites=true&w=majority&appName=Cluster0';

async function createSampleTransactions() {
  console.log('🛒 CREATING SAMPLE TRANSACTIONS DIRECTLY IN DATABASE');
  console.log('===================================================');
  
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db('intermedia');
    
    // Sample orders data
    const sampleOrders = [
      {
        orderNumber: `ORD-${Date.now()}-001`,
        customerInfo: {
          name: 'Doni Pratama',
          email: 'doni.test2026@gmail.com',
          phone: '081234567890'
        },
        shippingAddress: {
          street: 'Jl. Sudirman No. 123',
          city: 'Jakarta Pusat',
          district: 'Tanah Abang',
          postalCode: '10270',
          fullAddress: 'Jl. Sudirman No. 123, RT 01/RW 02, dekat Plaza Indonesia'
        },
        items: [{
          productId: new ObjectId('69707dadac8cf4b9ca3d0ed3'),
          name: 'Mesin Fotokopi Canon IR 4570',
          price: 8000000,
          weight: 200000,
          qty: 1
        }],
        shipping: {
          courier: 'KURIR TOKO',
          service: 'KARGO',
          cost: 500000,
          estimatedDays: 'Same Day'
        },
        subtotal: 8000000,
        shippingCost: 500000,
        total: 8500000,
        status: 'pending',
        paymentMethod: 'transfer',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    // Insert orders
    const result = await db.collection('orders').insertMany(sampleOrders);
    console.log(`✅ Created ${result.insertedCount} sample orders`);
    
    // List created orders
    for (const [index, id] of Object.entries(result.insertedIds)) {
      console.log(`📋 Order ${parseInt(index) + 1}: ${id}`);
    }
    
    console.log('✅ Sample transactions created successfully!');
    console.log('🔍 Check admin panel: https://inter-media-apps.vercel.app/admin/orders');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.close();
  }
}

createSampleTransactions();
