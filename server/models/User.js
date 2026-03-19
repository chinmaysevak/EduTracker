import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String },
  googleId: { type: String, unique: true, sparse: true },
  authProvider: { type: String, enum: ['local', 'google'], default: 'local' },
  profilePhoto: { type: String, default: '' },
  role: { type: String, default: 'student', enum: ['student', 'teacher', 'admin'] },
  institution: { type: String, default: '' },
  bio: { type: String, default: '' },
  preferences: {
    theme: { type: String, enum: ['dark', 'light', 'system'], default: 'system' },
    emailNotifications: { type: Boolean, default: true },
    attendanceReminder: { type: Boolean, default: true },
    studyReminder: { type: Boolean, default: true },
    assignmentReminder: { type: Boolean, default: true }
  },
  attendanceGoal: { type: Number, default: 75 },
  theme: { type: String, enum: ['dark', 'light', 'system'], default: 'system' },
  notifications: {
    attendanceReminder: { type: Boolean, default: true },
    studyReminder: { type: Boolean, default: true },
    assignmentReminder: { type: Boolean, default: true }
  },
  emailVerified: { type: Boolean, default: false },
  emailVerificationToken: { type: String },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
  verificationOtp: { type: String },
  verificationOtpExpires: { type: Date },
  pendingEmail: { type: String },
  lastLogin: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash') || !this.passwordHash) return next();
  // passwordHash is already set, just hash it if it's not already hashed
  if (!this.passwordHash.startsWith('$2')) {
    this.passwordHash = await bcrypt.hash(this.passwordHash, 10);
  }
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

export default mongoose.model('User', userSchema);
