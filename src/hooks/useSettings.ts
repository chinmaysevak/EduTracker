// ============================================
// Settings Hook — MongoDB-backed via API
// ============================================

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { toast } from 'sonner';

export interface UserSettings {
    name: string;
    email: string;
    profilePhoto: string;
    attendanceGoal: number;
    theme: 'dark' | 'light' | 'system';
    notifications: {
        attendanceReminder: boolean;
        studyReminder: boolean;
        assignmentReminder: boolean;
    };
    createdAt: string;
}

export interface StorageInfo {
    subjects: number;
    attendance: number;
    materials: number;
}

export function useSettings() {
    const [settings, setSettings] = useState<UserSettings | null>(null);
    const [storageInfo, setStorageInfo] = useState<StorageInfo | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Load settings from API on mount
    const loadSettings = useCallback(async () => {
        try {
            setIsLoading(true);
            const data = await api.get<UserSettings>('/settings');
            setSettings(data);
        } catch (err) {
            console.error('Failed to load settings:', err);
            toast.error('Failed to load settings');
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Load storage info
    const loadStorageInfo = useCallback(async () => {
        try {
            const data = await api.get<StorageInfo>('/settings/storage');
            setStorageInfo(data);
        } catch (err) {
            console.error('Failed to load storage info:', err);
        }
    }, []);

    useEffect(() => {
        loadSettings();
        loadStorageInfo();
    }, [loadSettings, loadStorageInfo]);

    // Update profile (name, email)
    const updateProfile = useCallback(async (name: string, email: string) => {
        try {
            setIsSaving(true);
            const data = await api.put<{ name: string; email: string; profilePhoto: string }>('/settings/profile', { name, email });
            setSettings(prev => prev ? { ...prev, ...data } : prev);
            toast.success('Profile updated successfully');
            return true;
        } catch (err: any) {
            console.error('Failed to update profile:', err);
            toast.error(err.message || 'Failed to update profile');
            return false;
        } finally {
            setIsSaving(false);
        }
    }, []);

    // Update theme
    const updateTheme = useCallback(async (theme: 'dark' | 'light' | 'system') => {
        try {
            await api.put('/settings/preferences', { theme });
            setSettings(prev => prev ? { ...prev, theme } : prev);
        } catch (err) {
            console.error('Failed to save theme:', err);
            toast.error('Failed to save theme preference');
        }
    }, []);

    // Update attendance goal
    const updateAttendanceGoal = useCallback(async (attendanceGoal: number) => {
        try {
            await api.put('/settings/preferences', { attendanceGoal });
            setSettings(prev => prev ? { ...prev, attendanceGoal } : prev);
            toast.success('Attendance goal updated');
        } catch (err) {
            console.error('Failed to save attendance goal:', err);
            toast.error('Failed to save attendance goal');
        }
    }, []);

    // Update notification toggle
    const updateNotification = useCallback(async (key: 'attendanceReminder' | 'studyReminder' | 'assignmentReminder', value: boolean) => {
        try {
            const notifications = {
                ...(settings?.notifications || { attendanceReminder: true, studyReminder: true, assignmentReminder: true }),
                [key]: value
            };
            await api.put('/settings/preferences', { notifications });
            setSettings(prev => prev ? { ...prev, notifications } : prev);
        } catch (err) {
            console.error('Failed to update notification:', err);
            toast.error('Failed to update notification setting');
        }
    }, [settings?.notifications]);

    // Clear all data
    const clearAllData = useCallback(async () => {
        try {
            setIsSaving(true);
            await api.delete('/settings/clear');
            toast.success('All data cleared successfully');
            // Reload storage info to show 0 counts
            await loadStorageInfo();
            return true;
        } catch (err) {
            console.error('Failed to clear data:', err);
            toast.error('Failed to clear data');
            return false;
        } finally {
            setIsSaving(false);
        }
    }, [loadStorageInfo]);

    return {
        settings,
        storageInfo,
        isLoading,
        isSaving,
        updateProfile,
        updateTheme,
        updateAttendanceGoal,
        updateNotification,
        clearAllData,
        loadSettings,
        loadStorageInfo,
    };
}
