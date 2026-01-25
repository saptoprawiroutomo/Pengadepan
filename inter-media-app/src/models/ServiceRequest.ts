import mongoose from 'mongoose';

const serviceRequestSchema = new mongoose.Schema({
  serviceCode: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  deviceType: { 
    type: String, 
    enum: ['printer', 'fotocopy', 'komputer', 'lainnya'], 
    required: true 
  },
  complaint: { type: String, required: true },
  images: [{ type: String }],
  address: { type: String, required: true },
  phone: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['received', 'checking', 'repairing', 'done', 'delivered', 'cancelled'], 
    default: 'received' 
  },
  laborCost: { type: Number, default: 0 },
  partsCost: { type: Number, default: 0 },
  totalCost: { type: Number, default: 0 },
  // SLA Fields
  slaTarget: { type: Date }, // Target completion date
  slaStatus: { 
    type: String, 
    enum: ['on-time', 'at-risk', 'overdue'], 
    default: 'on-time' 
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  }
}, { timestamps: true });

export default mongoose.models.ServiceRequest || mongoose.model('ServiceRequest', serviceRequestSchema);
