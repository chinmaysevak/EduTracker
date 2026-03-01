import { Router } from 'express';
import auth from '../middleware/auth.js';
import Attendance from '../models/Attendance.js';

const router = Router();
router.use(auth);

// GET /api/attendance
router.get('/', async (req, res) => {
  try {
    const records = await Attendance.find({ userId: req.userId }).sort({ date: -1 });
    const mapped = records.map(a => ({
      id: a._id.toString(),
      date: a.date,
      subjects: a.subjects || {},
      extraClasses: a.extraClasses || []
    }));
    res.json(mapped);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch attendance' });
  }
});

// POST /api/attendance
router.post('/', async (req, res) => {
  try {
    const { date, subjects, extraClasses } = req.body;

    // Upsert — one record per user per date
    const record = await Attendance.findOneAndUpdate(
      { userId: req.userId, date },
      { subjects, extraClasses },
      { new: true, upsert: true }
    );

    res.status(201).json({
      id: record._id.toString(),
      date: record.date,
      subjects: record.subjects || {},
      extraClasses: record.extraClasses || []
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save attendance' });
  }
});

// PUT /api/attendance/:id
router.put('/:id', async (req, res) => {
  try {
    const record = await Attendance.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true }
    );
    if (!record) return res.status(404).json({ error: 'Record not found' });
    res.json({
      id: record._id.toString(),
      date: record.date,
      subjects: record.subjects || {},
      extraClasses: record.extraClasses || []
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update attendance' });
  }
});

// PUT /api/attendance/by-date/:date — update by date (upsert)
router.put('/by-date/:date', async (req, res) => {
  try {
    const { subjects, extraClasses } = req.body;
    const record = await Attendance.findOneAndUpdate(
      { userId: req.userId, date: req.params.date },
      { subjects, extraClasses },
      { new: true, upsert: true }
    );
    res.json({
      id: record._id.toString(),
      date: record.date,
      subjects: record.subjects || {},
      extraClasses: record.extraClasses || []
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update attendance' });
  }
});

export default router;
