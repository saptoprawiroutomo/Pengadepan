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

async function addCopyMachineProducts() {
  try {
    console.log('🔄 Adding fotokopi dan komputer products...');

    // Create categories
    const categories = [
      { name: 'Mesin Fotokopi', slug: 'mesin-fotokopi' },
      { name: 'Scanner', slug: 'scanner' },
      { name: 'Fax Machine', slug: 'fax-machine' },
      { name: 'Laminating Machine', slug: 'laminating-machine' },
      { name: 'Paper Shredder', slug: 'paper-shredder' },
      { name: 'Binding Machine', slug: 'binding-machine' }
    ];

    for (const cat of categories) {
      const exists = await Category.findOne({ slug: cat.slug });
      if (!exists) {
        await Category.create(cat);
      }
    }

    const catMap = {};
    const allCats = await Category.find({});
    allCats.forEach(cat => {
      catMap[cat.slug] = cat._id;
    });

    const products = [
      // Mesin Fotokopi (12 products)
      {
        name: 'Canon imageRUNNER 2006N',
        slug: 'canon-imagerunner-2006n',
        description: 'Mesin fotokopi digital A3 monokrom 20 ppm dengan network',
        price: 18500000,
        stock: 8,
        categoryId: catMap['mesin-fotokopi'],
        images: ['https://via.placeholder.com/300x300?text=Canon+2006N'],
        weight: 32000,
        dimensions: '590 x 648 x 465 mm'
      },
      {
        name: 'Xerox WorkCentre 3025',
        slug: 'xerox-workcentre-3025',
        description: 'Mesin fotokopi multifungsi A4 print, copy, scan, fax',
        price: 4200000,
        stock: 15,
        categoryId: catMap['mesin-fotokopi'],
        images: ['https://via.placeholder.com/300x300?text=Xerox+3025'],
        weight: 12500,
        dimensions: '406 x 406 x 318 mm'
      },
      {
        name: 'Ricoh MP 2014AD',
        slug: 'ricoh-mp-2014ad',
        description: 'Mesin fotokopi digital A3 monokrom 20 ppm duplex',
        price: 16800000,
        stock: 6,
        categoryId: catMap['mesin-fotokopi'],
        images: ['https://via.placeholder.com/300x300?text=Ricoh+2014AD'],
        weight: 28000,
        dimensions: '587 x 659 x 486 mm'
      },
      {
        name: 'Sharp AR-6020N',
        slug: 'sharp-ar-6020n',
        description: 'Mesin fotokopi digital A3 monokrom 20 ppm network ready',
        price: 15200000,
        stock: 10,
        categoryId: catMap['mesin-fotokopi'],
        images: ['https://via.placeholder.com/300x300?text=Sharp+6020N'],
        weight: 30000,
        dimensions: '600 x 650 x 480 mm'
      },
      {
        name: 'Kyocera TASKalfa 1800',
        slug: 'kyocera-taskalfa-1800',
        description: 'Mesin fotokopi digital A3 monokrom 18 ppm ekonomis',
        price: 12500000,
        stock: 12,
        categoryId: catMap['mesin-fotokopi'],
        images: ['https://via.placeholder.com/300x300?text=Kyocera+1800'],
        weight: 25000,
        dimensions: '560 x 620 x 450 mm'
      },
      {
        name: 'Canon imageRUNNER ADVANCE C3330i',
        slug: 'canon-imagerunner-advance-c3330i',
        description: 'Mesin fotokopi warna A3 multifungsi 30 ppm',
        price: 45000000,
        stock: 4,
        categoryId: catMap['mesin-fotokopi'],
        images: ['https://via.placeholder.com/300x300?text=Canon+C3330i'],
        weight: 65000,
        dimensions: '615 x 685 x 760 mm'
      },
      {
        name: 'Fuji Xerox DocuCentre SC2020',
        slug: 'fuji-xerox-docucentre-sc2020',
        description: 'Mesin fotokopi warna A3 multifungsi 20 ppm',
        price: 28500000,
        stock: 6,
        categoryId: catMap['mesin-fotokopi'],
        images: ['https://via.placeholder.com/300x300?text=Xerox+SC2020'],
        weight: 45000,
        dimensions: '590 x 650 x 650 mm'
      },
      {
        name: 'Konica Minolta bizhub 287',
        slug: 'konica-minolta-bizhub-287',
        description: 'Mesin fotokopi digital A3 monokrom 28 ppm',
        price: 22000000,
        stock: 8,
        categoryId: catMap['mesin-fotokopi'],
        images: ['https://via.placeholder.com/300x300?text=Minolta+287'],
        weight: 38000,
        dimensions: '587 x 650 x 586 mm'
      },
      {
        name: 'Brother MFC-L8900CDW',
        slug: 'brother-mfc-l8900cdw',
        description: 'Mesin fotokopi laser warna A4 multifungsi wireless',
        price: 8500000,
        stock: 10,
        categoryId: catMap['mesin-fotokopi'],
        images: ['https://via.placeholder.com/300x300?text=Brother+L8900'],
        weight: 24000,
        dimensions: '483 x 520 x 413 mm'
      },
      {
        name: 'HP LaserJet Enterprise MFP M528dn',
        slug: 'hp-laserjet-enterprise-mfp-m528dn',
        description: 'Mesin fotokopi laser A4 enterprise 43 ppm duplex',
        price: 12800000,
        stock: 7,
        categoryId: catMap['mesin-fotokopi'],
        images: ['https://via.placeholder.com/300x300?text=HP+M528dn'],
        weight: 22000,
        dimensions: '420 x 516 x 457 mm'
      },
      {
        name: 'Epson WorkForce Pro WF-C8690',
        slug: 'epson-workforce-pro-wf-c8690',
        description: 'Mesin fotokopi inkjet warna A3 multifungsi',
        price: 18500000,
        stock: 5,
        categoryId: catMap['mesin-fotokopi'],
        images: ['https://via.placeholder.com/300x300?text=Epson+C8690'],
        weight: 35000,
        dimensions: '617 x 691 x 378 mm'
      },
      {
        name: 'Samsung ProXpress SL-M4580FX',
        slug: 'samsung-proxpress-sl-m4580fx',
        description: 'Mesin fotokopi laser A4 multifungsi 45 ppm',
        price: 9800000,
        stock: 9,
        categoryId: catMap['mesin-fotokopi'],
        images: ['https://via.placeholder.com/300x300?text=Samsung+M4580'],
        weight: 18500,
        dimensions: '417 x 498 x 455 mm'
      },

      // Scanner (6 products)
      {
        name: 'Canon CanoScan LiDE 300',
        slug: 'canon-canoscan-lide-300',
        description: 'Scanner flatbed A4 2400x4800 dpi USB powered',
        price: 850000,
        stock: 25,
        categoryId: catMap['scanner'],
        images: ['https://via.placeholder.com/300x300?text=Canon+LiDE300'],
        weight: 1700,
        dimensions: '250 x 367 x 42 mm'
      },
      {
        name: 'Epson Perfection V39',
        slug: 'epson-perfection-v39',
        description: 'Scanner flatbed A4 4800x9600 dpi dengan software OCR',
        price: 1200000,
        stock: 20,
        categoryId: catMap['scanner'],
        images: ['https://via.placeholder.com/300x300?text=Epson+V39'],
        weight: 1800,
        dimensions: '249 x 364 x 39 mm'
      },
      {
        name: 'Fujitsu ScanSnap iX1600',
        slug: 'fujitsu-scansnap-ix1600',
        description: 'Scanner dokumen ADF 40 ppm duplex wireless',
        price: 6500000,
        stock: 12,
        categoryId: catMap['scanner'],
        images: ['https://via.placeholder.com/300x300?text=Fujitsu+iX1600'],
        weight: 3400,
        dimensions: '292 x 161 x 168 mm'
      },
      {
        name: 'HP ScanJet Pro 2500 f1',
        slug: 'hp-scanjet-pro-2500-f1',
        description: 'Scanner flatbed A4 dengan ADF 1200x1200 dpi',
        price: 2800000,
        stock: 15,
        categoryId: catMap['scanner'],
        images: ['https://via.placeholder.com/300x300?text=HP+2500f1'],
        weight: 4200,
        dimensions: '431 x 297 x 103 mm'
      },
      {
        name: 'Brother ADS-2700W',
        slug: 'brother-ads-2700w',
        description: 'Scanner dokumen ADF 35 ppm duplex wireless',
        price: 4200000,
        stock: 10,
        categoryId: catMap['scanner'],
        images: ['https://via.placeholder.com/300x300?text=Brother+ADS2700'],
        weight: 2900,
        dimensions: '299 x 220 x 158 mm'
      },
      {
        name: 'Plustek OpticBook 4800',
        slug: 'plustek-opticbook-4800',
        description: 'Scanner buku A4 khusus untuk scan buku tebal',
        price: 3500000,
        stock: 8,
        categoryId: catMap['scanner'],
        images: ['https://via.placeholder.com/300x300?text=Plustek+4800'],
        weight: 2100,
        dimensions: '290 x 480 x 65 mm'
      },

      // Fax Machine (4 products)
      {
        name: 'Brother FAX-2840',
        slug: 'brother-fax-2840',
        description: 'Mesin fax laser dengan telepon dan copier',
        price: 1850000,
        stock: 15,
        categoryId: catMap['fax-machine'],
        images: ['https://via.placeholder.com/300x300?text=Brother+FAX2840'],
        weight: 4800,
        dimensions: '360 x 385 x 253 mm'
      },
      {
        name: 'Panasonic KX-FT987CX',
        slug: 'panasonic-kx-ft987cx',
        description: 'Mesin fax thermal dengan caller ID dan copier',
        price: 1200000,
        stock: 20,
        categoryId: catMap['fax-machine'],
        images: ['https://via.placeholder.com/300x300?text=Panasonic+FT987'],
        weight: 2100,
        dimensions: '350 x 280 x 170 mm'
      },
      {
        name: 'Canon FAXPHONE L190',
        slug: 'canon-faxphone-l190',
        description: 'Mesin fax laser dengan ADF dan memory backup',
        price: 2200000,
        stock: 12,
        categoryId: catMap['fax-machine'],
        images: ['https://via.placeholder.com/300x300?text=Canon+L190'],
        weight: 5200,
        dimensions: '390 x 350 x 280 mm'
      },
      {
        name: 'Sharp UX-P200',
        slug: 'sharp-ux-p200',
        description: 'Mesin fax thermal compact dengan telepon',
        price: 950000,
        stock: 18,
        categoryId: catMap['fax-machine'],
        images: ['https://via.placeholder.com/300x300?text=Sharp+UXP200'],
        weight: 1800,
        dimensions: '320 x 250 x 150 mm'
      },

      // Laminating Machine (4 products)
      {
        name: 'GBC Fusion 3000L A3',
        slug: 'gbc-fusion-3000l-a3',
        description: 'Mesin laminating A3 hot/cold dengan auto shut-off',
        price: 2500000,
        stock: 10,
        categoryId: catMap['laminating-machine'],
        images: ['https://via.placeholder.com/300x300?text=GBC+Fusion'],
        weight: 3200,
        dimensions: '520 x 180 x 120 mm'
      },
      {
        name: 'Fellowes Saturn 3i A3',
        slug: 'fellowes-saturn-3i-a3',
        description: 'Mesin laminating A3 dengan teknologi InstaHeat',
        price: 1800000,
        stock: 12,
        categoryId: catMap['laminating-machine'],
        images: ['https://via.placeholder.com/300x300?text=Fellowes+Saturn'],
        weight: 2800,
        dimensions: '480 x 160 x 110 mm'
      },
      {
        name: 'Laminator A4 Desktop',
        slug: 'laminator-a4-desktop',
        description: 'Mesin laminating A4 desktop untuk office kecil',
        price: 450000,
        stock: 25,
        categoryId: catMap['laminating-machine'],
        images: ['https://via.placeholder.com/300x300?text=Laminator+A4'],
        weight: 1200,
        dimensions: '350 x 120 x 80 mm'
      },
      {
        name: 'Royal Sovereign RSL-2701',
        slug: 'royal-sovereign-rsl-2701',
        description: 'Mesin laminating A3 professional dengan roller adjustment',
        price: 3200000,
        stock: 8,
        categoryId: catMap['laminating-machine'],
        images: ['https://via.placeholder.com/300x300?text=Royal+RSL2701'],
        weight: 4500,
        dimensions: '550 x 200 x 140 mm'
      },

      // Paper Shredder (4 products)
      {
        name: 'Fellowes Powershred 79Ci',
        slug: 'fellowes-powershred-79ci',
        description: 'Mesin penghancur kertas cross-cut 16 lembar',
        price: 2800000,
        stock: 12,
        categoryId: catMap['paper-shredder'],
        images: ['https://via.placeholder.com/300x300?text=Fellowes+79Ci'],
        weight: 12000,
        dimensions: '350 x 600 x 280 mm'
      },
      {
        name: 'GBC ShredMaster 22SM',
        slug: 'gbc-shredmaster-22sm',
        description: 'Mesin penghancur kertas strip-cut 22 lembar',
        price: 1500000,
        stock: 15,
        categoryId: catMap['paper-shredder'],
        images: ['https://via.placeholder.com/300x300?text=GBC+22SM'],
        weight: 8500,
        dimensions: '320 x 480 x 250 mm'
      },
      {
        name: 'Dahle 20314 CleanTEC',
        slug: 'dahle-20314-cleantec',
        description: 'Mesin penghancur kertas micro-cut dengan filter udara',
        price: 4500000,
        stock: 8,
        categoryId: catMap['paper-shredder'],
        images: ['https://via.placeholder.com/300x300?text=Dahle+CleanTEC'],
        weight: 15000,
        dimensions: '380 x 650 x 320 mm'
      },
      {
        name: 'Rexel Momentum X410',
        slug: 'rexel-momentum-x410',
        description: 'Mesin penghancur kertas cross-cut 10 lembar desktop',
        price: 850000,
        stock: 20,
        categoryId: catMap['paper-shredder'],
        images: ['https://via.placeholder.com/300x300?text=Rexel+X410'],
        weight: 4200,
        dimensions: '280 x 380 x 200 mm'
      },

      // Binding Machine (4 products)
      {
        name: 'GBC CombBind C800pro',
        slug: 'gbc-combbind-c800pro',
        description: 'Mesin jilid spiral plastik kapasitas 500 lembar',
        price: 3500000,
        stock: 10,
        categoryId: catMap['binding-machine'],
        images: ['https://via.placeholder.com/300x300?text=GBC+C800pro'],
        weight: 8500,
        dimensions: '450 x 350 x 200 mm'
      },
      {
        name: 'Fellowes Galaxy 500',
        slug: 'fellowes-galaxy-500',
        description: 'Mesin jilid spiral kawat kapasitas 500 lembar',
        price: 4200000,
        stock: 8,
        categoryId: catMap['binding-machine'],
        images: ['https://via.placeholder.com/300x300?text=Fellowes+Galaxy'],
        weight: 12000,
        dimensions: '480 x 380 x 220 mm'
      },
      {
        name: 'Binding Machine A4 Manual',
        slug: 'binding-machine-a4-manual',
        description: 'Mesin jilid manual A4 untuk spiral plastik',
        price: 650000,
        stock: 18,
        categoryId: catMap['binding-machine'],
        images: ['https://via.placeholder.com/300x300?text=Manual+Binding'],
        weight: 2500,
        dimensions: '350 x 280 x 150 mm'
      },
      {
        name: 'Renz DTP 340M',
        slug: 'renz-dtp-340m',
        description: 'Mesin jilid kawat ganda profesional semi-otomatis',
        price: 8500000,
        stock: 5,
        categoryId: catMap['binding-machine'],
        images: ['https://via.placeholder.com/300x300?text=Renz+DTP340'],
        weight: 18000,
        dimensions: '520 x 420 x 280 mm'
      }
    ];

    await Product.insertMany(products);
    console.log('✅ Added', products.length, 'fotokopi & office machine products');

    const totalProducts = await Product.countDocuments();
    console.log('📊 Total products in database:', totalProducts);

    // Show new categories count
    const newCats = ['mesin-fotokopi', 'scanner', 'fax-machine', 'laminating-machine', 'paper-shredder', 'binding-machine'];
    for (const slug of newCats) {
      const cat = await Category.findOne({ slug });
      const count = await Product.countDocuments({ categoryId: cat._id });
      console.log(`📦 ${cat.name}: ${count} products`);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

addCopyMachineProducts();
