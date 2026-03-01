import { toast } from 'sonner';
import * as fflate from 'fflate';
import api from '@/lib/api';
import type { EduTrackerExport } from '@/types';

export function useImportExport(_userId?: string) {
  // Export all data via API
  const exportData = async () => {
    try {
      const currentData = await api.get<any>('/import-export/export');

      const exportPayload: EduTrackerExport = {
        version: '1.0.0',
        exportDate: new Date().toISOString(),
        data: currentData
      };

      const dataStr = JSON.stringify(exportPayload, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });

      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `edutracker-export-${new Date().toISOString().split('T')[0]}.json`;
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
            const buffer = await file.arrayBuffer();
            const uint8Array = new Uint8Array(buffer);

            // @ts-ignore
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

  const processImport = async (content: string, resolve: (val: boolean) => void, reject: (err: any) => void) => {
    try {
      let importedData: any;
      try {
        importedData = JSON.parse(content);
      } catch (e) {
        throw new Error('Invalid JSON content in file.');
      }

      let dataToImport = importedData.data;

      if (!dataToImport && !importedData.version) {
        if (importedData.subjects || importedData.attendance || importedData.tasks) {
          dataToImport = importedData;
        }
      }

      if (!dataToImport) {
        throw new Error('Invalid data structure. Could not find recognizable EduTracker data.');
      }

      // Send to server for bulk import
      await api.post('/import-export/import', dataToImport);

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

  const clearAllData = async () => {
    try {
      // Import empty data to clear everything
      await api.post('/import-export/import', {
        subjects: [], attendance: [], resources: [], tasks: [],
        units: [], topics: [], notifications: [],
        timetable: {}, customTimes: {}
      });
      toast.success('All data cleared!');
      setTimeout(() => window.location.reload(), 1500);
    } catch (error) {
      console.error('Clear failed:', error);
      toast.error('Failed to clear data');
    }
  };

  return {
    exportData,
    importData,
    clearAllData
  };
}
