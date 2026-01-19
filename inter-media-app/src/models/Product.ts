import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  price: { type: Number, required: true },
  stock: { type: Number, required: true, default: 0 },
  weight: { type: Number, required: true, default: 0 }, // dalam gram
  images: [{ type: String }],
  description: { type: String },
  isActive: { type: Boolean, default: true },
  soldCount: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.models.Product || mongoose.model('Product', productSchema);
