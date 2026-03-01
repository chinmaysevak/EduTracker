import mongoose from 'mongoose';

const focusSessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subjectId: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  durationMinutes: { type: Number, required: true },
  date: { type: String, required: true } // "YYYY-MM-DD"
}, { timestamps: true });

focusSessionSchema.index({ userId: 1, date: -1 });

export default mongoose.model('FocusSession', focusSessionSchema);
