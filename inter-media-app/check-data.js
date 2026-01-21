const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/inter-media-app');

async function checkData() {
  try {
    await new Promise((resolve) => {
      mongoose.connection.once('open', resolve);
    });

    console.log('🔍 Checking database data...\n');

    // Check categories
    const categories = await mongoose.connection.db.collection('categories').find({}).toArray();
    console.log('📂 Categories:');
    categories.forEach(cat => console.log(`  - ${cat.name} (${cat.slug})`));

    console.log('\n💻 Products:');
    const products = await mongoose.connection.db.collection('products').find({}).toArray();
    products.forEach(prod => console.log(`  - ${prod.name} - Rp ${prod.price.toLocaleString()}`));

    console.log('\n👤 Users:');
    const users = await mongoose.connection.db.collection('users').find({}).toArray();
    users.forEach(user => console.log(`  - ${user.email} (${user.role})`));

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkData();
