import { Router } from 'express';
import auth from '../middleware/auth.js';
import User from '../models/User.js';
import Subject from '../models/Subject.js';
import Attendance from '../models/Attendance.js';
import Resource from '../models/Resource.js';
import StudyTask from '../models/StudyTask.js';
import SyllabusUnit from '../models/SyllabusUnit.js';
import SyllabusTopic from '../models/SyllabusTopic.js';
import Topic from '../models/Topic.js';
import Notification from '../models/Notification.js';
import Timetable from '../models/Timetable.js';
import FocusSession from '../models/FocusSession.js';
import Exam from '../models/Exam.js';
import StudySession from '../models/StudySession.js';
import UserProfile from '../models/UserProfile.js';

const router = Router();
router.use(auth);

// GET /api/settings — return current user settings
router.get('/', async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('-passwordHash');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            name: user.name,
            email: user.email,
            profilePhoto: user.profilePhoto || '',
            attendanceGoal: user.attendanceGoal ?? 75,
            theme: user.theme || 'system',
            notifications: {
                attendanceReminder: user.notifications?.attendanceReminder ?? true,
                studyReminder: user.notifications?.studyReminder ?? true,
                assignmentReminder: user.notifications?.assignmentReminder ?? true
            },
            createdAt: user.createdAt
        });
    } catch (err) {
        console.error('Get settings error:', err);
        res.status(500).json({ error: 'Failed to fetch settings' });
    }
});

// PUT /api/settings/profile — update name, email, profilePhoto
router.put('/profile', async (req, res) => {
    try {
        const { name, email, profilePhoto } = req.body;
        const update = {};

        if (name !== undefined) update.name = name.trim();
        if (email !== undefined) update.email = email.toLowerCase().trim();
        if (profilePhoto !== undefined) update.profilePhoto = profilePhoto;

        if (Object.keys(update).length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
        }

        // If email is being changed, check for duplicates
        if (update.email) {
            const existing = await User.findOne({ email: update.email, _id: { $ne: req.userId } });
            if (existing) {
                return res.status(409).json({ error: 'Email already in use by another account' });
            }
        }

        const user = await User.findByIdAndUpdate(req.userId, update, { new: true }).select('-passwordHash');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            name: user.name,
            email: user.email,
            profilePhoto: user.profilePhoto || ''
        });
    } catch (err) {
        console.error('Update profile error:', err);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

// PUT /api/settings/preferences — update attendanceGoal, theme, notifications
router.put('/preferences', async (req, res) => {
    try {
        const { attendanceGoal, theme, notifications } = req.body;
        const update = {};

        if (attendanceGoal !== undefined) update.attendanceGoal = Number(attendanceGoal);
        if (theme !== undefined) {
            if (!['dark', 'light', 'system'].includes(theme)) {
                return res.status(400).json({ error: 'Invalid theme value' });
            }
            update.theme = theme;
        }
        if (notifications !== undefined) {
            update.notifications = {
                attendanceReminder: notifications.attendanceReminder ?? true,
                studyReminder: notifications.studyReminder ?? true,
                assignmentReminder: notifications.assignmentReminder ?? true
            };
        }

        if (Object.keys(update).length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
        }

        const user = await User.findByIdAndUpdate(req.userId, update, { new: true }).select('-passwordHash');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            attendanceGoal: user.attendanceGoal,
            theme: user.theme,
            notifications: user.notifications
        });
    } catch (err) {
        console.error('Update preferences error:', err);
        res.status(500).json({ error: 'Failed to update preferences' });
    }
});

// GET /api/settings/storage — return data counts
router.get('/storage', async (req, res) => {
    try {
        const [subjects, attendance, materials] = await Promise.all([
            Subject.countDocuments({ userId: req.userId }),
            Attendance.countDocuments({ userId: req.userId }),
            Resource.countDocuments({ userId: req.userId })
        ]);

        res.json({ subjects, attendance, materials });
    } catch (err) {
        console.error('Storage info error:', err);
        res.status(500).json({ error: 'Failed to fetch storage info' });
    }
});

// DELETE /api/settings/clear — delete all user data except the account
router.delete('/clear', async (req, res) => {
    try {
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
            StudySession.deleteMany({ userId: req.userId }),
            UserProfile.deleteMany({ userId: req.userId })
        ]);

        res.json({ message: 'All data cleared successfully' });
    } catch (err) {
        console.error('Clear data error:', err);
        res.status(500).json({ error: 'Failed to clear data' });
    }
});

export default router;
