import { Router } from 'express';
import auth from '../middleware/auth.js';
import Notification from '../models/Notification.js';

const router = Router();
router.use(auth);

// GET /api/notifications
router.get('/', async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(notifications.map(n => ({
      id: n._id.toString(),
      title: n.title,
      message: n.message,
      type: n.type,
      read: n.read,
      link: n.link,
      createdAt: n.createdAt
    })));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// POST /api/notifications
router.post('/', async (req, res) => {
  try {
    const notification = await Notification.create({ ...req.body, userId: req.userId });
    res.status(201).json({
      id: notification._id.toString(),
      title: notification.title,
      message: notification.message,
      type: notification.type,
      read: notification.read,
      link: notification.link,
      createdAt: notification.createdAt
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create notification' });
  }
});

// POST /api/notifications/bulk — bulk create
router.post('/bulk', async (req, res) => {
  try {
    const notifs = req.body.map(n => ({ ...n, userId: req.userId }));
    const created = await Notification.insertMany(notifs);
    res.status(201).json(created.map(n => ({
      id: n._id.toString(),
      title: n.title,
      message: n.message,
      type: n.type,
      read: n.read,
      link: n.link,
      createdAt: n.createdAt
    })));
  } catch (err) {
    res.status(500).json({ error: 'Failed to bulk create notifications' });
  }
});

// PUT /api/notifications/:id
router.put('/:id', async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true }
    );
    if (!notification) return res.status(404).json({ error: 'Notification not found' });
    res.json({
      id: notification._id.toString(),
      title: notification.title,
      message: notification.message,
      type: notification.type,
      read: notification.read,
      link: notification.link,
      createdAt: notification.createdAt
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update notification' });
  }
});

// PUT /api/notifications/read-all — mark all as read
router.put('/read-all/batch', async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.userId, read: false },
      { read: true }
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark all as read' });
  }
});

// DELETE /api/notifications/:id
router.delete('/:id', async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!notification) return res.status(404).json({ error: 'Notification not found' });
    res.json({ message: 'Notification deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});

export default router;
