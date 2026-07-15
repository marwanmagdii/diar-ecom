import mongoose from 'mongoose';

const NotificationHistorySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  body: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    default: null
  },
  productId: {
    type: String,
    default: null
  },
  targetType: {
    type: String,
    required: true,
    enum: ['all', 'category', 'city', 'specific']
  },
  successCount: {
    type: Number,
    required: true,
    default: 0
  },
  failureCount: {
    type: Number,
    required: true,
    default: 0
  },
  sentAt: {
    type: Date,
    default: Date.now,
  },
  clicks: [{
    token: { type: String, required: true },
    userId: { type: String, default: null }, // Null if anonymous
    clickedAt: { type: Date, default: Date.now }
  }]
});

export default mongoose.models.NotificationHistory || mongoose.model('NotificationHistory', NotificationHistorySchema);
