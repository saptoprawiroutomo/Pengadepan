const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/inter-media-app');

async function updateProductsWithPlaceholder() {
  try {
    await new Promise((resolve) => {
      mongoose.connection.once('open', resolve);
    });

    console.log('🔄 Updating products with placeholder...');

    // Update all products with a simple placeholder or no image
    const result = await mongoose.connection.db.collection('products').updateMany(
      {},
      { 
        $set: { 
          images: ['/logo-im.svg'] // Use existing logo as placeholder
        }
      }
    );

    console.log(`✅ Updated ${result.modifiedCount} products with placeholder`);
    console.log('✅ No more 404 image errors');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

updateProductsWithPlaceholder();
