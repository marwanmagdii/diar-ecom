import mongoose from 'mongoose';

const logSchema = new mongoose.Schema({
  adminName: {
    type: String,
    required: true,
    default: 'Unknown Admin'
  },
  actionType: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  details: {
    type: Object,
    default: {}
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.models.Log || mongoose.model('Log', logSchema);
