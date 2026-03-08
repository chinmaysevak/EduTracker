import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env') });

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

// Route imports
import authRoutes from './routes/auth.js';
import subjectRoutes from './routes/subjects.js';
import attendanceRoutes from './routes/attendance.js';
import taskRoutes from './routes/tasks.js';
import resourceRoutes from './routes/resources.js';
import syllabusRoutes from './routes/syllabus.js';
import topicRoutes from './routes/topics.js';
import timetableRoutes from './routes/timetable.js';
import notificationRoutes from './routes/notifications.js';
import profileRoutes from './routes/profile.js';
import focusRoutes from './routes/focus.js';
import examRoutes from './routes/exams.js';
import studySessionRoutes from './routes/studysessions.js';
import importExportRoutes from './routes/importExport.js';
import settingsRoutes from './routes/settings.js';
import usersRoutes from './routes/users.js';
import aiRoutes from './routes/ai.js';
import syllabusScannerRoutes from './routes/syllabusScanner.js';
import chatHistoryRoutes from './routes/chatHistory.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:4173',
  "https://grand-tiramisu-04f08b.netlify.app"];
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/syllabus', syllabusRoutes);
app.use('/api/topics', topicRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/focus-sessions', focusRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/studysessions', studySessionRoutes);
app.use('/api/import-export', importExportRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/syllabus-scanner', syllabusScannerRoutes);
app.use('/api/chat-history', chatHistoryRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

// Connect to MongoDB and start server
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB Atlas');
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });
