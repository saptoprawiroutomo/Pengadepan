import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  orderCode: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    nameSnapshot: { type: String, required: true },
    priceSnapshot: { type: Number, required: true },
    qty: { type: Number, required: true },
    subtotal: { type: Number, required: true }
  }],
  total: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'paid', 'processed', 'shipped', 'done', 'cancelled'], 
    default: 'pending' 
  },
  shippingAddress: { type: String, required: true },
  paymentMethod: { type: String, default: 'transfer' },
}, { timestamps: true });

export default mongoose.models.Order || mongoose.model('Order', orderSchema);
