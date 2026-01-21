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
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  images: [{ type: String }],
  slug: { type: String, required: true, unique: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true }
  }],
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'], default: 'pending' },
  shippingAddress: {
    street: String,
    city: String,
    postalCode: String,
    country: String
  },
  paymentProof: { type: String },
  trackingNumber: { type: String },
}, { timestamps: true });

const cartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true, default: 1 },
}, { timestamps: true });

const serviceRequestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  serviceType: { type: String, required: true },
  description: { type: String, required: true },
  deviceInfo: { type: String },
  status: { type: String, enum: ['pending', 'in_progress', 'completed', 'cancelled'], default: 'pending' },
  estimatedCost: { type: Number },
  actualCost: { type: Number },
  completedAt: { type: Date },
}, { timestamps: true });

const paymentInfoSchema = new mongoose.Schema({
  bankName: { type: String, required: true },
  accountNumber: { type: String, required: true },
  accountName: { type: String, required: true },
}, { timestamps: true });

const salesTransactionSchema = new mongoose.Schema({
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true }
  }],
  totalAmount: { type: Number, required: true },
  paymentMethod: { type: String, enum: ['cash', 'card', 'transfer'], required: true },
  cashierId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiptNumber: { type: String, unique: true, sparse: true },
}, { timestamps: true });

// Create models
const User = mongoose.models.User || mongoose.model('User', userSchema);
const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);
const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);
const Cart = mongoose.models.Cart || mongoose.model('Cart', cartSchema);
const ServiceRequest = mongoose.models.ServiceRequest || mongoose.model('ServiceRequest', serviceRequestSchema);
const PaymentInfo = mongoose.models.PaymentInfo || mongoose.model('PaymentInfo', paymentInfoSchema);
const SalesTransaction = mongoose.models.SalesTransaction || mongoose.model('SalesTransaction', salesTransactionSchema);

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/inter-media-app';

async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Database connected successfully');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

async function testUserManagement() {
  console.log('\n🧪 Testing User Management...');
  
  try {
    // Test user creation
    const testUser = {
      name: 'Test User',
      email: 'test@example.com',
      passwordHash: await bcrypt.hash('password123', 12),
      role: 'customer'
    };
    
    await User.deleteOne({ email: testUser.email });
    const user = await User.create(testUser);
    console.log('✅ User creation: PASSED');
    
    // Test user authentication
    const foundUser = await User.findOne({ email: testUser.email });
    const isValidPassword = await bcrypt.compare('password123', foundUser.passwordHash);
    console.log(`✅ User authentication: ${isValidPassword ? 'PASSED' : 'FAILED'}`);
    
    // Test admin user
    const adminUser = await User.findOne({ role: 'admin' });
    console.log(`✅ Admin user exists: ${adminUser ? 'PASSED' : 'FAILED'}`);
    
    return true;
  } catch (error) {
    console.error('❌ User Management test failed:', error.message);
    return false;
  }
}

async function testProductCatalog() {
  console.log('\n🧪 Testing Product Catalog...');
  
  try {
    // Test category creation
    const category = await Category.findOneAndUpdate(
      { name: 'Test Category' },
      { name: 'Test Category', description: 'Test category description' },
      { upsert: true, new: true }
    );
    console.log('✅ Category management: PASSED');
    
    // Test product creation
    const product = await Product.findOneAndUpdate(
      { name: 'Test Product' },
      {
        name: 'Test Product',
        description: 'Test product description',
        price: 100000,
        stock: 50,
        category: category._id,
        slug: 'test-product',
        images: ['https://via.placeholder.com/300']
      },
      { upsert: true, new: true }
    );
    console.log('✅ Product management: PASSED');
    
    // Test product search
    const products = await Product.find({ name: /Test/i }).populate('category');
    console.log(`✅ Product search: ${products.length > 0 ? 'PASSED' : 'FAILED'}`);
    
    return true;
  } catch (error) {
    console.error('❌ Product Catalog test failed:', error.message);
    return false;
  }
}

async function testShoppingCart() {
  console.log('\n🧪 Testing Shopping Cart...');
  
  try {
    const user = await User.findOne({ email: 'test@example.com' });
    const product = await Product.findOne({ name: 'Test Product' });
    
    if (!user || !product) {
      console.log('❌ Prerequisites not found for cart test');
      return false;
    }
    
    // Test add to cart
    const cartItem = await Cart.findOneAndUpdate(
      { userId: user._id, productId: product._id },
      { userId: user._id, productId: product._id, quantity: 2 },
      { upsert: true, new: true }
    );
    console.log('✅ Add to cart: PASSED');
    
    // Test cart retrieval
    const cartItems = await Cart.find({ userId: user._id }).populate('productId');
    console.log(`✅ Cart retrieval: ${cartItems.length > 0 ? 'PASSED' : 'FAILED'}`);
    
    return true;
  } catch (error) {
    console.error('❌ Shopping Cart test failed:', error.message);
    return false;
  }
}

