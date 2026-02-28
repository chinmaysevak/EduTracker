// ============================================
// Course Progress Tracker Module (Modern)
// ============================================

import { useState } from 'react';
import { BookOpen, GraduationCap, Target, Edit2, Save, X, ArrowUpRight, Check, BarChart3, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSubjects, useCourseProgress } from '@/hooks/useData';

export default function ProgressTracker() {
  const { subjects } = useSubjects();
  const { setProgress, getProgressForSubject, calculateTeacherProgress, calculateStudentProgress, getOverallProgress } = useCourseProgress();

  const [editingSubject, setEditingSubject] = useState<string | null>(null);
  const [formData, setFormData] = useState({ totalUnits: 0, teacherCompletedUnits: 0, studentCompletedUnits: 0 });

  const overallProgress = getOverallProgress();

  const startEditing = (subjectId: string) => {
    const progress = getProgressForSubject(subjectId);
    setFormData({
      totalUnits: progress.totalUnits,
      teacherCompletedUnits: progress.teacherCompletedUnits,
      studentCompletedUnits: progress.studentCompletedUnits
    });
    setEditingSubject(subjectId);
  };

  const saveProgress = () => {
    if (editingSubject) {
      setProgress(editingSubject, {
        totalUnits: Math.max(0, formData.totalUnits),
        teacherCompletedUnits: Math.min(formData.totalUnits, Math.max(0, formData.teacherCompletedUnits)),
        studentCompletedUnits: Math.min(formData.totalUnits, Math.max(0, formData.studentCompletedUnits))
      });
      setEditingSubject(null);
    }
  };

  const cancelEditing = () => {
    setEditingSubject(null);
    setFormData({ totalUnits: 0, teacherCompletedUnits: 0, studentCompletedUnits: 0 });
  };

  const getProgressStatus = (percentage: number) => {
    if (percentage >= 80) return { label: 'Excellent', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' };
    if (percentage >= 60) return { label: 'Good', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20' };
    if (percentage >= 40) return { label: 'On Track', color: 'text-cyan-600 dark:text-cyan-400', bg: 'bg-cyan-50 dark:bg-cyan-900/20' };
    return { label: 'Need Focus', color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-900/20' };
  };

  const status = getProgressStatus(overallProgress);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold gradient-text">Progress Tracker</h2>
        <p className="text-muted-foreground mt-1">Track your syllabus completion and stay on top of your studies</p>
      </div>

      {/* Overall Progress Card */}
      <Card className="card-modern border-0 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 p-8 text-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
                <BarChart3 className="w-8 h-8" />
              </div>
              <div>
                <p className="text-blue-100 text-sm font-medium mb-1">Overall Progress</p>
                <p className="text-5xl font-bold">{overallProgress}%</p>
              </div>
            </div>
            <div className="flex-1 max-w-md">
              <div className="flex items-center justify-between mb-3">
                <span className="text-blue-100 text-sm">Course Completion</span>
                <Badge className={`${status.bg} ${status.color} border-0 font-medium`}>
                  {status.label}
                </Badge>
              </div>
              <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-white rounded-full transition-all duration-500" style={{ width: `${overallProgress}%` }} />
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Subject Progress Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {subjects.map((subject) => {
          const progress = getProgressForSubject(subject.id);
          const teacherPercentage = calculateTeacherProgress(subject.id);
          const studentPercentage = calculateStudentProgress(subject.id);
          const isEditing = editingSubject === subject.id;
          const subjectStatus = getProgressStatus(studentPercentage);

          return (
            <Card key={subject.id} className={`card-modern border-0 ${isEditing ? 'ring-2 ring-blue-500' : ''}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: subject.color || '#6b7280' }}
                    >
                      {subject.name.charAt(0)}
                    </div>
                    <div>
                      <CardTitle className="text-base">{subject.name}</CardTitle>
                      <CardDescription>
                        {progress.totalUnits > 0 ? `${progress.totalUnits} units total` : 'No progress data'}
                      </CardDescription>
                    </div>
                  </div>
                  {!isEditing ? (
                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg" onClick={() => startEditing(subject.id)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                  ) : (
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg" onClick={saveProgress}>
                        <Save className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg" onClick={cancelEditing}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-5">
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">Total Units</Label>
                      <Input 
                        type="number" 
                        min={0} 
                        value={formData.totalUnits} 
                        onChange={(e) => setFormData({ ...formData, totalUnits: parseInt(e.target.value) || 0 })} 
                        className="mt-1.5 rounded-xl h-12" 
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Teacher Completed</Label>
                      <Input 
                        type="number" 
                        min={0} 
                        max={formData.totalUnits} 
                        value={formData.teacherCompletedUnits} 
                        onChange={(e) => setFormData({ ...formData, teacherCompletedUnits: parseInt(e.target.value) || 0 })} 
                        className="mt-1.5 rounded-xl h-12" 
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Your Completed</Label>
                      <Input 
                        type="number" 
                        min={0} 
                        max={formData.totalUnits} 
                        value={formData.studentCompletedUnits} 
                        onChange={(e) => setFormData({ ...formData, studentCompletedUnits: parseInt(e.target.value) || 0 })} 
                        className="mt-1.5 rounded-xl h-12" 
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Teacher Progress */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center">
                            <GraduationCap className="w-4 h-4 text-white" />
                          </div>
                          <span className="text-sm font-medium text-muted-foreground">Teacher</span>
                        </div>
                        <Badge variant="secondary" className="rounded-lg">{teacherPercentage}%</Badge>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-gray-400 to-gray-500 rounded-full transition-all duration-500" style={{ width: `${teacherPercentage}%` }} />
                      </div>
                    </div>

                    {/* Student Progress */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            studentPercentage >= teacherPercentage 
                              ? 'bg-gradient-to-br from-emerald-400 to-teal-500' 
                              : 'bg-gradient-to-br from-amber-400 to-orange-500'
                          }`}>
                            <Target className="w-4 h-4 text-white" />
                          </div>
                          <span className="text-sm font-medium">You</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={`rounded-lg border-0 ${subjectStatus.bg} ${subjectStatus.color}`}>
                            {subjectStatus.label}
                          </Badge>
                          <span className="text-lg font-bold">{studentPercentage}%</span>
                        </div>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            studentPercentage >= teacherPercentage 
                              ? 'bg-gradient-to-r from-emerald-400 to-teal-500' 
                              : 'bg-gradient-to-r from-amber-400 to-orange-500'
                          }`} 
                          style={{ width: `${studentPercentage}%` }} 
                        />
                      </div>
                    </div>

                    {/* Status Message */}
                    {progress.totalUnits > 0 && (
                      <div className="pt-3 border-t border-border">
                        {studentPercentage >= teacherPercentage ? (
                          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                            <Check className="w-4 h-4" />
                            <span className="text-sm font-medium">
                              {studentPercentage > teacherPercentage ? 'Ahead of class!' : 'On track with class'}
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-rose-500">
                            <ArrowUpRight className="w-4 h-4" />
                            <span className="text-sm font-medium">
                              Catch up needed - {teacherPercentage - studentPercentage}% behind
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Instructions */}
      <Card className="card-modern border-0">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold">How to Use</CardTitle>
              <p className="text-sm text-muted-foreground">Track your syllabus progress effectively</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-muted/50 rounded-2xl">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-3">
                <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="font-semibold mb-1">1. Set Total Units</p>
              <p className="text-sm text-muted-foreground">Enter the total chapters or units in your syllabus</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-2xl">
              <div className="w-10 h-10 rounded-xl bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center mb-3">
                <GraduationCap className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
              </div>
              <p className="font-semibold mb-1">2. Track Teacher</p>
              <p className="text-sm text-muted-foreground">Update units covered by your teacher in class</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-2xl">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-3">
                <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className="font-semibold mb-1">3. Track Yourself</p>
              <p className="text-sm text-muted-foreground">Mark units you've completed on your own</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
