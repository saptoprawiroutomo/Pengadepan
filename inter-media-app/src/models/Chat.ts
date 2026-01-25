import mongoose from 'mongoose';

const ChatSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  sender: {
    type: String,
    enum: ['user', 'admin'],
    required: true
  },
  senderName: {
    type: String,
    required: true
  },
  isRead: {
    type: Boolean,
    default: false
  },
  isPromo: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index untuk query yang efisien
ChatSchema.index({ userId: 1, createdAt: -1 });
ChatSchema.index({ isRead: 1, sender: 1 });
ChatSchema.index({ isPromo: 1 });

const Chat = mongoose.models.Chat || mongoose.model('Chat', ChatSchema);

export default Chat;
