import { Router } from 'express';
import auth from '../middleware/auth.js';
import SyllabusUnit from '../models/SyllabusUnit.js';
import SyllabusTopic from '../models/SyllabusTopic.js';

const router = Router();
router.use(auth);

// ===== UNITS =====

// GET /api/syllabus/units
router.get('/units', async (req, res) => {
  try {
    const units = await SyllabusUnit.find({ userId: req.userId }).sort({ order: 1 });
    res.json(units.map(u => ({
      id: u._id.toString(),
      subjectId: u.subjectId,
      name: u.name,
      teacherCompleted: u.teacherCompleted,
      studentCompleted: u.studentCompleted,
      order: u.order
    })));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch units' });
  }
});

// POST /api/syllabus/units
router.post('/units', async (req, res) => {
  try {
    const unit = await SyllabusUnit.create({ ...req.body, userId: req.userId });
    res.status(201).json({
      id: unit._id.toString(),
      subjectId: unit.subjectId,
      name: unit.name,
      teacherCompleted: unit.teacherCompleted,
      studentCompleted: unit.studentCompleted,
      order: unit.order
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create unit' });
  }
});

// PUT /api/syllabus/units/:id
router.put('/units/:id', async (req, res) => {
  try {
    const unit = await SyllabusUnit.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true }
    );
    if (!unit) return res.status(404).json({ error: 'Unit not found' });
    res.json({
      id: unit._id.toString(),
      subjectId: unit.subjectId,
      name: unit.name,
      teacherCompleted: unit.teacherCompleted,
      studentCompleted: unit.studentCompleted,
      order: unit.order
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update unit' });
  }
});

// DELETE /api/syllabus/units/:id — cascade delete topics
router.delete('/units/:id', async (req, res) => {
  try {
    const unit = await SyllabusUnit.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!unit) return res.status(404).json({ error: 'Unit not found' });
    await SyllabusTopic.deleteMany({ userId: req.userId, unitId: req.params.id });
    res.json({ message: 'Unit deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete unit' });
  }
});

// ===== TOPICS =====

// GET /api/syllabus/topics
router.get('/topics', async (req, res) => {
  try {
    const topics = await SyllabusTopic.find({ userId: req.userId }).sort({ order: 1 });
    res.json(topics.map(t => ({
      id: t._id.toString(),
      unitId: t.unitId,
      name: t.name,
      teacherCompleted: t.teacherCompleted,
      studentCompleted: t.studentCompleted,
      order: t.order
    })));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch topics' });
  }
});

// POST /api/syllabus/topics
router.post('/topics', async (req, res) => {
  try {
    const topic = await SyllabusTopic.create({ ...req.body, userId: req.userId });
    res.status(201).json({
      id: topic._id.toString(),
      unitId: topic.unitId,
      name: topic.name,
      teacherCompleted: topic.teacherCompleted,
      studentCompleted: topic.studentCompleted,
      order: topic.order
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create topic' });
  }
});

// PUT /api/syllabus/topics/:id
router.put('/topics/:id', async (req, res) => {
  try {
    const topic = await SyllabusTopic.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true }
    );
    if (!topic) return res.status(404).json({ error: 'Topic not found' });
    res.json({
      id: topic._id.toString(),
      unitId: topic.unitId,
      name: topic.name,
      teacherCompleted: topic.teacherCompleted,
      studentCompleted: topic.studentCompleted,
      order: topic.order
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update topic' });
  }
});

// DELETE /api/syllabus/topics/:id
router.delete('/topics/:id', async (req, res) => {
  try {
    const topic = await SyllabusTopic.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!topic) return res.status(404).json({ error: 'Topic not found' });
    res.json({ message: 'Topic deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete topic' });
  }
});

// PUT /api/syllabus/units/bulk — bulk update units
router.put('/units-bulk', async (req, res) => {
  try {
    const updates = req.body; // Array of { id, ...fields }
    const results = [];
    for (const { id, ...fields } of updates) {
      const unit = await SyllabusUnit.findOneAndUpdate(
        { _id: id, userId: req.userId },
        fields,
        { new: true }
      );
      if (unit) results.push({ id: unit._id.toString(), ...unit.toObject() });
    }
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: 'Failed to bulk update units' });
  }
});

export default router;
