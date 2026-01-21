const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Connect to MongoDB (same as .env.local)
mongoose.connect('mongodb://localhost:27017/inter-media-app');

// Define schemas directly
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['admin', 'kasir', 'customer'], default: 'customer' },
  phone: { type: String },
  address: { type: String },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

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

const paymentInfoSchema = new mongoose.Schema({
  bankName: { type: String, required: true },
  accountNumber: { type: String, required: true },
  accountName: { type: String, required: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const Category = mongoose.model('Category', categorySchema);
const Product = mongoose.model('Product', productSchema);
const PaymentInfo = mongoose.model('PaymentInfo', paymentInfoSchema);

async function setupDatabase() {
  try {
    console.log('🔄 Setting up database...');

    // 1. Create Admin User
    await User.deleteOne({ email: 'admin@test.com' });
    const hashedPassword = await bcrypt.hash('123456', 12);
    
    const admin = await User.create({
      name: 'Admin Test',
      email: 'admin@test.com',
      passwordHash: hashedPassword,
      role: 'admin',
      phone: '081234567890',
      address: 'Test Address',
      isActive: true
    });
    console.log('✅ Admin user created');

    // 2. Create Categories
    await Category.deleteMany({});
    const categories = await Category.insertMany([
      { name: 'Elektronik', slug: 'elektronik' },
      { name: 'Fashion', slug: 'fashion' },
      { name: 'Rumah Tangga', slug: 'rumah-tangga' },
      { name: 'Olahraga', slug: 'olahraga' },
      { name: 'Buku', slug: 'buku' }
    ]);
    console.log('✅ Categories created:', categories.length);

    // 3. Create Sample Products
    await Product.deleteMany({});
    const products = await Product.insertMany([
      {
        name: 'Smartphone Android',
        slug: 'smartphone-android',
        description: 'Smartphone Android terbaru dengan fitur lengkap',
        price: 2500000,
        stock: 50,
        categoryId: categories[0]._id,
        images: ['/images/phone1.jpg'],
        isActive: true,
        weight: 200,
        dimensions: '15x7x0.8 cm'
      },
      {
        name: 'Laptop Gaming',
        slug: 'laptop-gaming',
        description: 'Laptop gaming dengan spesifikasi tinggi',
        price: 15000000,
        stock: 20,
        categoryId: categories[0]._id,
        images: ['/images/laptop1.jpg'],
        isActive: true,
        weight: 2500,
        dimensions: '35x25x2 cm'
      },
      {
        name: 'Kaos Polo',
        slug: 'kaos-polo',
        description: 'Kaos polo berkualitas tinggi',
        price: 150000,
        stock: 100,
        categoryId: categories[1]._id,
        images: ['/images/polo1.jpg'],
        isActive: true,
        weight: 200,
        dimensions: 'Size M'
      }
    ]);
    console.log('✅ Products created:', products.length);

    // 4. Create Payment Info
    await PaymentInfo.deleteMany({});
    const paymentInfo = await PaymentInfo.create({
      bankName: 'Bank BCA',
      accountNumber: '1234567890',
      accountName: 'Inter Media Store',
      isActive: true
    });
    console.log('✅ Payment info created');

    console.log('🎉 Database setup completed successfully!');
    console.log('\n📋 Login credentials:');
    console.log('Email: admin@test.com');
    console.log('Password: 123456');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting up database:', error);
    process.exit(1);
  }
}

setupDatabase();
