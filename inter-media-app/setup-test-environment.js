#!/usr/bin/env node

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Define schemas directly since we can't import TS modules
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['admin', 'kasir', 'customer'], default: 'customer' },
  phone: { type: String },
  birthDate: { type: Date },
  gender: { type: String, enum: ['Laki-laki', 'Perempuan'] },
  idNumber: { type: String },
  address: { type: String },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
}, { timestamps: true });

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  stock: { type: Number, required: true, default: 0 },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  images: [{ type: String }],
  slug: { type: String, required: true, unique: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const paymentInfoSchema = new mongoose.Schema({
  bankName: { type: String, required: true },
  accountNumber: { type: String, required: true },
  accountName: { type: String, required: true },
}, { timestamps: true });

// Create models
const User = mongoose.models.User || mongoose.model('User', userSchema);
const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);
const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
const PaymentInfo = mongoose.models.PaymentInfo || mongoose.model('PaymentInfo', paymentInfoSchema);

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/inter-media-app';

async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    return false;
  }
}

async function setupTestData() {
  console.log('🔧 Setting up test environment...');
  
  try {
    // Create admin user
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      await User.create({
        name: 'Admin User',
        email: 'admin@intermedia.com',
        passwordHash: await bcrypt.hash('admin123', 12),
        role: 'admin'
      });
      console.log('✅ Admin user created');
    } else {
      console.log('✅ Admin user already exists');
    }
    
    // Create test categories
    const categories = [
      { name: 'Laptop', description: 'Laptop dan notebook' },
      { name: 'Desktop', description: 'Komputer desktop' },
      { name: 'Aksesoris', description: 'Aksesoris komputer' },
      { name: 'Service', description: 'Layanan service' }
    ];
    
    for (const cat of categories) {
      await Category.findOneAndUpdate(
        { name: cat.name },
        cat,
        { upsert: true }
      );
    }
    console.log('✅ Categories created');
    
    // Create test products
    const laptopCategory = await Category.findOne({ name: 'Laptop' });
    const desktopCategory = await Category.findOne({ name: 'Desktop' });
    const accessoryCategory = await Category.findOne({ name: 'Aksesoris' });
    
    const products = [
      {
        name: 'Laptop ASUS VivoBook',
        description: 'Laptop ASUS VivoBook dengan processor Intel Core i5',
        price: 8500000,
        stock: 10,
        categoryId: laptopCategory._id,
        slug: 'laptop-asus-vivobook',
        images: ['https://via.placeholder.com/300x300?text=ASUS+VivoBook']
      },
      {
        name: 'PC Desktop Gaming',
        description: 'PC Desktop untuk gaming dengan spesifikasi tinggi',
        price: 12000000,
        stock: 5,
        categoryId: desktopCategory._id,
        slug: 'pc-desktop-gaming',
        images: ['https://via.placeholder.com/300x300?text=Gaming+PC']
      },
      {
        name: 'Mouse Gaming RGB',
        description: 'Mouse gaming dengan lampu RGB',
        price: 250000,
        stock: 25,
        categoryId: accessoryCategory._id,
        slug: 'mouse-gaming-rgb',
        images: ['https://via.placeholder.com/300x300?text=Gaming+Mouse']
      },
      {
        name: 'Keyboard Mechanical',
        description: 'Keyboard mechanical untuk gaming dan typing',
        price: 450000,
        stock: 15,
        categoryId: accessoryCategory._id,
        slug: 'keyboard-mechanical',
        images: ['https://via.placeholder.com/300x300?text=Mechanical+Keyboard']
      }
    ];
    
    for (const product of products) {
      await Product.findOneAndUpdate(
        { slug: product.slug },
        product,
        { upsert: true }
      );
    }
    console.log('✅ Products created');
    
    // Create payment info
    const paymentMethods = [
      {
        bankName: 'Bank BCA',
        accountNumber: '1234567890',
        accountName: 'Inter Media Store'
      },
      {
        bankName: 'Bank Mandiri',
        accountNumber: '0987654321',
        accountName: 'Inter Media Store'
      }
    ];
    
    for (const payment of paymentMethods) {
      await PaymentInfo.findOneAndUpdate(
        { accountNumber: payment.accountNumber },
        payment,
        { upsert: true }
      );
    }
    console.log('✅ Payment methods created');
    
    console.log('🎉 Test environment setup completed!');
    return true;
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    return false;
  }
}

async function main() {
  const connected = await connectDB();
  if (!connected) {
    process.exit(1);
  }
  
  const setupSuccess = await setupTestData();
  
  await mongoose.connection.close();
  process.exit(setupSuccess ? 0 : 1);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { setupTestData };
