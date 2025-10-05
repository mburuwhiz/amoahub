import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  messageType: {
    type: String,
    enum: ['text', 'image'],
    default: 'text',
  },
  content: {
    type: String,
    required: false, // Not required because an image message might not have text content
  },
  read: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

const Message = mongoose.model('Message', MessageSchema);

export default Message;