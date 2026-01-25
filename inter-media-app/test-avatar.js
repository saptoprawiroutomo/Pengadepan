const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://saptoprawiroutomo_db_user:1234qwer@cluster0.z3wyzso.mongodb.net/intermediadb?retryWrites=true&w=majority&appName=Cluster0');

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
  avatar: { type: String },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

async function testAvatarField() {
  try {
    console.log('🔄 Testing avatar field...');

    // Add sample avatar to admin user
    const adminUser = await User.findOne({ email: 'admin@intermedia.com' });
    if (adminUser) {
      adminUser.avatar = 'https://dummyimage.com/150x150/4f46e5/ffffff&text=Admin';
      await adminUser.save();
      console.log('✅ Added sample avatar to admin user');
    }

    // Add sample avatar to kasir user
    const kasirUser = await User.findOne({ email: 'kasir@intermedia.com' });
    if (kasirUser) {
      kasirUser.avatar = 'https://dummyimage.com/150x150/059669/ffffff&text=Kasir';
      await kasirUser.save();
      console.log('✅ Added sample avatar to kasir user');
    }

    console.log('📸 Avatar field ready for upload feature');
    console.log('🌐 Access profile page at: /profile');
    console.log('📝 Login with admin@intermedia.com / admin123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testAvatarField();
