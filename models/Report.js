import mongoose from 'mongoose';

const ReportSchema = new mongoose.Schema({
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  reportedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  reason: {
    type: String,
    enum: ['Spam', 'Harassment', 'Inappropriate Content', 'Underage', 'Other'],
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'dismissed', 'action_taken'],
    default: 'pending',
  },
}, { timestamps: true });

const Report = mongoose.model('Report', ReportSchema);

export default Report;