import { Router } from 'express';
import auth from '../middleware/auth.js';
import FocusSession from '../models/FocusSession.js';

const router = Router();
router.use(auth);

// GET /api/focus-sessions
router.get('/', async (req, res) => {
  try {
    const sessions = await FocusSession.find({ userId: req.userId }).sort({ date: -1 });
    res.json(sessions.map(s => ({
      id: s._id.toString(),
      subjectId: s.subjectId,
      startTime: s.startTime,
      endTime: s.endTime,
      durationMinutes: s.durationMinutes,
      date: s.date
    })));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch focus sessions' });
  }
});

// POST /api/focus-sessions
router.post('/', async (req, res) => {
  try {
    const session = await FocusSession.create({ ...req.body, userId: req.userId });
    res.status(201).json({
      id: session._id.toString(),
      subjectId: session.subjectId,
      startTime: session.startTime,
      endTime: session.endTime,
      durationMinutes: session.durationMinutes,
      date: session.date
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create focus session' });
  }
});

export default router;
