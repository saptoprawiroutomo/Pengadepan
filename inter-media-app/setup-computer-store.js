const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/inter-media-app');

// Define schemas
const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
}, { timestamps: true });

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

const Category = mongoose.model('Category', categorySchema);
const Product = mongoose.model('Product', productSchema);

async function setupComputerStore() {
  try {
    console.log('🔄 Setting up computer store data...');

    // 1. Update Categories for Computer Store
    await Category.deleteMany({});
    const categories = await Category.insertMany([
      { name: 'Laptop', slug: 'laptop' },
      { name: 'Desktop PC', slug: 'desktop-pc' },
      { name: 'Processor', slug: 'processor' },
      { name: 'RAM Memory', slug: 'ram-memory' },
      { name: 'Storage (SSD/HDD)', slug: 'storage' },
      { name: 'Graphics Card', slug: 'graphics-card' },
      { name: 'Motherboard', slug: 'motherboard' },
      { name: 'Power Supply', slug: 'power-supply' },
      { name: 'Monitor', slug: 'monitor' },
      { name: 'Keyboard & Mouse', slug: 'keyboard-mouse' },
      { name: 'Networking', slug: 'networking' },
      { name: 'Accessories', slug: 'accessories' }
    ]);
    console.log('✅ Computer store categories created:', categories.length);

    // 2. Update Products for Computer Store
    await Product.deleteMany({});
    const products = await Product.insertMany([
      // Laptops
      {
        name: 'ASUS ROG Strix G15 Gaming Laptop',
        slug: 'asus-rog-strix-g15',
        description: 'Gaming laptop dengan AMD Ryzen 7, RTX 3060, 16GB RAM, 512GB SSD',
        price: 18500000,
        stock: 15,
        categoryId: categories[0]._id,
        images: ['/images/laptop-asus-rog.jpg'],
        isActive: true,
        weight: 2300,
        dimensions: '35.4 x 25.9 x 2.7 cm'
      },
      {
        name: 'Lenovo ThinkPad E14 Business Laptop',
        slug: 'lenovo-thinkpad-e14',
        description: 'Business laptop Intel Core i5, 8GB RAM, 256GB SSD, Windows 11 Pro',
        price: 12500000,
        stock: 20,
        categoryId: categories[0]._id,
        images: ['/images/laptop-thinkpad.jpg'],
        isActive: true,
        weight: 1600,
        dimensions: '32.4 x 23.8 x 1.8 cm'
      },
      
      // Desktop PC
      {
        name: 'Gaming PC Intel Core i7 RTX 4060',
        slug: 'gaming-pc-i7-rtx4060',
        description: 'PC Gaming Intel Core i7-12700F, RTX 4060, 16GB DDR4, 1TB NVMe SSD',
        price: 22000000,
        stock: 8,
        categoryId: categories[1]._id,
        images: ['/images/pc-gaming-i7.jpg'],
        isActive: true,
        weight: 12000,
        dimensions: '45 x 20 x 40 cm'
      },
      
      // Processors
      {
        name: 'Intel Core i5-13400F Processor',
        slug: 'intel-i5-13400f',
        description: 'Processor Intel Core i5-13400F 10-Core 2.5GHz Socket LGA1700',
        price: 3200000,
        stock: 25,
        categoryId: categories[2]._id,
        images: ['/images/cpu-intel-i5.jpg'],
        isActive: true,
        weight: 100,
        dimensions: '3.7 x 3.7 x 0.8 cm'
      },
      {
        name: 'AMD Ryzen 5 7600X Processor',
        slug: 'amd-ryzen5-7600x',
        description: 'Processor AMD Ryzen 5 7600X 6-Core 4.7GHz Socket AM5',
        price: 3800000,
        stock: 20,
        categoryId: categories[2]._id,
        images: ['/images/cpu-amd-ryzen5.jpg'],
        isActive: true,
        weight: 100,
        dimensions: '4.0 x 4.0 x 0.8 cm'
      },
      
      // RAM Memory
      {
        name: 'Corsair Vengeance LPX 16GB DDR4',
        slug: 'corsair-vengeance-16gb-ddr4',
        description: 'RAM Corsair Vengeance LPX 16GB (2x8GB) DDR4-3200 C16',
        price: 1200000,
        stock: 40,
        categoryId: categories[3]._id,
        images: ['/images/ram-corsair-16gb.jpg'],
        isActive: true,
        weight: 200,
        dimensions: '13.3 x 0.8 x 3.1 cm'
      },
      
      // Storage
      {
        name: 'Samsung 980 NVMe SSD 1TB',
        slug: 'samsung-980-nvme-1tb',
        description: 'SSD Samsung 980 NVMe M.2 1TB PCIe 3.0 Read 3500MB/s',
        price: 1800000,
        stock: 30,
        categoryId: categories[4]._id,
        images: ['/images/ssd-samsung-980.jpg'],
        isActive: true,
        weight: 50,
        dimensions: '8.0 x 2.2 x 0.2 cm'
      },
      
      // Graphics Card
      {
        name: 'NVIDIA GeForce RTX 4060 Ti',
        slug: 'nvidia-rtx-4060-ti',
        description: 'Graphics Card NVIDIA GeForce RTX 4060 Ti 16GB GDDR6',
        price: 8500000,
        stock: 12,
        categoryId: categories[5]._id,
        images: ['/images/gpu-rtx-4060ti.jpg'],
        isActive: true,
        weight: 1200,
        dimensions: '24.2 x 11.2 x 4.0 cm'
      },
      
      // Monitor
      {
        name: 'ASUS TUF Gaming VG27AQ 27" 165Hz',
        slug: 'asus-tuf-vg27aq-27inch',
        description: 'Monitor Gaming ASUS TUF 27" WQHD 165Hz IPS G-Sync Compatible',
        price: 4200000,
        stock: 18,
        categoryId: categories[8]._id,
        images: ['/images/monitor-asus-tuf-27.jpg'],
        isActive: true,
        weight: 6200,
        dimensions: '61.4 x 36.8 x 5.2 cm'
      },
      
      // Keyboard & Mouse
      {
        name: 'Logitech MX Master 3S Wireless Mouse',
        slug: 'logitech-mx-master-3s',
        description: 'Mouse Wireless Logitech MX Master 3S untuk Productivity',
        price: 1400000,
        stock: 35,
        categoryId: categories[9]._id,
        images: ['/images/mouse-logitech-mx.jpg'],
        isActive: true,
        weight: 141,
        dimensions: '12.4 x 8.4 x 5.1 cm'
      }
    ]);
    console.log('✅ Computer store products created:', products.length);

    console.log('🎉 Computer store setup completed successfully!');
    console.log('\n📋 Categories created:');
    categories.forEach(cat => console.log(`  - ${cat.name}`));
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting up computer store:', error);
    process.exit(1);
  }
}

setupComputerStore();
