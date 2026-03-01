import mongoose from 'mongoose';

const extraClassSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  color: { type: String, default: '' },
  startTime: { type: String, default: '' },
  endTime: { type: String, default: '' },
  status: { type: String, enum: ['present', 'absent', 'cancelled', null], default: null }
}, { _id: false });

const attendanceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true }, // "YYYY-MM-DD"
  subjects: { type: mongoose.Schema.Types.Mixed, default: {} }, // { subjectId: status }
  extraClasses: { type: [extraClassSchema], default: [] }
}, { timestamps: true });

attendanceSchema.index({ userId: 1, date: 1 }, { unique: true });

export default mongoose.model('Attendance', attendanceSchema);
