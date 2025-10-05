import mongoose from 'mongoose';

const ConversationSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  lastMessage: {
    type: String,
  },
  lastMessageAt: {
    type: Date,
  },
}, { timestamps: true });

const Conversation = mongoose.model('Conversation', ConversationSchema);

export default Conversation;