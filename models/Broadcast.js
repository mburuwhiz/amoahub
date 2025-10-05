import mongoose from 'mongoose';

const BroadcastSchema = new mongoose.Schema({
    admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
}, { timestamps: true });

const Broadcast = mongoose.model('Broadcast', BroadcastSchema);

export default Broadcast;