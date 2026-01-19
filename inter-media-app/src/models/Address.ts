import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  label: { type: String, required: true }, // Rumah, Kantor, Lainnya
  receiverName: { type: String, required: true },
  phone: { type: String, required: true },
  province: { type: String, required: true },
  city: { type: String, required: true },
  district: { type: String, required: true },
  postalCode: { type: String, required: true },
  fullAddress: { type: String, required: true },
  isDefault: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.models.Address || mongoose.model('Address', addressSchema);
