import { Router } from 'express';
import auth from '../middleware/auth.js';
import Exam from '../models/Exam.js';

const router = Router();
router.use(auth);

// GET /api/exams
router.get('/', async (req, res) => {
  try {
    const exams = await Exam.find({ userId: req.userId }).sort({ examDate: 1 });
    res.json(exams.map(e => ({
      id: e._id.toString(),
      subjectId: e.subjectId,
      title: e.title,
      examDate: e.examDate,
      syllabus: e.syllabus,
      preparationStatus: e.preparationStatus,
      notes: e.notes,
      createdAt: e.createdAt
    })));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch exams' });
  }
});

// POST /api/exams
router.post('/', async (req, res) => {
  try {
    const exam = await Exam.create({ ...req.body, userId: req.userId });
    res.status(201).json({
      id: exam._id.toString(),
      subjectId: exam.subjectId,
      title: exam.title,
      examDate: exam.examDate,
      syllabus: exam.syllabus,
      preparationStatus: exam.preparationStatus,
      notes: exam.notes,
      createdAt: exam.createdAt
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create exam' });
  }
});

// PUT /api/exams/:id
router.put('/:id', async (req, res) => {
  try {
    const exam = await Exam.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true }
    );
    if (!exam) return res.status(404).json({ error: 'Exam not found' });
    res.json({
      id: exam._id.toString(),
      subjectId: exam.subjectId,
      title: exam.title,
      examDate: exam.examDate,
      syllabus: exam.syllabus,
      preparationStatus: exam.preparationStatus,
      notes: exam.notes,
      createdAt: exam.createdAt
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update exam' });
  }
});

// DELETE /api/exams/:id
router.delete('/:id', async (req, res) => {
  try {
    const exam = await Exam.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!exam) return res.status(404).json({ error: 'Exam not found' });
    res.json({ message: 'Exam deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete exam' });
  }
});

export default router;
