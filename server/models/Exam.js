import mongoose from 'mongoose';

const examSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subjectId: { type: String, required: true },
  title: { type: String, required: true },
  examDate: { type: String, required: true },
  syllabus: { type: String, default: '' },
  preparationStatus: { type: String, enum: ['not_started', 'in_progress', 'completed'], default: 'not_started' },
  notes: { type: String, default: '' },
  createdAt: { type: String, default: () => new Date().toISOString() }
});

examSchema.index({ userId: 1 });

export default mongoose.model('Exam', examSchema);
