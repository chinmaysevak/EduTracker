import { Router } from 'express';
import auth from '../middleware/auth.js';
import Subject from '../models/Subject.js';
import Attendance from '../models/Attendance.js';
import StudyTask from '../models/StudyTask.js';
import Resource from '../models/Resource.js';
import SyllabusUnit from '../models/SyllabusUnit.js';
import SyllabusTopic from '../models/SyllabusTopic.js';
import Notification from '../models/Notification.js';
import Timetable from '../models/Timetable.js';
import UserProfile from '../models/UserProfile.js';
import Topic from '../models/Topic.js';
import FocusSession from '../models/FocusSession.js';
import Exam from '../models/Exam.js';
import StudySession from '../models/StudySession.js';

const router = Router();
router.use(auth);

// GET /api/import-export/export — export all user data
router.get('/export', async (req, res) => {
  try {
    const [subjects, attendance, tasks, resources, units, topics, syllabusTopics, notifications, timetable, profile, focusSessions, exams, studySessions] = await Promise.all([
      Subject.find({ userId: req.userId }),
      Attendance.find({ userId: req.userId }),
      StudyTask.find({ userId: req.userId }),
      Resource.find({ userId: req.userId }),
      SyllabusUnit.find({ userId: req.userId }),
      Topic.find({ userId: req.userId }),
      SyllabusTopic.find({ userId: req.userId }),
      Notification.find({ userId: req.userId }),
      Timetable.findOne({ userId: req.userId }),
      UserProfile.findOne({ userId: req.userId }),
      FocusSession.find({ userId: req.userId }),
      Exam.find({ userId: req.userId }),
      StudySession.find({ userId: req.userId })
    ]);

    res.json({
      version: '2.0',
      exportedAt: new Date().toISOString(),
      subjects,
      attendance,
      tasks,
      resources,
      units,
      topics,
      syllabusTopics,
      notifications,
      timetable: timetable?.timetableData || {},
      customTimes: timetable?.customTimes || {},
      profile,
      focusSessions,
      exams,
      studySessions
    });
  } catch (err) {
    console.error('Export error:', err);
    res.status(500).json({ error: 'Failed to export data' });
  }
});

// POST /api/import-export/import — import user data (replaces existing)
router.post('/import', async (req, res) => {
  try {
    const data = req.body;

    // Clear existing user data
    await Promise.all([
      Subject.deleteMany({ userId: req.userId }),
      Attendance.deleteMany({ userId: req.userId }),
      StudyTask.deleteMany({ userId: req.userId }),
      Resource.deleteMany({ userId: req.userId }),
      SyllabusUnit.deleteMany({ userId: req.userId }),
      SyllabusTopic.deleteMany({ userId: req.userId }),
      Topic.deleteMany({ userId: req.userId }),
      Notification.deleteMany({ userId: req.userId }),
      Timetable.deleteMany({ userId: req.userId }),
      FocusSession.deleteMany({ userId: req.userId }),
      Exam.deleteMany({ userId: req.userId }),
      StudySession.deleteMany({ userId: req.userId })
    ]);

    // Import new data
    const ops = [];

    if (data.subjects?.length) {
      ops.push(Subject.insertMany(data.subjects.map(s => ({ ...s, userId: req.userId, _id: undefined }))));
    }
    if (data.attendance?.length) {
      ops.push(Attendance.insertMany(data.attendance.map(a => ({ ...a, userId: req.userId, _id: undefined }))));
    }
    if (data.tasks?.length) {
      ops.push(StudyTask.insertMany(data.tasks.map(t => ({ ...t, userId: req.userId, _id: undefined }))));
    }
    if (data.resources?.length) {
      ops.push(Resource.insertMany(data.resources.map(r => ({ ...r, userId: req.userId, _id: undefined }))));
    }
    if (data.units?.length) {
      ops.push(SyllabusUnit.insertMany(data.units.map(u => ({ ...u, userId: req.userId, _id: undefined }))));
    }
    if (data.topics?.length) {
      ops.push(Topic.insertMany(data.topics.map(t => ({ ...t, userId: req.userId, _id: undefined }))));
    }
    if (data.syllabusTopics?.length) {
      ops.push(SyllabusTopic.insertMany(data.syllabusTopics.map(t => ({ ...t, userId: req.userId, _id: undefined }))));
    }
    if (data.notifications?.length) {
      ops.push(Notification.insertMany(data.notifications.map(n => ({ ...n, userId: req.userId, _id: undefined }))));
    }
    if (data.timetable || data.customTimes) {
      ops.push(Timetable.create({
        userId: req.userId,
        timetableData: data.timetable || {},
        customTimes: data.customTimes || {}
      }));
    }
    if (data.focusSessions?.length) {
      ops.push(FocusSession.insertMany(data.focusSessions.map(s => ({ ...s, userId: req.userId, _id: undefined }))));
    }
    if (data.exams?.length) {
      ops.push(Exam.insertMany(data.exams.map(e => ({ ...e, userId: req.userId, _id: undefined }))));
    }
    if (data.studySessions?.length) {
      ops.push(StudySession.insertMany(data.studySessions.map(s => ({ ...s, userId: req.userId, _id: undefined }))));
    }

    await Promise.all(ops);

    res.json({ message: 'Data imported successfully' });
  } catch (err) {
    console.error('Import error:', err);
    res.status(500).json({ error: 'Failed to import data' });
  }
});

export default router;
