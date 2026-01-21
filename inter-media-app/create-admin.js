const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Connect to MongoDB (same as .env.local)
mongoose.connect('mongodb://localhost:27017/inter-media-app');

// User schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['admin', 'kasir', 'customer'], default: 'customer' },
  phone: { type: String },
  address: { type: String },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

async function createAdmin() {
  try {
    // Delete existing admin
    await User.deleteOne({ email: 'admin@test.com' });
    
    // Hash password
    const hashedPassword = await bcrypt.hash('123456', 12);
    
    // Create admin
    const admin = await User.create({
      name: 'Admin Test',
      email: 'admin@test.com',
      passwordHash: hashedPassword,
      role: 'admin',
      phone: '081234567890',
      address: 'Test Address',
      isActive: true
    });
    
    console.log('Admin created successfully:');
    console.log('Email: admin@test.com');
    console.log('Password: 123456');
    console.log('ID:', admin._id);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createAdmin();
