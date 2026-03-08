import { Router } from 'express';
import auth from '../middleware/auth.js';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';

const router = Router();
router.use(auth);

// GET /api/users/me — Get current user profile
router.get('/me', async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      profilePhoto: user.profilePhoto || '',
      role: user.role || 'student',
      institution: user.institution || '',
      bio: user.bio || '',
      preferences: user.preferences || {
        theme: 'system',
        emailNotifications: true,
        attendanceReminder: true,
        studyReminder: true,
        assignmentReminder: true
      },
      attendanceGoal: user.attendanceGoal || 75,
      theme: user.theme || 'system',
      notifications: user.notifications || {
        attendanceReminder: true,
        studyReminder: true,
        assignmentReminder: true
      },
      emailVerified: user.emailVerified || false,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt
    });
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// PUT /api/users/update — Update user profile
router.put('/update', async (req, res) => {
  try {
    const { name, email, institution, bio, profilePhoto } = req.body;
    const update = {};

    if (name !== undefined) update.name = name.trim();
    if (email !== undefined) update.email = email.toLowerCase().trim();
    if (institution !== undefined) update.institution = institution.trim();
    if (bio !== undefined) update.bio = bio.trim();
    if (profilePhoto !== undefined) update.profilePhoto = profilePhoto;

    console.log(`[users/update] req.userId:`, req.userId);
    console.log(`[users/update] update:`, update);

    // If email is being changed, check for duplicates
    if (update.email) {
      const existing = await User.findOne({ email: update.email, _id: { $ne: req.userId } });
      if (existing) {
        return res.status(409).json({ error: 'Email already in use by another account' });
      }
    }

    if (Object.keys(update).length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    const user = await User.findByIdAndUpdate(req.userId, update, { new: true }).select('-passwordHash');
    console.log(`[users/update] user returned:`, user ? "Found!" : "Null!");
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      name: user.name,
      email: user.email,
      profilePhoto: user.profilePhoto || '',
      institution: user.institution || '',
      bio: user.bio || ''
    });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// PUT /api/users/preferences — Update user preferences
router.put('/preferences', async (req, res) => {
  try {
    const { preferences, attendanceGoal, theme, notifications } = req.body;
    const update = {};

    if (preferences !== undefined) {
      update.preferences = {
        theme: preferences.theme || 'system',
        emailNotifications: preferences.emailNotifications ?? true,
        attendanceReminder: preferences.attendanceReminder ?? true,
        studyReminder: preferences.studyReminder ?? true,
        assignmentReminder: preferences.assignmentReminder ?? true
      };
    }

    if (attendanceGoal !== undefined) {
      update.attendanceGoal = Number(attendanceGoal);
    }

    if (theme !== undefined) {
      if (!['dark', 'light', 'system'].includes(theme)) {
        return res.status(400).json({ error: 'Invalid theme value' });
      }
      update.theme = theme;
      if (!update.preferences) update.preferences = {};
      update.preferences.theme = theme;
    }

    if (notifications !== undefined) {
      update.notifications = {
        attendanceReminder: notifications.attendanceReminder ?? true,
        studyReminder: notifications.studyReminder ?? true,
        assignmentReminder: notifications.assignmentReminder ?? true
      };
      if (!update.preferences) update.preferences = {};
      update.preferences.attendanceReminder = notifications.attendanceReminder ?? true;
      update.preferences.studyReminder = notifications.studyReminder ?? true;
      update.preferences.assignmentReminder = notifications.assignmentReminder ?? true;
    }

    if (Object.keys(update).length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    const user = await User.findByIdAndUpdate(req.userId, update, { new: true }).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      preferences: user.preferences,
      attendanceGoal: user.attendanceGoal,
      theme: user.theme,
      notifications: user.notifications
    });
  } catch (err) {
    console.error('Update preferences error:', err);
    res.status(500).json({ error: 'Failed to update preferences' });
  }
});

// PUT /api/users/change-password — Change password
router.put('/change-password', async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ error: 'All password fields are required' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: 'New passwords do not match' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Update password
    user.passwordHash = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

// PUT /api/users/change-email — Change email (requires password verification)
router.put('/change-email', async (req, res) => {
  try {
    const { newEmail, password } = req.body;

    if (!newEmail || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      return res.status(400).json({ error: 'Please enter a valid email address' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if email is already in use by another user
    const existingUser = await User.findOne({ email: newEmail.toLowerCase(), _id: { $ne: req.userId } });
    if (existingUser) {
      return res.status(409).json({ error: 'This email is already in use by another account' });
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Incorrect password' });
    }

    // Check if the new email is the same as current
    if (newEmail.toLowerCase() === user.email.toLowerCase()) {
      return res.status(400).json({ error: 'This is already your current email' });
    }

    // Update email (for now, directly - can add verification later)
    user.email = newEmail.toLowerCase().trim();
    user.emailVerified = false; // Require verification for new email
    await user.save();

    res.json({
      message: 'Email changed successfully. Please verify your new email.',
      email: user.email
    });
  } catch (err) {
    console.error('Change email error:', err);
    res.status(500).json({ error: 'Failed to change email' });
  }
});

// POST /api/users/delete — Delete account
router.post('/delete', async (req, res) => {
  try {
    const { confirmEmail } = req.body;
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Require email confirmation for deletion
    if (confirmEmail !== user.email) {
      return res.status(400).json({ error: 'Please enter your email to confirm account deletion' });
    }

    // Delete user account
    await User.findByIdAndDelete(req.userId);

    res.json({ message: 'Account deleted successfully' });
  } catch (err) {
    console.error('Delete account error:', err);
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

export default router;
