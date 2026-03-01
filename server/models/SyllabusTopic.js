import mongoose from 'mongoose';

const syllabusTopicSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  unitId: { type: String, required: true },
  name: { type: String, required: true },
  teacherCompleted: { type: Boolean, default: false },
  studentCompleted: { type: Boolean, default: false },
  order: { type: Number, default: 0 }
}, { timestamps: true });

syllabusTopicSchema.index({ userId: 1, unitId: 1 });

export default mongoose.model('SyllabusTopic', syllabusTopicSchema);
