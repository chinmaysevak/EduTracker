import mongoose from 'mongoose';

const syllabusUnitSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subjectId: { type: String, required: true },
  name: { type: String, required: true },
  teacherCompleted: { type: Boolean, default: false },
  studentCompleted: { type: Boolean, default: false },
  order: { type: Number, default: 0 }
}, { timestamps: true });

syllabusUnitSchema.index({ userId: 1, subjectId: 1 });

export default mongoose.model('SyllabusUnit', syllabusUnitSchema);
