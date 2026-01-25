const mongoose = require('mongoose');

// Connect to MongoDB Atlas
mongoose.connect('mongodb+srv://saptoprawiroutomo_db_user:1234qwer@cluster0.z3wyzso.mongodb.net/intermediadb?retryWrites=true&w=majority&appName=Cluster0');

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

async function addMoreProducts() {
  try {
    console.log('🔄 Adding more products...');

    // Get existing categories
    const categories = await Category.find({});
    if (categories.length === 0) {
      console.log('No categories found, creating some...');
      const newCategories = await Category.insertMany([
        { name: 'Printer', slug: 'printer' },
        { name: 'Tinta & Toner', slug: 'tinta-toner' },
        { name: 'Kertas', slug: 'kertas' },
        { name: 'Aksesoris', slug: 'aksesoris' }
      ]);
      console.log('✅ Categories created:', newCategories.length);
    }

    // Get or create categories
    let printerCat = await Category.findOne({ slug: 'printer' });
    let tintaCat = await Category.findOne({ slug: 'tinta-toner' });
    let kertasCat = await Category.findOne({ slug: 'kertas' });
    let aksesorissCat = await Category.findOne({ slug: 'aksesoris' });

    if (!printerCat) {
      printerCat = await Category.create({ name: 'Printer', slug: 'printer' });
    }
    if (!tintaCat) {
      tintaCat = await Category.create({ name: 'Tinta & Toner', slug: 'tinta-toner' });
    }
    if (!kertasCat) {
      kertasCat = await Category.create({ name: 'Kertas', slug: 'kertas' });
    }
    if (!aksesorissCat) {
      aksesorissCat = await Category.create({ name: 'Aksesoris', slug: 'aksesoris' });
    }

    // Add more products
    const newProducts = [
      {
        name: 'Printer Canon PIXMA G2010',
        slug: 'printer-canon-pixma-g2010',
        description: 'Printer inkjet multifungsi dengan sistem tinta infus',
        price: 1850000,
        stock: 15,
        categoryId: printerCat._id,
        images: ['https://via.placeholder.com/300x300?text=Canon+G2010'],
        weight: 3500,
        dimensions: '445 x 330 x 163 mm'
      },
      {
        name: 'Printer HP DeskJet 2320',
        slug: 'printer-hp-deskjet-2320',
        description: 'Printer inkjet all-in-one untuk kebutuhan rumah',
        price: 950000,
        stock: 20,
        categoryId: printerCat._id,
        images: ['https://via.placeholder.com/300x300?text=HP+2320'],
        weight: 2200,
        dimensions: '425 x 304 x 155 mm'
      },
      {
        name: 'Tinta Canon GI-790 Cyan',
        slug: 'tinta-canon-gi-790-cyan',
        description: 'Tinta original Canon warna cyan untuk printer seri G',
        price: 85000,
        stock: 50,
        categoryId: tintaCat._id,
        images: ['https://via.placeholder.com/300x300?text=Canon+Cyan'],
        weight: 100
      },
      {
        name: 'Tinta Canon GI-790 Magenta',
        slug: 'tinta-canon-gi-790-magenta',
        description: 'Tinta original Canon warna magenta untuk printer seri G',
        price: 85000,
        stock: 45,
        categoryId: tintaCat._id,
        images: ['https://via.placeholder.com/300x300?text=Canon+Magenta'],
        weight: 100
      },
      {
        name: 'Kertas A4 80gsm',
        slug: 'kertas-a4-80gsm',
        description: 'Kertas fotokopi A4 80gsm isi 500 lembar',
        price: 45000,
        stock: 100,
        categoryId: kertasCat._id,
        images: ['https://via.placeholder.com/300x300?text=Kertas+A4'],
        weight: 2500
      },
      {
        name: 'Kabel USB Printer',
        slug: 'kabel-usb-printer',
        description: 'Kabel USB 2.0 A to B untuk printer panjang 1.5m',
        price: 25000,
        stock: 30,
        categoryId: aksesorissCat._id,
        images: ['https://via.placeholder.com/300x300?text=USB+Cable'],
        weight: 200
      }
    ];

    await Product.insertMany(newProducts);
    console.log('✅ Added', newProducts.length, 'new products');

    const totalProducts = await Product.countDocuments();
    console.log('📊 Total products in database:', totalProducts);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

addMoreProducts();
