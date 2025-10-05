import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    type: {
        type: String,
        enum: ['new_match', 'admin_broadcast', 'new_message'],
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    link: {
        type: String, // e.g., /chats/someUserId
    },
    read: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });

const Notification = mongoose.model('Notification', NotificationSchema);

export default Notification;