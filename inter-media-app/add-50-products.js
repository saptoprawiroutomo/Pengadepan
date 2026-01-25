const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://saptoprawiroutomo_db_user:1234qwer@cluster0.z3wyzso.mongodb.net/intermediadb?retryWrites=true&w=majority&appName=Cluster0');

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

async function add50Products() {
  try {
    console.log('🔄 Adding 50+ products with new categories...');

    // Create new categories
    const newCategories = [
      { name: 'Laptop', slug: 'laptop' },
      { name: 'Komputer Desktop', slug: 'komputer-desktop' },
      { name: 'Monitor', slug: 'monitor' },
      { name: 'Keyboard & Mouse', slug: 'keyboard-mouse' },
      { name: 'Storage', slug: 'storage' },
      { name: 'RAM Memory', slug: 'ram-memory' },
      { name: 'Processor', slug: 'processor' },
      { name: 'Motherboard', slug: 'motherboard' },
      { name: 'Graphics Card', slug: 'graphics-card' },
      { name: 'Power Supply', slug: 'power-supply' },
      { name: 'Cooling System', slug: 'cooling-system' },
      { name: 'Networking', slug: 'networking' },
      { name: 'Audio & Speaker', slug: 'audio-speaker' },
      { name: 'Webcam', slug: 'webcam' },
      { name: 'UPS', slug: 'ups' }
    ];

    // Insert categories if not exist
    for (const cat of newCategories) {
      const exists = await Category.findOne({ slug: cat.slug });
      if (!exists) {
        await Category.create(cat);
      }
    }

    // Get all categories
    const categories = await Category.find({});
    const catMap = {};
    categories.forEach(cat => {
      catMap[cat.slug] = cat._id;
    });

    const products = [
      // Laptop (8 products)
      { name: 'Laptop ASUS VivoBook 14', slug: 'laptop-asus-vivobook-14', description: 'Laptop 14" Intel Core i3, 8GB RAM, 256GB SSD', price: 6500000, stock: 15, categoryId: catMap['laptop'], images: ['https://via.placeholder.com/300x300?text=ASUS+VivoBook'], weight: 1400 },
      { name: 'Laptop Acer Aspire 5', slug: 'laptop-acer-aspire-5', description: 'Laptop 15.6" AMD Ryzen 5, 8GB RAM, 512GB SSD', price: 7200000, stock: 12, categoryId: catMap['laptop'], images: ['https://via.placeholder.com/300x300?text=Acer+Aspire'], weight: 1700 },
      { name: 'Laptop HP Pavilion 14', slug: 'laptop-hp-pavilion-14', description: 'Laptop 14" Intel Core i5, 8GB RAM, 512GB SSD', price: 8500000, stock: 10, categoryId: catMap['laptop'], images: ['https://via.placeholder.com/300x300?text=HP+Pavilion'], weight: 1500 },
      { name: 'Laptop Lenovo IdeaPad 3', slug: 'laptop-lenovo-ideapad-3', description: 'Laptop 15.6" Intel Core i3, 4GB RAM, 1TB HDD', price: 5800000, stock: 18, categoryId: catMap['laptop'], images: ['https://via.placeholder.com/300x300?text=Lenovo+IdeaPad'], weight: 1850 },
      { name: 'Laptop Dell Inspiron 15', slug: 'laptop-dell-inspiron-15', description: 'Laptop 15.6" Intel Core i5, 8GB RAM, 256GB SSD', price: 9200000, stock: 8, categoryId: catMap['laptop'], images: ['https://via.placeholder.com/300x300?text=Dell+Inspiron'], weight: 1800 },
      { name: 'Laptop ASUS ROG Strix G15', slug: 'laptop-asus-rog-strix-g15', description: 'Gaming laptop AMD Ryzen 7, 16GB RAM, RTX 3060', price: 18500000, stock: 5, categoryId: catMap['laptop'], images: ['https://via.placeholder.com/300x300?text=ROG+Strix'], weight: 2300 },
      { name: 'MacBook Air M1', slug: 'macbook-air-m1', description: 'Apple MacBook Air 13" M1 chip, 8GB RAM, 256GB SSD', price: 14500000, stock: 6, categoryId: catMap['laptop'], images: ['https://via.placeholder.com/300x300?text=MacBook+Air'], weight: 1290 },
      { name: 'Laptop MSI Modern 14', slug: 'laptop-msi-modern-14', description: 'Laptop 14" Intel Core i5, 8GB RAM, 512GB SSD', price: 8800000, stock: 9, categoryId: catMap['laptop'], images: ['https://via.placeholder.com/300x300?text=MSI+Modern'], weight: 1300 },

      // Desktop PC (6 products)
      { name: 'PC Rakitan Office Intel i3', slug: 'pc-rakitan-office-intel-i3', description: 'PC rakitan untuk office Intel i3, 8GB RAM, 256GB SSD', price: 4500000, stock: 20, categoryId: catMap['komputer-desktop'], images: ['https://via.placeholder.com/300x300?text=PC+Office'], weight: 8000 },
      { name: 'PC Gaming AMD Ryzen 5', slug: 'pc-gaming-amd-ryzen-5', description: 'PC gaming AMD Ryzen 5, 16GB RAM, GTX 1660 Super', price: 12500000, stock: 8, categoryId: catMap['komputer-desktop'], images: ['https://via.placeholder.com/300x300?text=PC+Gaming'], weight: 12000 },
      { name: 'Mini PC Intel NUC', slug: 'mini-pc-intel-nuc', description: 'Mini PC Intel NUC i5, 8GB RAM, 256GB SSD', price: 6800000, stock: 15, categoryId: catMap['komputer-desktop'], images: ['https://via.placeholder.com/300x300?text=Intel+NUC'], weight: 1200 },
      { name: 'All-in-One HP 22', slug: 'all-in-one-hp-22', description: 'PC All-in-One 21.5" Intel Celeron, 4GB RAM, 1TB HDD', price: 5200000, stock: 12, categoryId: catMap['komputer-desktop'], images: ['https://via.placeholder.com/300x300?text=HP+AIO'], weight: 5500 },
      { name: 'Workstation Dell Precision', slug: 'workstation-dell-precision', description: 'Workstation Intel Xeon, 32GB RAM, Quadro RTX 4000', price: 35000000, stock: 3, categoryId: catMap['komputer-desktop'], images: ['https://via.placeholder.com/300x300?text=Dell+Precision'], weight: 15000 },
      { name: 'PC Server HP ProLiant', slug: 'pc-server-hp-proliant', description: 'Server HP ProLiant Intel Xeon, 16GB RAM, 2TB HDD', price: 28000000, stock: 2, categoryId: catMap['komputer-desktop'], images: ['https://via.placeholder.com/300x300?text=HP+Server'], weight: 18000 },

      // Monitor (8 products)
      { name: 'Monitor ASUS 24" Full HD', slug: 'monitor-asus-24-full-hd', description: 'Monitor LED 24" 1920x1080 IPS panel', price: 1850000, stock: 25, categoryId: catMap['monitor'], images: ['https://via.placeholder.com/300x300?text=ASUS+24'], weight: 4200 },
      { name: 'Monitor LG 27" 4K', slug: 'monitor-lg-27-4k', description: 'Monitor 27" 4K UHD 3840x2160 IPS', price: 4500000, stock: 12, categoryId: catMap['monitor'], images: ['https://via.placeholder.com/300x300?text=LG+27+4K'], weight: 6800 },
      { name: 'Monitor Gaming ASUS ROG 144Hz', slug: 'monitor-gaming-asus-rog-144hz', description: 'Gaming monitor 24" 144Hz 1ms response time', price: 3200000, stock: 15, categoryId: catMap['monitor'], images: ['https://via.placeholder.com/300x300?text=ROG+Gaming'], weight: 5500 },
      { name: 'Monitor Samsung Curved 32"', slug: 'monitor-samsung-curved-32', description: 'Monitor curved 32" WQHD 2560x1440', price: 5800000, stock: 8, categoryId: catMap['monitor'], images: ['https://via.placeholder.com/300x300?text=Samsung+Curved'], weight: 7200 },
      { name: 'Monitor Dell UltraSharp 27"', slug: 'monitor-dell-ultrasharp-27', description: 'Professional monitor 27" QHD color accurate', price: 6200000, stock: 10, categoryId: catMap['monitor'], images: ['https://via.placeholder.com/300x300?text=Dell+UltraSharp'], weight: 6500 },
      { name: 'Monitor AOC 22" Budget', slug: 'monitor-aoc-22-budget', description: 'Monitor LED 22" 1920x1080 ekonomis', price: 1250000, stock: 30, categoryId: catMap['monitor'], images: ['https://via.placeholder.com/300x300?text=AOC+22'], weight: 3800 },
      { name: 'Monitor Portable 15.6"', slug: 'monitor-portable-15-6', description: 'Monitor portable 15.6" USB-C powered', price: 2200000, stock: 18, categoryId: catMap['monitor'], images: ['https://via.placeholder.com/300x300?text=Portable+Monitor'], weight: 800 },
      { name: 'Monitor Ultrawide 34"', slug: 'monitor-ultrawide-34', description: 'Monitor ultrawide 34" 3440x1440 curved', price: 7500000, stock: 6, categoryId: catMap['monitor'], images: ['https://via.placeholder.com/300x300?text=Ultrawide+34'], weight: 8500 },

      // Keyboard & Mouse (6 products)
      { name: 'Keyboard Mechanical RGB', slug: 'keyboard-mechanical-rgb', description: 'Keyboard mechanical blue switch dengan RGB backlight', price: 850000, stock: 20, categoryId: catMap['keyboard-mouse'], images: ['https://via.placeholder.com/300x300?text=Mechanical+RGB'], weight: 1200 },
      { name: 'Mouse Gaming Logitech G502', slug: 'mouse-gaming-logitech-g502', description: 'Gaming mouse 25600 DPI dengan 11 tombol', price: 650000, stock: 25, categoryId: catMap['keyboard-mouse'], images: ['https://via.placeholder.com/300x300?text=Logitech+G502'], weight: 121 },
      { name: 'Keyboard Wireless Logitech', slug: 'keyboard-wireless-logitech', description: 'Keyboard wireless compact untuk office', price: 320000, stock: 35, categoryId: catMap['keyboard-mouse'], images: ['https://via.placeholder.com/300x300?text=Wireless+Keyboard'], weight: 500 },
      { name: 'Combo Keyboard Mouse HP', slug: 'combo-keyboard-mouse-hp', description: 'Set keyboard dan mouse wireless HP', price: 280000, stock: 40, categoryId: catMap['keyboard-mouse'], images: ['https://via.placeholder.com/300x300?text=HP+Combo'], weight: 800 },
      { name: 'Mousepad Gaming XL', slug: 'mousepad-gaming-xl', description: 'Mousepad gaming ukuran XL 900x400mm', price: 150000, stock: 50, categoryId: catMap['keyboard-mouse'], images: ['https://via.placeholder.com/300x300?text=Gaming+Mousepad'], weight: 600 },
      { name: 'Keyboard Gaming Razer', slug: 'keyboard-gaming-razer', description: 'Keyboard gaming Razer mechanical green switch', price: 1250000, stock: 12, categoryId: catMap['keyboard-mouse'], images: ['https://via.placeholder.com/300x300?text=Razer+Gaming'], weight: 1400 },

      // Storage (6 products)
      { name: 'SSD Samsung 970 EVO 500GB', slug: 'ssd-samsung-970-evo-500gb', description: 'SSD NVMe M.2 500GB high performance', price: 850000, stock: 30, categoryId: catMap['storage'], images: ['https://via.placeholder.com/300x300?text=Samsung+SSD'], weight: 8 },
      { name: 'HDD Seagate 1TB', slug: 'hdd-seagate-1tb', description: 'Hard disk 1TB 7200RPM SATA III', price: 650000, stock: 25, categoryId: catMap['storage'], images: ['https://via.placeholder.com/300x300?text=Seagate+HDD'], weight: 415 },
      { name: 'SSD External 1TB', slug: 'ssd-external-1tb', description: 'SSD eksternal 1TB USB 3.0 portable', price: 1450000, stock: 20, categoryId: catMap['storage'], images: ['https://via.placeholder.com/300x300?text=External+SSD'], weight: 150 },
      { name: 'Flash Drive 64GB', slug: 'flash-drive-64gb', description: 'USB flash drive 64GB USB 3.0', price: 85000, stock: 100, categoryId: catMap['storage'], images: ['https://via.placeholder.com/300x300?text=Flash+Drive'], weight: 10 },
      { name: 'MicroSD 128GB', slug: 'microsd-128gb', description: 'MicroSD card 128GB Class 10 dengan adapter', price: 180000, stock: 80, categoryId: catMap['storage'], images: ['https://via.placeholder.com/300x300?text=MicroSD'], weight: 5 },
      { name: 'NAS Synology 2-Bay', slug: 'nas-synology-2-bay', description: 'Network Attached Storage 2-bay untuk backup', price: 3200000, stock: 8, categoryId: catMap['storage'], images: ['https://via.placeholder.com/300x300?text=Synology+NAS'], weight: 1200 },

      // RAM Memory (4 products)
      { name: 'RAM DDR4 8GB 3200MHz', slug: 'ram-ddr4-8gb-3200mhz', description: 'Memory DDR4 8GB PC-25600 3200MHz', price: 450000, stock: 40, categoryId: catMap['ram-memory'], images: ['https://via.placeholder.com/300x300?text=DDR4+8GB'], weight: 50 },
      { name: 'RAM DDR4 16GB Kit', slug: 'ram-ddr4-16gb-kit', description: 'Memory kit DDR4 16GB (2x8GB) 3200MHz', price: 850000, stock: 25, categoryId: catMap['ram-memory'], images: ['https://via.placeholder.com/300x300?text=DDR4+16GB'], weight: 100 },
      { name: 'RAM DDR5 32GB', slug: 'ram-ddr5-32gb', description: 'Memory DDR5 32GB 5600MHz high performance', price: 2200000, stock: 12, categoryId: catMap['ram-memory'], images: ['https://via.placeholder.com/300x300?text=DDR5+32GB'], weight: 80 },
      { name: 'RAM Laptop DDR4 8GB', slug: 'ram-laptop-ddr4-8gb', description: 'Memory laptop SO-DIMM DDR4 8GB 2666MHz', price: 420000, stock: 35, categoryId: catMap['ram-memory'], images: ['https://via.placeholder.com/300x300?text=Laptop+RAM'], weight: 30 },

      // Processor (4 products)
      { name: 'Intel Core i5-12400F', slug: 'intel-core-i5-12400f', description: 'Processor Intel Core i5 gen 12 6-core 12-thread', price: 2850000, stock: 15, categoryId: catMap['processor'], images: ['https://via.placeholder.com/300x300?text=Intel+i5'], weight: 100 },
      { name: 'AMD Ryzen 5 5600X', slug: 'amd-ryzen-5-5600x', description: 'Processor AMD Ryzen 5 6-core 12-thread', price: 3200000, stock: 12, categoryId: catMap['processor'], images: ['https://via.placeholder.com/300x300?text=Ryzen+5'], weight: 120 },
      { name: 'Intel Core i7-12700K', slug: 'intel-core-i7-12700k', description: 'Processor Intel Core i7 gen 12 12-core 20-thread', price: 5500000, stock: 8, categoryId: catMap['processor'], images: ['https://via.placeholder.com/300x300?text=Intel+i7'], weight: 150 },
      { name: 'AMD Ryzen 9 5900X', slug: 'amd-ryzen-9-5900x', description: 'Processor AMD Ryzen 9 12-core 24-thread', price: 7200000, stock: 6, categoryId: catMap['processor'], images: ['https://via.placeholder.com/300x300?text=Ryzen+9'], weight: 180 },

      // Graphics Card (4 products)
      { name: 'NVIDIA RTX 3060', slug: 'nvidia-rtx-3060', description: 'Graphics card RTX 3060 12GB GDDR6', price: 6500000, stock: 10, categoryId: catMap['graphics-card'], images: ['https://via.placeholder.com/300x300?text=RTX+3060'], weight: 1200 },
      { name: 'AMD RX 6600 XT', slug: 'amd-rx-6600-xt', description: 'Graphics card RX 6600 XT 8GB GDDR6', price: 5800000, stock: 8, categoryId: catMap['graphics-card'], images: ['https://via.placeholder.com/300x300?text=RX+6600XT'], weight: 1100 },
      { name: 'NVIDIA RTX 4070', slug: 'nvidia-rtx-4070', description: 'Graphics card RTX 4070 12GB GDDR6X', price: 9500000, stock: 6, categoryId: catMap['graphics-card'], images: ['https://via.placeholder.com/300x300?text=RTX+4070'], weight: 1300 },
      { name: 'NVIDIA GTX 1660 Super', slug: 'nvidia-gtx-1660-super', description: 'Graphics card GTX 1660 Super 6GB GDDR6', price: 3800000, stock: 12, categoryId: catMap['graphics-card'], images: ['https://via.placeholder.com/300x300?text=GTX+1660S'], weight: 950 }
    ];

    await Product.insertMany(products);
    console.log('✅ Added', products.length, 'new products');

    const totalProducts = await Product.countDocuments();
    console.log('📊 Total products in database:', totalProducts);

    // Show count per category
    for (const cat of categories) {
      const count = await Product.countDocuments({ categoryId: cat._id });
      if (count > 0) {
        console.log(`📦 ${cat.name}: ${count} products`);
      }
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

add50Products();
