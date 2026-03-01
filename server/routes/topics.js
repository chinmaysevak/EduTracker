import { Router } from 'express';
import auth from '../middleware/auth.js';
import Topic from '../models/Topic.js';

const router = Router();
router.use(auth);

// GET /api/topics
router.get('/', async (req, res) => {
  try {
    const topics = await Topic.find({ userId: req.userId });
    res.json(topics.map(t => ({
      id: t._id.toString(),
      subjectId: t.subjectId,
      name: t.name,
      status: t.status,
      difficulty: t.difficulty,
      completedDate: t.completedDate
    })));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch topics' });
  }
});

// POST /api/topics
router.post('/', async (req, res) => {
  try {
    const topic = await Topic.create({ ...req.body, userId: req.userId });
    res.status(201).json({
      id: topic._id.toString(),
      subjectId: topic.subjectId,
      name: topic.name,
      status: topic.status,
      difficulty: topic.difficulty,
      completedDate: topic.completedDate
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create topic' });
  }
});

// PUT /api/topics/:id
router.put('/:id', async (req, res) => {
  try {
    const topic = await Topic.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true }
    );
    if (!topic) return res.status(404).json({ error: 'Topic not found' });
    res.json({
      id: topic._id.toString(),
      subjectId: topic.subjectId,
      name: topic.name,
      status: topic.status,
      difficulty: topic.difficulty,
      completedDate: topic.completedDate
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update topic' });
  }
});

// DELETE /api/topics/:id
router.delete('/:id', async (req, res) => {
  try {
    const topic = await Topic.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!topic) return res.status(404).json({ error: 'Topic not found' });
    res.json({ message: 'Topic deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete topic' });
  }
});

export default router;
