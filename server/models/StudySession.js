import mongoose from 'mongoose';

const studySessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subjectId: { type: String, required: true },
  title: { type: String, required: true },
  sessionDate: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  completed: { type: Boolean, default: false },
  notes: { type: String, default: '' },
  createdAt: { type: String, default: () => new Date().toISOString() }
});

studySessionSchema.index({ userId: 1 });

export default mongoose.model('StudySession', studySessionSchema);
