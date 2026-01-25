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

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);
const Category = mongoose.model('Category', categorySchema);

async function updatePrinterStock() {
  try {
    console.log('🔄 Updating printer stock...');

    // Get printer categories
    const printerCat = await Category.findOne({ slug: 'printer' });
    const fotokopi = await Category.findOne({ slug: 'mesin-fotokopi' });

    // Printer besar (PO 1 bulan) - set stock to 0
    const printerBesar = [
      'canon-imagerunner-2006n',
      'xerox-workcentre-3025', 
      'ricoh-mp-2014ad',
      'sharp-ar-6020n',
      'kyocera-taskalfa-1800',
      'canon-imagerunner-advance-c3330i',
      'fuji-xerox-docucentre-sc2020',
      'konica-minolta-bizhub-287',
      'epson-workforce-pro-wf-c8690',
      'hp-laserjet-enterprise-mfp-m528dn',
      'samsung-proxpress-sl-m4580fx'
    ];

    await Product.updateMany(
      { slug: { $in: printerBesar } },
      { $set: { stock: 0 } }
    );

    // Printer kecil (ready stock max 10) - set random stock 1-10
    const printerKecil = [
      'printer-canon-pixma-g2010',
      'printer-hp-deskjet-2320', 
      'printer-epson-l3110',
      'printer-canon-pixma-g3010',
      'printer-hp-laserjet-pro-m15w',
      'printer-brother-dcp-t310',
      'brother-mfc-l8900cdw'
    ];

    for (const slug of printerKecil) {
      const randomStock = Math.floor(Math.random() * 10) + 1; // 1-10
      await Product.updateOne(
        { slug: slug },
        { $set: { stock: randomStock } }
      );
    }

    console.log('✅ Updated printer stock');

    // Show results
    const bigPrinters = await Product.find({ slug: { $in: printerBesar } });
    const smallPrinters = await Product.find({ slug: { $in: printerKecil } });

    console.log('\n📦 PRINTER BESAR (PO 1 Bulan):');
    bigPrinters.forEach(p => {
      console.log(`   ${p.name}: ${p.stock} unit (PO Required)`);
    });

    console.log('\n📦 PRINTER KECIL (Ready Stock):');
    smallPrinters.forEach(p => {
      console.log(`   ${p.name}: ${p.stock} unit`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

updatePrinterStock();
