import { Router } from 'express';
import auth from '../middleware/auth.js';
import Timetable from '../models/Timetable.js';

const router = Router();
router.use(auth);

// GET /api/timetable
router.get('/', async (req, res) => {
  try {
    let timetable = await Timetable.findOne({ userId: req.userId });
    if (!timetable) {
      timetable = { timetableData: {}, customTimes: {} };
    }
    res.json({
      timetableData: timetable.timetableData || {},
      customTimes: timetable.customTimes || {}
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch timetable' });
  }
});

// PUT /api/timetable — upsert entire timetable
router.put('/', async (req, res) => {
  try {
    const { timetableData, customTimes } = req.body;
    const timetable = await Timetable.findOneAndUpdate(
      { userId: req.userId },
      { timetableData, customTimes },
      { new: true, upsert: true }
    );
    res.json({
      timetableData: timetable.timetableData || {},
      customTimes: timetable.customTimes || {}
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update timetable' });
  }
});

export default router;
