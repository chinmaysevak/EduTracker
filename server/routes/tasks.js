import { Router } from 'express';
import auth from '../middleware/auth.js';
import StudyTask from '../models/StudyTask.js';

const router = Router();
router.use(auth);

// GET /api/tasks
router.get('/', async (req, res) => {
  try {
    const tasks = await StudyTask.find({ userId: req.userId }).sort({ createdAt: -1 });
    const mapped = tasks.map(t => ({
      id: t._id.toString(),
      subjectId: t.subjectId,
      description: t.description,
      targetDate: t.targetDate,
      priority: t.priority,
      status: t.status,
      type: t.type,
      isRecurring: t.isRecurring,
      recurrencePattern: t.recurrencePattern,
      recurringDays: t.recurringDays,
      marks: t.marks,
      estimatedMinutes: t.estimatedMinutes,
      autoPriorityScore: t.autoPriorityScore,
      completedAt: t.completedAt,
      createdAt: t.createdAt
    }));
    res.json(mapped);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// POST /api/tasks
router.post('/', async (req, res) => {
  try {
    const task = await StudyTask.create({ ...req.body, userId: req.userId });
    res.status(201).json({
      id: task._id.toString(),
      subjectId: task.subjectId,
      description: task.description,
      targetDate: task.targetDate,
      priority: task.priority,
      status: task.status,
      type: task.type,
      isRecurring: task.isRecurring,
      recurrencePattern: task.recurrencePattern,
      recurringDays: task.recurringDays,
      marks: task.marks,
      estimatedMinutes: task.estimatedMinutes,
      autoPriorityScore: task.autoPriorityScore,
      completedAt: task.completedAt,
      createdAt: task.createdAt
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// PUT /api/tasks/:id
router.put('/:id', async (req, res) => {
  try {
    const task = await StudyTask.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true }
    );
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json({
      id: task._id.toString(),
      subjectId: task.subjectId,
      description: task.description,
      targetDate: task.targetDate,
      priority: task.priority,
      status: task.status,
      type: task.type,
      isRecurring: task.isRecurring,
      recurrencePattern: task.recurrencePattern,
      recurringDays: task.recurringDays,
      marks: task.marks,
      estimatedMinutes: task.estimatedMinutes,
      autoPriorityScore: task.autoPriorityScore,
      completedAt: task.completedAt,
      createdAt: task.createdAt
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// DELETE /api/tasks/:id
router.delete('/:id', async (req, res) => {
  try {
    const task = await StudyTask.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

// POST /api/tasks/bulk — bulk create
router.post('/bulk', async (req, res) => {
  try {
    const tasks = req.body.map(t => ({ ...t, userId: req.userId }));
    const created = await StudyTask.insertMany(tasks);
    res.status(201).json(created.map(t => ({ ...t.toObject(), id: t._id.toString() })));
  } catch (err) {
    res.status(500).json({ error: 'Failed to bulk create tasks' });
  }
});

export default router;
