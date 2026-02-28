import { toast } from 'sonner';
import { useLocalStorage, useClearAllData } from './useLocalStorage';
import { clearAllFiles } from '@/lib/db';
import * as fflate from 'fflate';
import type { EduTrackerExport, Subject, DailyAttendance, StudyMaterial, YouTubePlaylist, StudyTask, CourseProgress, Notification } from '@/types';

export function useImportExport(userId?: string) {
  // Get direct access to localStorage setters with scoped keys
  const [, setSubjects] = useLocalStorage<Subject[]>('edu-tracker-subjects', [], userId);
  const [, setAttendanceData] = useLocalStorage<DailyAttendance[]>('edu-tracker-attendance-v2', [], userId);
  const [, setMaterials] = useLocalStorage<StudyMaterial[]>('edu-tracker-materials', [], userId);
  const [, setPlaylists] = useLocalStorage<YouTubePlaylist[]>('edu-tracker-playlists', [], userId);
  const [, setTasks] = useLocalStorage<StudyTask[]>('edu-tracker-tasks', [], userId);
  const [, setProgressData] = useLocalStorage<CourseProgress[]>('edu-tracker-progress', [], userId);
  const [, setNotifications] = useLocalStorage<Notification[]>('edu-tracker-notifications', [], userId);
  const [, setTimetableData] = useLocalStorage<Record<string, string[]>>('edu-tracker-timetable-data', {}, userId);
  const [, setCustomTimes] = useLocalStorage<Record<string, { startTime: string; endTime: string }[]>>('edu-tracker-timetable-times', {}, userId);

  // Reuse the scoped clearing logic
  const clearAllData = useClearAllData(userId);

  // Helper to get key
  const getKey = (key: string) => userId ? `${userId}:${key}` : key;

  // Get current data for export
  const getCurrentData = () => {
    // Helper to safely parse
    const get = (key: string, def: any) => {
      try {
        const item = localStorage.getItem(getKey(key));
        return item ? JSON.parse(item) : def;
      } catch (e) { return def; }
    };

    return {
      subjects: get('edu-tracker-subjects', []),
      attendance: get('edu-tracker-attendance-v2', []),
      materials: get('edu-tracker-materials', []),
      playlists: get('edu-tracker-playlists', []),
      tasks: get('edu-tracker-tasks', []),
      progress: get('edu-tracker-progress', []),
      notifications: get('edu-tracker-notifications', []),
      timetable: get('edu-tracker-timetable-data', {}),
      customTimes: get('edu-tracker-timetable-times', {})
    };
  };

  // Export all data to JSON
  const exportData = () => {
    try {
      const currentData = getCurrentData();

      const exportData: EduTrackerExport = {
        version: '1.0.0',
        exportDate: new Date().toISOString(),
        userId: userId, // Optional metadata
        data: currentData
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });

      // Create download link
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `edutracker-export-${userId ? userId + '-' : ''}${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Data exported successfully!');
      return true;
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export data');
      return false;
    }
  };

  // Import data from JSON or ZIP file
  const importData = async (file: File, password?: string): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      const readFile = async () => {
        try {
          let content: string;

          if (file.name.match(/\.(zip|ajbak)$/i)) {
            // Read file as ArrayBuffer
            const buffer = await file.arrayBuffer();
            const uint8Array = new Uint8Array(buffer);

            // We need to use callback style
            // @ts-ignore - fflate types might differ slightly in strict mode
            const unzipOptions: any = {};
            if (password) {
              unzipOptions.password = password;
            }

            fflate.unzip(uint8Array, unzipOptions, (err, unzipped) => {
              if (err) {
                if (err.message?.includes('encrypted') || err.message?.includes('password')) {
                  reject(new Error('PASSWORD_REQUIRED'));
                } else if (err.message?.includes('data')) {
                  if (password) reject(new Error('INVALID_PASSWORD'));
                  else reject(new Error('PASSWORD_REQUIRED'));
                } else {
                  reject(err);
                }
                return;
              }

              const jsonFilename = Object.keys(unzipped).find(name => name.endsWith('.json') && !name.startsWith('__MACOSX'));

              if (!jsonFilename) {
                reject(new Error('No JSON data file found in the archive.'));
                return;
              }

              const jsonContent = fflate.strFromU8(unzipped[jsonFilename]);
              processImport(jsonContent, resolve, reject);
            });

          } else {
            content = await file.text();
            processImport(content, resolve, reject);
          }
        } catch (error: any) {
          reject(error);
        }
      };

      readFile();
    });
  };

  const processImport = (content: string, resolve: (val: boolean) => void, reject: (err: any) => void) => {
    try {
      let importedData: any;
      try {
        importedData = JSON.parse(content);
      } catch (e) {
        throw new Error('Invalid JSON content in file.');
      }

      let dataToImport = importedData.data;

      // Handle raw migrations or different structures
      if (!dataToImport && !importedData.version) {
        if (importedData.subjects || importedData.attendance || importedData.tasks) {
          dataToImport = importedData;
        }
      }

      if (!dataToImport) {
        throw new Error('Invalid data structure. Could not find recognizable EduTracker data.');
      }

      const data = dataToImport;

      // Import all data with validation
      if (data.subjects && Array.isArray(data.subjects)) setSubjects(data.subjects);
      if (data.attendance && Array.isArray(data.attendance)) setAttendanceData(data.attendance);
      if (data.materials && Array.isArray(data.materials)) setMaterials(data.materials);
      if (data.playlists && Array.isArray(data.playlists)) setPlaylists(data.playlists);
      if (data.tasks && Array.isArray(data.tasks)) setTasks(data.tasks);
      if (data.progress && Array.isArray(data.progress)) setProgressData(data.progress);
      if (data.notifications && Array.isArray(data.notifications)) setNotifications(data.notifications);
      if (data.timetable && typeof data.timetable === 'object') setTimetableData(data.timetable);
      if (data.customTimes && typeof data.customTimes === 'object') setCustomTimes(data.customTimes);

      toast.success('Data imported successfully!');
      setTimeout(() => window.location.reload(), 1500);
      resolve(true);

    } catch (error) {
      console.error('Process import failed:', error);
      reject(error);
      toast.error('Failed to process data');
      resolve(false);
    }
  };

  return {
    exportData,
    importData,
    clearAllData
  };
}
