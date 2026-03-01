import { Router } from 'express';
import auth from '../middleware/auth.js';
import Subject from '../models/Subject.js';
import Attendance from '../models/Attendance.js';
import StudyTask from '../models/StudyTask.js';
import Resource from '../models/Resource.js';
import SyllabusUnit from '../models/SyllabusUnit.js';
import SyllabusTopic from '../models/SyllabusTopic.js';
import Topic from '../models/Topic.js';
import FocusSession from '../models/FocusSession.js';
import Exam from '../models/Exam.js';
import StudySession from '../models/StudySession.js';

const router = Router();
router.use(auth);

// GET /api/subjects
router.get('/', async (req, res) => {
  try {
    const subjects = await Subject.find({ userId: req.userId }).sort({ createdAt: 1 });
    const mapped = subjects.map(s => ({
      id: s._id.toString(),
      name: s.name,
      color: s.color,
      difficulty: s.difficulty,
      totalTopics: s.totalTopics,
      examDate: s.examDate
    }));
    res.json(mapped);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch subjects' });
  }
});

// POST /api/subjects
router.post('/', async (req, res) => {
  try {
    const { name, color, difficulty, totalTopics, examDate } = req.body;
    const subject = await Subject.create({
      userId: req.userId,
      name, color, difficulty, totalTopics, examDate
    });
    res.status(201).json({
      id: subject._id.toString(),
      name: subject.name,
      color: subject.color,
      difficulty: subject.difficulty,
      totalTopics: subject.totalTopics,
      examDate: subject.examDate
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create subject' });
  }
});

// PUT /api/subjects/:id
router.put('/:id', async (req, res) => {
  try {
    const subject = await Subject.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true }
    );
    if (!subject) return res.status(404).json({ error: 'Subject not found' });
    res.json({
      id: subject._id.toString(),
      name: subject.name,
      color: subject.color,
      difficulty: subject.difficulty,
      totalTopics: subject.totalTopics,
      examDate: subject.examDate
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update subject' });
  }
});

// DELETE /api/subjects/:id — cascade delete related data
router.delete('/:id', async (req, res) => {
  try {
    const subjectId = req.params.id;
    const subject = await Subject.findOneAndDelete({ _id: subjectId, userId: req.userId });
    if (!subject) return res.status(404).json({ error: 'Subject not found' });

    // Cascade delete all related data
    await Promise.all([
      StudyTask.deleteMany({ userId: req.userId, subjectId }),
      Resource.deleteMany({ userId: req.userId, subjectId }),
      Topic.deleteMany({ userId: req.userId, subjectId }),
      FocusSession.deleteMany({ userId: req.userId, subjectId }),
      Exam.deleteMany({ userId: req.userId, subjectId }),
      StudySession.deleteMany({ userId: req.userId, subjectId }),
      SyllabusUnit.find({ userId: req.userId, subjectId }).then(async (units) => {
        const unitIds = units.map(u => u._id.toString());
        await SyllabusTopic.deleteMany({ userId: req.userId, unitId: { $in: unitIds } });
        await SyllabusUnit.deleteMany({ userId: req.userId, subjectId });
      })
    ]);

    // Remove subject from attendance records
    const attendances = await Attendance.find({ userId: req.userId });
    for (const att of attendances) {
      if (att.subjects && att.subjects[subjectId] !== undefined) {
        delete att.subjects[subjectId];
        att.markModified('subjects');
        await att.save();
      }
    }

    res.json({ message: 'Subject deleted' });
  } catch (err) {
    console.error('Delete subject error:', err);
    res.status(500).json({ error: 'Failed to delete subject' });
  }
});

export default router;
