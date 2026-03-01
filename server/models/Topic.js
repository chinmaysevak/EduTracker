import mongoose from 'mongoose';

const topicSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subjectId: { type: String, required: true },
  name: { type: String, required: true },
  status: { type: String, enum: ['pending', 'revision', 'mastered'], default: 'pending' },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  completedDate: { type: String, default: '' }
}, { timestamps: true });

topicSchema.index({ userId: 1, subjectId: 1 });

export default mongoose.model('Topic', topicSchema);
