const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://saptoprawiroutomo_db_user:1234qwer@cluster0.z3wyzso.mongodb.net/intermediadb?retryWrites=true&w=majority&appName=Cluster0');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  stock: { type: Number, required: true, default: 0 },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  images: [{ type: String }],
  isActive: { type: Boolean, default: true },
  weight: { type: Number },
  dimensions: { type: String },
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);

async function fixProductImages() {
  try {
    console.log('🔄 Fixing product images...');

    // Update all products with placeholder images to use picsum.photos
    await Product.updateMany(
      { images: { $regex: 'via.placeholder.com' } },
      { $set: { images: ['https://picsum.photos/300/300?random=1'] } }
    );

    // Set specific images for different categories
    const updates = [
      // Printer images
      { slug: 'printer-canon-pixma-g2010', images: ['https://picsum.photos/300/300?random=10'] },
      { slug: 'printer-hp-deskjet-2320', images: ['https://picsum.photos/300/300?random=11'] },
      { slug: 'printer-epson-l3110', images: ['https://picsum.photos/300/300?random=12'] },
      
      // Laptop images
      { slug: 'laptop-asus-vivobook-14', images: ['https://picsum.photos/300/300?random=20'] },
      { slug: 'laptop-acer-aspire-5', images: ['https://picsum.photos/300/300?random=21'] },
      { slug: 'macbook-air-m1', images: ['https://picsum.photos/300/300?random=22'] },
      
      // Monitor images
      { slug: 'monitor-asus-24-full-hd', images: ['https://picsum.photos/300/300?random=30'] },
      { slug: 'monitor-lg-27-4k', images: ['https://picsum.photos/300/300?random=31'] },
      
      // Fotokopi images
      { slug: 'canon-imagerunner-2006n', images: ['https://picsum.photos/300/300?random=40'] },
      { slug: 'xerox-workcentre-3025', images: ['https://picsum.photos/300/300?random=41'] },
      
      // Scanner images
      { slug: 'canon-canoscan-lide-300', images: ['https://picsum.photos/300/300?random=50'] },
      { slug: 'epson-perfection-v39', images: ['https://picsum.photos/300/300?random=51'] }
    ];

    for (const update of updates) {
      await Product.updateOne(
        { slug: update.slug },
        { $set: { images: update.images } }
      );
    }

    // For products without specific images, use random picsum
    const productsWithoutImages = await Product.find({ 
      $or: [
        { images: { $size: 0 } },
        { images: null },
        { images: { $regex: 'via.placeholder.com' } }
      ]
    });

    for (let i = 0; i < productsWithoutImages.length; i++) {
      const randomId = Math.floor(Math.random() * 1000) + 100;
      await Product.updateOne(
        { _id: productsWithoutImages[i]._id },
        { $set: { images: [`https://picsum.photos/300/300?random=${randomId}`] } }
      );
    }

    console.log('✅ Fixed product images');
    console.log(`📸 Updated ${productsWithoutImages.length} products with new images`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixProductImages();
