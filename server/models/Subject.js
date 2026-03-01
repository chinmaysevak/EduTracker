import mongoose from 'mongoose';

const subjectSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, trim: true },
  color: { type: String, default: '' },
  difficulty: { type: Number, default: 3, min: 1, max: 5 },
  totalTopics: { type: Number, default: 10 },
  examDate: { type: String, default: '' },
  // keep original client-side id for migration compatibility
  clientId: { type: String, default: '' }
}, { timestamps: true });

subjectSchema.index({ userId: 1 });

export default mongoose.model('Subject', subjectSchema);
