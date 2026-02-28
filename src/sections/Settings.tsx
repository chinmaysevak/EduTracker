// ============================================
// Settings Section - Import/Export Functionality
// ============================================

import { useState, useRef } from 'react';
import {
  Download,
  Upload,
  Trash2,
  FileText,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useImportExport } from '@/hooks/useImportExport';

export default function Settings() {
  const { exportData, importData, clearAllData } = useImportExport();
  const [isImporting, setIsImporting] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    exportData();
  };

  const handleImport = async () => {
    if (!selectedFile) return;

    setIsImporting(true);
    try {
      const success = await importData(selectedFile, password);
      if (success) {
        // Clear inputs
        setSelectedFile(null);
        setPassword('');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    } catch (error: any) {
      if (error.message === 'PASSWORD_REQUIRED') {
        alert('This backup is encrypted. Please enter the password securely.');
        // Maybe focus the password field?
      } else if (error.message === 'INVALID_PASSWORD') {
        alert('Incorrect password. Please try again.');
      } else {
        alert(`Import failed: ${error.message}`);
      }
    } finally {
      setIsImporting(false);
    }
  };

  const handleClearData = async () => {
    if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      setIsClearing(true);
      try {
        await clearAllData();
      } finally {
        setIsClearing(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your data with import and export functionality
        </p>
      </div>

      {/* Export Data */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Data
          </CardTitle>
          <CardDescription>
            Download all your EduTracker data as a JSON file for backup or sharing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Alert>
              <FileText className="h-4 w-4" />
              <AlertDescription>
                The exported file contains all your subjects, attendance records, study materials,
                playlists, tasks, progress tracking, notifications, and timetable settings.
                <strong>Note: PDF files are stored separately and are NOT included in the export.</strong>
              </AlertDescription>
            </Alert>
            <Button onClick={handleExport} className="w-full sm:w-auto">
              <Download className="h-4 w-4 mr-2" />
              Export All Data
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Import Data */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import Data
          </CardTitle>
          <CardDescription>
            Restore your data from a previously exported JSON file
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="import-file">Select Backup File (JSON, ZIP, or AJBAK)</Label>
              <div className="flex gap-2">
                <Input
                  ref={fileInputRef}
                  id="import-file"
                  type="file"
                  accept=".json,.zip,.ajbak"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      if (!file.name.match(/\.(json|zip|ajbak)$/i)) {
                        alert('Please select a valid backup file (JSON, ZIP, or AJBAK)');
                        if (fileInputRef.current) fileInputRef.current.value = '';
                        return;
                      }
                      setSelectedFile(file);
                    }
                  }}
                  disabled={isImporting}
                />
                {selectedFile && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setSelectedFile(null);
                      setPassword('');
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {selectedFile && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                <Label htmlFor="backup-password">Backup Password (if encrypted)</Label>
                <Input
                  id="backup-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password..."
                  disabled={isImporting}
                />
              </div>
            )}

            <Button
              onClick={handleImport}
              disabled={isImporting || !selectedFile}
              variant="default"
              className="w-full sm:w-auto"
            >
              <Upload className="h-4 w-4 mr-2" />
              {isImporting ? 'Importing...' : 'Start Import'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Clear Data */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <Trash2 className="h-5 w-5" />
            Clear All Data
          </CardTitle>
          <CardDescription>
            Permanently delete all your EduTracker data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700">
                <strong>Danger Zone:</strong> This action cannot be undone.
                All your data will be permanently deleted.
              </AlertDescription>
            </Alert>

            <Button
              onClick={handleClearData}
              disabled={isClearing}
              variant="destructive"
              className="w-full sm:w-auto"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {isClearing ? 'Clearing...' : 'Clear All Data'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Info Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            About Import/Export
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              <strong>Export:</strong> Creates a complete backup of all your data in JSON format.
              This file can be used to restore your data on this device or import it to another device.
            </p>
            <p>
              <strong>Import:</strong> Restores data from a previously exported file.
              This will replace all existing data in the application.
            </p>
            <p>
              <strong>File Format:</strong> Only JSON files exported from EduTracker can be imported.
              The file includes version information to ensure compatibility.
            </p>
            <p>
              <strong>Data Privacy:</strong> All data is stored locally in your browser.
              No data is sent to external servers during export or import operations.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
