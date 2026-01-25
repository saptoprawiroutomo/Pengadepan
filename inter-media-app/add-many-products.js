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

async function addManyProducts() {
  try {
    console.log('🔄 Adding many products...');

    // Get categories
    const printerCat = await Category.findOne({ slug: 'printer' });
    const tintaCat = await Category.findOne({ slug: 'tinta-toner' });
    const kertasCat = await Category.findOne({ slug: 'kertas' });
    const aksesorissCat = await Category.findOne({ slug: 'aksesoris' });

    const products = [
      // Printer Category
      {
        name: 'Printer Epson L3110',
        slug: 'printer-epson-l3110',
        description: 'Printer inkjet multifungsi dengan sistem tinta infus built-in',
        price: 1650000,
        stock: 12,
        categoryId: printerCat._id,
        images: ['https://via.placeholder.com/300x300?text=Epson+L3110'],
        weight: 3900
      },
      {
        name: 'Printer Canon PIXMA G3010',
        slug: 'printer-canon-pixma-g3010',
        description: 'Printer wireless all-in-one dengan sistem tinta infus',
        price: 2150000,
        stock: 8,
        categoryId: printerCat._id,
        images: ['https://via.placeholder.com/300x300?text=Canon+G3010'],
        weight: 5800
      },
      {
        name: 'Printer HP LaserJet Pro M15w',
        slug: 'printer-hp-laserjet-pro-m15w',
        description: 'Printer laser monokrom wireless compact',
        price: 1450000,
        stock: 10,
        categoryId: printerCat._id,
        images: ['https://via.placeholder.com/300x300?text=HP+M15w'],
        weight: 3900
      },
      {
        name: 'Printer Brother DCP-T310',
        slug: 'printer-brother-dcp-t310',
        description: 'Printer inkjet multifungsi dengan sistem tinta infus',
        price: 1750000,
        stock: 6,
        categoryId: printerCat._id,
        images: ['https://via.placeholder.com/300x300?text=Brother+T310'],
        weight: 4200
      },

      // Tinta & Toner Category
      {
        name: 'Tinta Canon GI-790 Yellow',
        slug: 'tinta-canon-gi-790-yellow',
        description: 'Tinta original Canon warna kuning untuk printer seri G',
        price: 85000,
        stock: 40,
        categoryId: tintaCat._id,
        images: ['https://via.placeholder.com/300x300?text=Canon+Yellow'],
        weight: 100
      },
      {
        name: 'Tinta Epson 003 Black',
        slug: 'tinta-epson-003-black',
        description: 'Tinta original Epson hitam untuk printer seri L',
        price: 95000,
        stock: 35,
        categoryId: tintaCat._id,
        images: ['https://via.placeholder.com/300x300?text=Epson+Black'],
        weight: 120
      },
      {
        name: 'Tinta Epson 003 Cyan',
        slug: 'tinta-epson-003-cyan',
        description: 'Tinta original Epson cyan untuk printer seri L',
        price: 95000,
        stock: 30,
        categoryId: tintaCat._id,
        images: ['https://via.placeholder.com/300x300?text=Epson+Cyan'],
        weight: 120
      },
      {
        name: 'Toner HP 79A Black',
        slug: 'toner-hp-79a-black',
        description: 'Toner cartridge original HP untuk LaserJet Pro',
        price: 850000,
        stock: 15,
        categoryId: tintaCat._id,
        images: ['https://via.placeholder.com/300x300?text=HP+Toner'],
        weight: 600
      },

      // Kertas Category
      {
        name: 'Kertas A4 70gsm',
        slug: 'kertas-a4-70gsm',
        description: 'Kertas fotokopi A4 70gsm isi 500 lembar - ekonomis',
        price: 38000,
        stock: 150,
        categoryId: kertasCat._id,
        images: ['https://via.placeholder.com/300x300?text=Kertas+70gsm'],
        weight: 2300
      },
      {
        name: 'Kertas A4 100gsm',
        slug: 'kertas-a4-100gsm',
        description: 'Kertas premium A4 100gsm isi 500 lembar',
        price: 65000,
        stock: 80,
        categoryId: kertasCat._id,
        images: ['https://via.placeholder.com/300x300?text=Kertas+100gsm'],
        weight: 2800
      },
      {
        name: 'Kertas Photo Glossy A4',
        slug: 'kertas-photo-glossy-a4',
        description: 'Kertas foto glossy A4 230gsm isi 20 lembar',
        price: 45000,
        stock: 60,
        categoryId: kertasCat._id,
        images: ['https://via.placeholder.com/300x300?text=Photo+Paper'],
        weight: 400
      },
      {
        name: 'Kertas F4 80gsm',
        slug: 'kertas-f4-80gsm',
        description: 'Kertas fotokopi F4 80gsm isi 500 lembar',
        price: 52000,
        stock: 90,
        categoryId: kertasCat._id,
        images: ['https://via.placeholder.com/300x300?text=Kertas+F4'],
        weight: 2700
      },

      // Aksesoris Category
      {
        name: 'Kabel Power Printer',
        slug: 'kabel-power-printer',
        description: 'Kabel power universal untuk printer panjang 1.5m',
        price: 35000,
        stock: 25,
        categoryId: aksesorissCat._id,
        images: ['https://via.placeholder.com/300x300?text=Power+Cable'],
        weight: 300
      },
      {
        name: 'Cleaning Kit Printer',
        slug: 'cleaning-kit-printer',
        description: 'Set pembersih printer lengkap dengan cairan dan kain',
        price: 75000,
        stock: 20,
        categoryId: aksesorissCat._id,
        images: ['https://via.placeholder.com/300x300?text=Cleaning+Kit'],
        weight: 500
      },
      {
        name: 'Paper Tray Tambahan',
        slug: 'paper-tray-tambahan',
        description: 'Baki kertas tambahan untuk printer kapasitas 250 lembar',
        price: 450000,
        stock: 8,
        categoryId: aksesorissCat._id,
        images: ['https://via.placeholder.com/300x300?text=Paper+Tray'],
        weight: 1200
      },
      {
        name: 'Stand Printer',
        slug: 'stand-printer',
        description: 'Meja khusus printer dengan rak penyimpanan',
        price: 350000,
        stock: 12,
        categoryId: aksesorissCat._id,
        images: ['https://via.placeholder.com/300x300?text=Printer+Stand'],
        weight: 8000
      }
    ];

    await Product.insertMany(products);
    console.log('✅ Added', products.length, 'new products');

    const totalProducts = await Product.countDocuments();
    console.log('📊 Total products in database:', totalProducts);

    // Show count per category
    for (const cat of [printerCat, tintaCat, kertasCat, aksesorissCat]) {
      const count = await Product.countDocuments({ categoryId: cat._id });
      console.log(`📦 ${cat.name}: ${count} products`);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

addManyProducts();
