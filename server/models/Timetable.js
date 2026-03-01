import mongoose from 'mongoose';

const timetableSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  timetableData: { type: mongoose.Schema.Types.Mixed, default: {} }, // { "Monday": ["Math", "Physics"], ... }
  customTimes: { type: mongoose.Schema.Types.Mixed, default: {} }   // { "Monday": [{startTime, endTime}, ...], ... }
}, { timestamps: true });

export default mongoose.model('Timetable', timetableSchema);
