const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

mongoose.connect('mongodb://localhost:27017/inter-media-app');

// Test creating user directly
async function testCreateUser() {
  try {
    await new Promise((resolve) => {
      mongoose.connection.once('open', resolve);
    });

    console.log('🔄 Testing user creation...');

    // Define user schema
    const userSchema = new mongoose.Schema({
      name: { type: String, required: true },
      email: { type: String, required: true, unique: true },
      passwordHash: { type: String, required: true },
      role: { type: String, enum: ['admin', 'kasir', 'customer'], default: 'customer' },
      phone: { type: String },
      address: { type: String },
      isActive: { type: Boolean, default: true },
    }, { timestamps: true });

    const User = mongoose.model('TestUser', userSchema);

    // Hash password
    const passwordHash = await bcrypt.hash('123456', 12);

    // Create test user
    const user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      passwordHash,
      role: 'customer',
      isActive: true
    });

    console.log('✅ User created successfully:', user._id);
    
    // Clean up
    await User.deleteOne({ _id: user._id });
    console.log('✅ Test user cleaned up');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating user:', error);
    process.exit(1);
  }
}

testCreateUser();
