import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Category from '@/models/Category';
import Product from '@/models/Product';
import PaymentInfo from '@/models/PaymentInfo';
import { hashPassword } from '@/lib/utils-server';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Create admin user
    const adminExists = await User.findOne({ email: 'admin@intermedia.com' });
    if (!adminExists) {
      await User.create({
        name: 'Admin Inter Medi-A',
        email: 'admin@intermedia.com',
        passwordHash: await hashPassword('admin123'),
        role: 'admin',
        phone: '081234567890',
        address: 'Kantor Inter Medi-A',
      });
    }

    // Create kasir user
    const kasirExists = await User.findOne({ email: 'kasir@intermedia.com' });
    if (!kasirExists) {
      await User.create({
        name: 'Kasir Inter Medi-A',
        email: 'kasir@intermedia.com',
        passwordHash: await hashPassword('kasir123'),
        role: 'kasir',
        phone: '081234567891',
        address: 'Kantor Inter Medi-A',
      });
    }

    // Create categories
    const categories = [
      { name: 'Printer', slug: 'printer' },
      { name: 'Fotocopy', slug: 'fotocopy' },
      { name: 'Komputer', slug: 'komputer' },
      { name: 'Aksesoris', slug: 'aksesoris' },
    ];

    const categoryDocs = [];
    for (const cat of categories) {
      let category = await Category.findOne({ slug: cat.slug });
      if (!category) {
        category = await Category.create(cat);
      }
      categoryDocs.push(category);
    }

    // Create sample products
    const sampleProducts = [
      {
        name: 'Canon PIXMA G2010',
        categoryId: categoryDocs[0]._id, // Printer
        price: 2500000,
        stock: 10,
        description: 'Printer inkjet multifungsi dengan sistem tinta refill'
      },
      {
        name: 'HP LaserJet Pro M15w',
        categoryId: categoryDocs[0]._id, // Printer
        price: 1800000,
        stock: 8,
        description: 'Printer laser monokrom wireless'
      },
      {
        name: 'Canon imageRUNNER 2006N',
        categoryId: categoryDocs[1]._id, // Fotocopy
        price: 15000000,
        stock: 3,
        description: 'Mesin fotocopy digital multifungsi'
      },
      {
        name: 'Laptop ASUS VivoBook 14',
        categoryId: categoryDocs[2]._id, // Komputer
        price: 8500000,
        stock: 5,
        description: 'Laptop dengan prosesor Intel Core i5'
      },
      {
        name: 'Tinta Canon GI-790',
        categoryId: categoryDocs[3]._id, // Aksesoris
        price: 85000,
        stock: 25,
        description: 'Tinta original Canon untuk printer seri G'
      }
    ];

    for (const productData of sampleProducts) {
      const slug = productData.name.toLowerCase().replace(/\s+/g, '-');
      const existingProduct = await Product.findOne({ slug });
      if (!existingProduct) {
        await Product.create({
          ...productData,
          slug,
          images: [],
          isActive: true
        });
      }
    }

    // Create payment info
    const paymentMethods = [
      {
        type: 'bank_transfer',
        bankName: 'Bank BCA',
        accountNumber: '1234567890',
        accountName: 'Inter Medi-A',
        instructions: 'Transfer ke rekening di atas dan kirim bukti transfer via WhatsApp ke 081234567890'
      },
      {
        type: 'bank_transfer', 
        bankName: 'Bank Mandiri',
        accountNumber: '0987654321',
        accountName: 'Inter Medi-A',
        instructions: 'Transfer ke rekening di atas dan kirim bukti transfer via WhatsApp ke 081234567890'
      }
    ];

    for (const paymentData of paymentMethods) {
      const existing = await PaymentInfo.findOne({ 
        type: paymentData.type, 
        bankName: paymentData.bankName 
      });
      if (!existing) {
        await PaymentInfo.create(paymentData);
      }
    }

    return NextResponse.json({ message: 'Seed data created successfully' });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
