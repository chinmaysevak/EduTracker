import { Router } from 'express';
import auth from '../middleware/auth.js';
import StudySession from '../models/StudySession.js';

const router = Router();
router.use(auth);

// GET /api/studysessions
router.get('/', async (req, res) => {
  try {
    const sessions = await StudySession.find({ userId: req.userId }).sort({ sessionDate: -1 });
    res.json(sessions.map(s => ({
      id: s._id.toString(),
      subjectId: s.subjectId,
      title: s.title,
      sessionDate: s.sessionDate,
      startTime: s.startTime,
      endTime: s.endTime,
      completed: s.completed,
      notes: s.notes,
      createdAt: s.createdAt
    })));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch study sessions' });
  }
});

// POST /api/studysessions
router.post('/', async (req, res) => {
  try {
    const session = await StudySession.create({ ...req.body, userId: req.userId });
    res.status(201).json({
      id: session._id.toString(),
      subjectId: session.subjectId,
      title: session.title,
      sessionDate: session.sessionDate,
      startTime: session.startTime,
      endTime: session.endTime,
      completed: session.completed,
      notes: session.notes,
      createdAt: session.createdAt
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create study session' });
  }
});

// PUT /api/studysessions/:id
router.put('/:id', async (req, res) => {
  try {
    const session = await StudySession.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true }
    );
    if (!session) return res.status(404).json({ error: 'Study session not found' });
    res.json({
      id: session._id.toString(),
      subjectId: session.subjectId,
      title: session.title,
      sessionDate: session.sessionDate,
      startTime: session.startTime,
      endTime: session.endTime,
      completed: session.completed,
      notes: session.notes,
      createdAt: session.createdAt
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update study session' });
  }
});

// DELETE /api/studysessions/:id
router.delete('/:id', async (req, res) => {
  try {
    const session = await StudySession.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!session) return res.status(404).json({ error: 'Study session not found' });
    res.json({ message: 'Study session deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete study session' });
  }
});

export default router;