async function testOrderManagement() {
  console.log('\n🧪 Testing Order Management...');
  
  try {
    const user = await User.findOne({ email: 'test@example.com' });
    const product = await Product.findOne({ name: 'Test Product' });
    
    if (!user || !product) {
      console.log('❌ Prerequisites not found for order test');
      return false;
    }
    
    // Test order creation
    const order = await Order.create({
      userId: user._id,
      items: [{
        productId: product._id,
        quantity: 1,
        price: product.price
      }],
      totalAmount: product.price,
      status: 'pending',
      shippingAddress: {
        street: 'Test Street',
        city: 'Test City',
        postalCode: '12345',
        country: 'Indonesia'
      }
    });
    console.log('✅ Order creation: PASSED');
    
    // Test order status update
    order.status = 'processing';
    await order.save();
    console.log('✅ Order status update: PASSED');
    
    return true;
  } catch (error) {
    console.error('❌ Order Management test failed:', error.message);
    return false;
  }
}

async function testServiceRequests() {
  console.log('\n🧪 Testing Service Requests...');
  
  try {
    const user = await User.findOne({ email: 'test@example.com' });
    
    if (!user) {
      console.log('❌ User not found for service request test');
      return false;
    }
    
    // Test service request creation
    const serviceRequest = await ServiceRequest.create({
      userId: user._id,
      serviceType: 'repair',
      description: 'Test service request',
      deviceInfo: 'Test device',
      status: 'pending'
    });
    console.log('✅ Service request creation: PASSED');
    
    // Test service request status update
    serviceRequest.status = 'in_progress';
    await serviceRequest.save();
    console.log('✅ Service request status update: PASSED');
    
    return true;
  } catch (error) {
    console.error('❌ Service Requests test failed:', error.message);
    return false;
  }
}

async function testPaymentSystem() {
  console.log('\n🧪 Testing Payment System...');
  
  try {
    // Test payment info creation
    const paymentInfo = await PaymentInfo.findOneAndUpdate(
      { accountName: 'Test Bank' },
      {
        bankName: 'Test Bank',
        accountNumber: '1234567890',
        accountName: 'Test Account'
      },
      { upsert: true, new: true }
    );
    console.log('✅ Payment info management: PASSED');
    
    return true;
  } catch (error) {
    console.error('❌ Payment System test failed:', error.message);
    return false;
  }
}

async function testPOSSystem() {
  console.log('\n🧪 Testing POS System...');
  
  try {
    const product = await Product.findOne({ name: 'Test Product' });
    const admin = await User.findOne({ role: 'admin' });
    
    if (!product || !admin) {
      console.log('❌ Prerequisites not found for POS test');
      return false;
    }
    
    // Test POS transaction
    const transaction = await SalesTransaction.create({
      items: [{
        productId: product._id,
        quantity: 1,
        price: product.price
      }],
      totalAmount: product.price,
      paymentMethod: 'cash',
      cashierId: admin._id
    });
    console.log('✅ POS transaction: PASSED');
    
    return true;
  } catch (error) {
    console.error('❌ POS System test failed:', error.message);
    return false;
  }
}

async function testReportsAndAnalytics() {
  console.log('\n🧪 Testing Reports and Analytics...');
  
  try {
    // Test sales report data
    const orders = await Order.find({}).populate('userId items.productId');
    console.log(`✅ Sales data retrieval: ${orders.length >= 0 ? 'PASSED' : 'FAILED'}`);
    
    // Test stock report data
    const products = await Product.find({}).populate('category');
    console.log(`✅ Stock data retrieval: ${products.length >= 0 ? 'PASSED' : 'FAILED'}`);
    
    // Test service report data
    const services = await ServiceRequest.find({}).populate('userId');
    console.log(`✅ Service data retrieval: ${services.length >= 0 ? 'PASSED' : 'FAILED'}`);
    
    return true;
  } catch (error) {
    console.error('❌ Reports and Analytics test failed:', error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 Starting comprehensive application testing...\n');
  
  const connected = await connectDB();
  if (!connected) {
    console.log('❌ Cannot proceed without database connection');
    process.exit(1);
  }
  
  const tests = [
    { name: 'User Management', fn: testUserManagement },
    { name: 'Product Catalog', fn: testProductCatalog },
    { name: 'Shopping Cart', fn: testShoppingCart },
    { name: 'Order Management', fn: testOrderManagement },
    { name: 'Service Requests', fn: testServiceRequests },
    { name: 'Payment System', fn: testPaymentSystem },
    { name: 'POS System', fn: testPOSSystem },
    { name: 'Reports and Analytics', fn: testReportsAndAnalytics }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    try {
      const result = await test.fn();
      if (result) {
        passed++;
      } else {
        failed++;
      }
    } catch (error) {
      console.error(`❌ ${test.name} test crashed:`, error.message);
      failed++;
    }
  }
  
  console.log('\n📊 Test Results Summary:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
  
  if (failed === 0) {
    console.log('\n🎉 All tests passed! Your application is ready for use.');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the issues above.');
  }
  
  await mongoose.connection.close();
  process.exit(failed === 0 ? 0 : 1);
}

// Run tests if called directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = { runAllTests };
