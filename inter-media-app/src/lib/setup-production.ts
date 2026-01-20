// Production database setup
import connectDB from '@/lib/db';
import User from '@/models/User';
import Product from '@/models/Product';
import bcrypt from 'bcryptjs';

export async function setupProductionDB() {
  try {
    await connectDB();
    
    // Create admin user if not exists
    const adminExists = await User.findOne({ email: 'admin@intermedia.com' });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 12);
      await User.create({
        email: 'admin@intermedia.com',
        password: hashedPassword,
        name: 'Admin Inter Media',
        role: 'admin',
        isActive: true
      });
    }

    // Create kasir user if not exists
    const kasirExists = await User.findOne({ email: 'kasir@intermedia.com' });
    if (!kasirExists) {
      const hashedPassword = await bcrypt.hash('kasir123', 12);
      await User.create({
        email: 'kasir@intermedia.com',
        password: hashedPassword,
        name: 'Kasir Inter Media',
        role: 'kasir',
        isActive: true
      });
    }

    // Create sample products if none exist
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      await Product.insertMany([
        {
          name: 'Canon PIXMA G2010',
          slug: 'canon-pixma-g2010',
          description: 'Printer inkjet multifungsi dengan sistem tinta refill',
          price: 2500000,
          category: 'printer',
          stock: 10,
          images: ['/images/printer-canon.jpg'],
          isActive: true
        },
        {
          name: 'HP LaserJet Pro M404n',
          slug: 'hp-laserjet-pro-m404n',
          description: 'Printer laser monokrom untuk kantor',
          price: 3200000,
          category: 'printer',
          stock: 5,
          images: ['/images/printer-hp.jpg'],
          isActive: true
        }
      ]);
    }

    return { success: true };
  } catch (error) {
    console.error('Production DB setup error:', error);
    return { success: false, error };
  }
}
