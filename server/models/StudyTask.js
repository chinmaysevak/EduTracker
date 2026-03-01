import mongoose from 'mongoose';

const studyTaskSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subjectId: { type: String, default: '' },
  description: { type: String, required: true },
  targetDate: { type: String, required: true },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
  type: { type: String, enum: ['study', 'assignment', 'exam', 'project'], default: 'study' },
  isRecurring: { type: Boolean, default: false },
  recurrencePattern: { type: String, enum: ['none', 'daily', 'weekly'], default: 'none' },
  recurringDays: { type: [Number], default: [] },
  marks: { type: Number, default: null },
  estimatedMinutes: { type: Number, default: null },
  autoPriorityScore: { type: Number, default: null },
  completedAt: { type: String, default: '' },
  createdAt: { type: String, default: () => new Date().toISOString() }
});

studyTaskSchema.index({ userId: 1 });

export default mongoose.model('StudyTask', studyTaskSchema);
