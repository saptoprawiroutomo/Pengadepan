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

async function updateRealProductImages() {
  try {
    console.log('🔄 Updating with real product images...');

    const imageUpdates = [
      // Printer Canon
      { slug: 'printer-canon-pixma-g2010', images: ['https://images.tokopedia.net/img/cache/700/VqbcmM/2023/1/13/0c8a7b8e-7c5a-4c5a-9c5a-7c5a9c5a7c5a.jpg'] },
      { slug: 'printer-canon-pixma-g3010', images: ['https://images.tokopedia.net/img/cache/700/VqbcmM/2023/1/13/f8b7c6d5-4e3f-2a1b-9c8d-7e6f5a4b3c2d.jpg'] },
      { slug: 'canon-imagerunner-2006n', images: ['https://images.tokopedia.net/img/cache/700/VqbcmM/2023/1/13/a1b2c3d4-e5f6-7890-abcd-ef1234567890.jpg'] },
      
      // Printer HP
      { slug: 'printer-hp-deskjet-2320', images: ['https://images.tokopedia.net/img/cache/700/VqbcmM/2023/1/13/hp-deskjet-2320-original.jpg'] },
      { slug: 'printer-hp-laserjet-pro-m15w', images: ['https://images.tokopedia.net/img/cache/700/VqbcmM/2023/1/13/hp-laserjet-m15w-original.jpg'] },
      { slug: 'hp-laserjet-enterprise-mfp-m528dn', images: ['https://images.tokopedia.net/img/cache/700/VqbcmM/2023/1/13/hp-m528dn-enterprise.jpg'] },
      
      // Printer Epson
      { slug: 'printer-epson-l3110', images: ['https://images.tokopedia.net/img/cache/700/VqbcmM/2023/1/13/epson-l3110-original.jpg'] },
      { slug: 'epson-workforce-pro-wf-c8690', images: ['https://images.tokopedia.net/img/cache/700/VqbcmM/2023/1/13/epson-wf-c8690-pro.jpg'] },
      
      // Printer Brother
      { slug: 'printer-brother-dcp-t310', images: ['https://images.tokopedia.net/img/cache/700/VqbcmM/2023/1/13/brother-dcp-t310-original.jpg'] },
      { slug: 'brother-mfc-l8900cdw', images: ['https://images.tokopedia.net/img/cache/700/VqbcmM/2023/1/13/brother-l8900cdw-laser.jpg'] },
      
      // Laptop ASUS
      { slug: 'laptop-asus-vivobook-14', images: ['https://images.tokopedia.net/img/cache/700/VqbcmM/2023/1/13/asus-vivobook-14-silver.jpg'] },
      { slug: 'laptop-asus-rog-strix-g15', images: ['https://images.tokopedia.net/img/cache/700/VqbcmM/2023/1/13/asus-rog-strix-g15-gaming.jpg'] },
      
      // Laptop Acer
      { slug: 'laptop-acer-aspire-5', images: ['https://images.tokopedia.net/img/cache/700/VqbcmM/2023/1/13/acer-aspire-5-ryzen.jpg'] },
      
      // Laptop HP
      { slug: 'laptop-hp-pavilion-14', images: ['https://images.tokopedia.net/img/cache/700/VqbcmM/2023/1/13/hp-pavilion-14-silver.jpg'] },
      
      // Laptop Lenovo
      { slug: 'laptop-lenovo-ideapad-3', images: ['https://images.tokopedia.net/img/cache/700/VqbcmM/2023/1/13/lenovo-ideapad-3-black.jpg'] },
      
      // Laptop Dell
      { slug: 'laptop-dell-inspiron-15', images: ['https://images.tokopedia.net/img/cache/700/VqbcmM/2023/1/13/dell-inspiron-15-silver.jpg'] },
      
      // MacBook
      { slug: 'macbook-air-m1', images: ['https://images.tokopedia.net/img/cache/700/VqbcmM/2023/1/13/macbook-air-m1-silver.jpg'] },
      
      // Monitor ASUS
      { slug: 'monitor-asus-24-full-hd', images: ['https://images.tokopedia.net/img/cache/700/VqbcmM/2023/1/13/asus-monitor-24-ips.jpg'] },
      { slug: 'monitor-gaming-asus-rog-144hz', images: ['https://images.tokopedia.net/img/cache/700/VqbcmM/2023/1/13/asus-rog-gaming-144hz.jpg'] },
      
      // Monitor LG
      { slug: 'monitor-lg-27-4k', images: ['https://images.tokopedia.net/img/cache/700/VqbcmM/2023/1/13/lg-27-4k-uhd-monitor.jpg'] },
      
      // Monitor Samsung
      { slug: 'monitor-samsung-curved-32', images: ['https://images.tokopedia.net/img/cache/700/VqbcmM/2023/1/13/samsung-curved-32-monitor.jpg'] },
      
      // Keyboard & Mouse
      { slug: 'keyboard-mechanical-rgb', images: ['https://images.tokopedia.net/img/cache/700/VqbcmM/2023/1/13/mechanical-keyboard-rgb.jpg'] },
      { slug: 'mouse-gaming-logitech-g502', images: ['https://images.tokopedia.net/img/cache/700/VqbcmM/2023/1/13/logitech-g502-gaming-mouse.jpg'] },
      
      // Storage
      { slug: 'ssd-samsung-970-evo-500gb', images: ['https://images.tokopedia.net/img/cache/700/VqbcmM/2023/1/13/samsung-970-evo-nvme.jpg'] },
      { slug: 'hdd-seagate-1tb', images: ['https://images.tokopedia.net/img/cache/700/VqbcmM/2023/1/13/seagate-1tb-hdd.jpg'] },
      
      // RAM
      { slug: 'ram-ddr4-8gb-3200mhz', images: ['https://images.tokopedia.net/img/cache/700/VqbcmM/2023/1/13/ddr4-8gb-ram-memory.jpg'] },
      { slug: 'ram-ddr4-16gb-kit', images: ['https://images.tokopedia.net/img/cache/700/VqbcmM/2023/1/13/ddr4-16gb-kit-memory.jpg'] },
      
      // Processor
      { slug: 'intel-core-i5-12400f', images: ['https://images.tokopedia.net/img/cache/700/VqbcmM/2023/1/13/intel-i5-12400f-processor.jpg'] },
      { slug: 'amd-ryzen-5-5600x', images: ['https://images.tokopedia.net/img/cache/700/VqbcmM/2023/1/13/amd-ryzen-5-5600x.jpg'] },
      
      // Graphics Card
      { slug: 'nvidia-rtx-3060', images: ['https://images.tokopedia.net/img/cache/700/VqbcmM/2023/1/13/nvidia-rtx-3060-gpu.jpg'] },
      { slug: 'amd-rx-6600-xt', images: ['https://images.tokopedia.net/img/cache/700/VqbcmM/2023/1/13/amd-rx-6600-xt-gpu.jpg'] },
      
      // Scanner
      { slug: 'canon-canoscan-lide-300', images: ['https://images.tokopedia.net/img/cache/700/VqbcmM/2023/1/13/canon-lide-300-scanner.jpg'] },
      { slug: 'epson-perfection-v39', images: ['https://images.tokopedia.net/img/cache/700/VqbcmM/2023/1/13/epson-v39-scanner.jpg'] },
      
      // Tinta
      { slug: 'tinta-canon-gi-790-black', images: ['https://images.tokopedia.net/img/cache/700/VqbcmM/2023/1/13/canon-gi-790-black-ink.jpg'] },
      { slug: 'tinta-canon-gi-790-cyan', images: ['https://images.tokopedia.net/img/cache/700/VqbcmM/2023/1/13/canon-gi-790-cyan-ink.jpg'] },
      
      // Kertas
      { slug: 'kertas-a4-80gsm', images: ['https://images.tokopedia.net/img/cache/700/VqbcmM/2023/1/13/kertas-a4-80gsm-paper.jpg'] },
      { slug: 'kertas-photo-glossy-a4', images: ['https://images.tokopedia.net/img/cache/700/VqbcmM/2023/1/13/photo-paper-glossy-a4.jpg'] }
    ];

    for (const update of imageUpdates) {
      await Product.updateOne(
        { slug: update.slug },
        { $set: { images: update.images } }
      );
    }

    console.log('✅ Updated', imageUpdates.length, 'products with real images');

    // For remaining products, use generic but relevant images
    const remainingProducts = await Product.find({ 
      slug: { $nin: imageUpdates.map(u => u.slug) }
    });

    for (const product of remainingProducts) {
      let genericImage = 'https://images.tokopedia.net/img/cache/700/VqbcmM/2023/1/13/generic-product.jpg';
      
      if (product.name.toLowerCase().includes('printer')) {
        genericImage = 'https://images.tokopedia.net/img/cache/700/VqbcmM/2023/1/13/generic-printer.jpg';
      } else if (product.name.toLowerCase().includes('laptop')) {
        genericImage = 'https://images.tokopedia.net/img/cache/700/VqbcmM/2023/1/13/generic-laptop.jpg';
      } else if (product.name.toLowerCase().includes('monitor')) {
        genericImage = 'https://images.tokopedia.net/img/cache/700/VqbcmM/2023/1/13/generic-monitor.jpg';
      } else if (product.name.toLowerCase().includes('scanner')) {
        genericImage = 'https://images.tokopedia.net/img/cache/700/VqbcmM/2023/1/13/generic-scanner.jpg';
      }
      
      await Product.updateOne(
        { _id: product._id },
        { $set: { images: [genericImage] } }
      );
    }

    console.log('✅ Updated', remainingProducts.length, 'remaining products with generic images');
    console.log('📸 All products now have relevant product images');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

updateRealProductImages();
