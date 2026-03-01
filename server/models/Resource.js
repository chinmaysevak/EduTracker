import mongoose from 'mongoose';

const resourceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['file', 'link', 'youtube', 'note'], required: true },
  title: { type: String, required: true },
  subjectId: { type: String, required: true },
  isFavorite: { type: Boolean, default: false },
  tags: { type: [String], default: [] },
  fileUrl: { type: String, default: '' },
  fileType: { type: String, default: '' },
  fileSize: { type: Number, default: 0 },
  fileId: { type: String, default: '' },
  url: { type: String, default: '' },
  youtubeUrl: { type: String, default: '' },
  thumbnailUrl: { type: String, default: '' },
  content: { type: String, default: '' },
  createdAt: { type: String, default: () => new Date().toISOString() }
});

resourceSchema.index({ userId: 1 });

export default mongoose.model('Resource', resourceSchema);
