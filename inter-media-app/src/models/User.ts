import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['admin', 'kasir', 'customer'], default: 'customer' },
  phone: { type: String },
  birthDate: { type: Date },
  gender: { type: String, enum: ['Laki-laki', 'Perempuan'] },
  idNumber: { type: String }, // NIK/KTP
  address: { type: String }, // Alamat KTP
  avatar: { type: String }, // URL foto profil
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', userSchema);
