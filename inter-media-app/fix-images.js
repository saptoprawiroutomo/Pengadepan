const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/inter-media-app');

async function fixProductImages() {
  try {
    await new Promise((resolve) => {
      mongoose.connection.once('open', resolve);
    });

    console.log('🔄 Fixing product images...');

    // Update all products to remove image references or use placeholder
    const result = await mongoose.connection.db.collection('products').updateMany(
      {},
      { 
        $set: { 
          images: [] // Remove all image references
        }
      }
    );

    console.log(`✅ Updated ${result.modifiedCount} products`);
    console.log('✅ All product images cleared - no more 404 errors');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixProductImages();
