import mongoose from 'mongoose';

const salesTransactionSchema = new mongoose.Schema({
  transactionCode: { type: String, required: true, unique: true },
  receiptNumber: { type: String, unique: true, sparse: true },
  cashierId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  customerName: { type: String, default: 'Walk-in Customer' },
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    nameSnapshot: { type: String, required: true },
    priceSnapshot: { type: Number, required: true },
    qty: { type: Number, required: true },
    subtotal: { type: Number, required: true }
  }],
  total: { type: Number, required: true },
}, { timestamps: true });

export default mongoose.models.SalesTransaction || mongoose.model('SalesTransaction', salesTransactionSchema);
