import mongoose from 'mongoose';

const badgeSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, default: '' },
  icon: { type: String, default: '' },
  unlockedAt: { type: String, default: '' }
}, { _id: false });

const userProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  name: { type: String, default: '' },
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  currentStreak: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  lastStudyDate: { type: String, default: '' },
  badges: { type: [badgeSchema], default: [] },
  lastStudiedSubjectId: { type: String, default: '' },
  lastSessionEnd: { type: String, default: '' }
}, { timestamps: true });

export default mongoose.model('UserProfile', userProfileSchema);
