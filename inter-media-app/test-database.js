const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/inter-media-app');

async function testDatabase() {
  try {
    console.log('🔍 Testing database connection...');
    
    // Wait for connection
    await new Promise((resolve) => {
      mongoose.connection.once('open', resolve);
    });
    
    // Test collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📊 Collections found:', collections.map(c => c.name));
    
    // Count documents
    const users = await mongoose.connection.db.collection('users').countDocuments();
    const categories = await mongoose.connection.db.collection('categories').countDocuments();
    const products = await mongoose.connection.db.collection('products').countDocuments();
    const paymentinfos = await mongoose.connection.db.collection('paymentinfos').countDocuments();
    
    console.log('📈 Document counts:');
    console.log(`  Users: ${users}`);
    console.log(`  Categories: ${categories}`);
    console.log(`  Products: ${products}`);
    console.log(`  Payment Info: ${paymentinfos}`);
    
    // Test admin user
    const adminUser = await mongoose.connection.db.collection('users').findOne({ email: 'admin@test.com' });
    console.log('👤 Admin user exists:', !!adminUser);
    console.log('🔑 Admin role:', adminUser?.role);
    
    console.log('✅ Database test completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database test failed:', error);
    process.exit(1);
  }
}

testDatabase();
