import mongoose from 'mongoose';

const chatRoomSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  lastMessageAt: { type: Date, default: Date.now },
}, { timestamps: true });

const chatMessageSchema = new mongoose.Schema({
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'ChatRoom', required: true },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

export const ChatRoom = mongoose.models.ChatRoom || mongoose.model('ChatRoom', chatRoomSchema);
export const ChatMessage = mongoose.models.ChatMessage || mongoose.model('ChatMessage', chatMessageSchema);
