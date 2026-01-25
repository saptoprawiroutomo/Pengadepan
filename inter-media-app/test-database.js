const { MongoClient } = require('mongodb');

const MONGODB_URI = "mongodb+srv://saptoprawiroutomo_db_user:1234qwer@cluster0.z3wyzso.mongodb.net/intermediadb?retryWrites=true&w=majority&appName=Cluster0";

async function testDatabase() {
    console.log('🔍 Testing Database Connection and Data...\n');
    
    try {
        const client = new MongoClient(MONGODB_URI);
        await client.connect();
        console.log('✅ Database connected successfully');
        
        const db = client.db('intermediadb');
        
        // Test collections
        const collections = await db.listCollections().toArray();
        console.log(`📁 Found ${collections.length} collections:`);
        collections.forEach(col => console.log(`   - ${col.name}`));
        
        // Test products
        const products = await db.collection('products').find({}).limit(5).toArray();
        console.log(`\n📦 Products in database: ${products.length > 0 ? products.length + ' found' : 'No products found'}`);
        if (products.length > 0) {
            console.log(`   Sample: ${products[0].name} - Rp ${products[0].price?.toLocaleString()}`);
        }
        
        // Test categories
        const categories = await db.collection('categories').find({}).toArray();
        console.log(`🏷️  Categories: ${categories.length} found`);
        
        // Test users
        const users = await db.collection('users').countDocuments();
        console.log(`👥 Users: ${users} registered`);
        
        // Test orders
        const orders = await db.collection('orders').countDocuments();
        console.log(`📋 Orders: ${orders} total`);
        
        // Test messages
        const messages = await db.collection('messages').countDocuments();
        console.log(`💬 Messages: ${messages} total`);
        
        await client.close();
        console.log('\n✅ Database test completed successfully');
        
    } catch (error) {
        console.error('❌ Database test failed:', error.message);
    }
}

testDatabase();
