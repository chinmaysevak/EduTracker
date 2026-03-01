import { Router } from 'express';
import auth from '../middleware/auth.js';
import UserProfile from '../models/UserProfile.js';

const router = Router();
router.use(auth);

// GET /api/profile
router.get('/', async (req, res) => {
  try {
    let profile = await UserProfile.findOne({ userId: req.userId });
    if (!profile) {
      // Create default profile
      profile = await UserProfile.create({
        userId: req.userId,
        name: '',
        xp: 0,
        level: 1,
        currentStreak: 0,
        longestStreak: 0,
        lastStudyDate: '',
        badges: []
      });
    }
    res.json({
      name: profile.name,
      xp: profile.xp,
      level: profile.level,
      currentStreak: profile.currentStreak,
      longestStreak: profile.longestStreak,
      lastStudyDate: profile.lastStudyDate,
      badges: profile.badges,
      lastStudiedSubjectId: profile.lastStudiedSubjectId,
      lastSessionEnd: profile.lastSessionEnd
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// PUT /api/profile — upsert
router.put('/', async (req, res) => {
  try {
    const profile = await UserProfile.findOneAndUpdate(
      { userId: req.userId },
      req.body,
      { new: true, upsert: true }
    );
    res.json({
      name: profile.name,
      xp: profile.xp,
      level: profile.level,
      currentStreak: profile.currentStreak,
      longestStreak: profile.longestStreak,
      lastStudyDate: profile.lastStudyDate,
      badges: profile.badges,
      lastStudiedSubjectId: profile.lastStudiedSubjectId,
      lastSessionEnd: profile.lastSessionEnd
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

export default router;
