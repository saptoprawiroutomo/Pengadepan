import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  orderCode: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    nameSnapshot: { type: String, required: true },
    priceSnapshot: { type: Number, required: true },
    weightSnapshot: { type: Number, required: true }, // gram
    qty: { type: Number, required: true },
    subtotal: { type: Number, required: true }
  }],
  subtotal: { type: Number, required: true },
  shippingCost: { type: Number, required: true, default: 0 },
  total: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'paid', 'processed', 'shipped', 'done', 'cancelled'], 
    default: 'pending' 
  },
  shippingAddress: { type: String, required: true },
  shippingCourier: { type: String }, // JNE REG, TIKI ONS, etc
  shippingService: { type: String }, // REG, YES, ONS, etc
  shippingEstimate: { type: String }, // 2-3 hari
  paymentMethod: { type: String, default: 'transfer' },
  paymentProof: { type: String }, // Base64 image of payment proof
  paymentProofUploadedAt: { type: Date },
  adminNotes: { type: String }, // Admin notes about payment verification
  trackingNumber: { type: String }, // Resi pengiriman
  courier: { type: String }, // Kurir (JNE, TIKI, POS, dll)
  shippedAt: { type: Date }, // Tanggal dikirim
}, { timestamps: true });

export default mongoose.models.Order || mongoose.model('Order', orderSchema);
