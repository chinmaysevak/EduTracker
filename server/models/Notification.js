import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['attendance', 'task', 'material', 'progress', 'system'], default: 'system' },
  read: { type: Boolean, default: false },
  link: { type: String, default: '' },
  createdAt: { type: String, default: () => new Date().toISOString() }
});

notificationSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('Notification', notificationSchema);
