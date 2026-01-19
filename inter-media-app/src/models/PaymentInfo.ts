import mongoose from 'mongoose';

const paymentInfoSchema = new mongoose.Schema({
  type: { type: String, required: true }, // 'bank_transfer', 'cod'
  bankName: { type: String },
  accountNumber: { type: String },
  accountName: { type: String },
  instructions: { type: String },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.models.PaymentInfo || mongoose.model('PaymentInfo', paymentInfoSchema);
