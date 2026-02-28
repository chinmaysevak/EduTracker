// ============================================
// Study Planner Module (Modern)
// ============================================

import { useState } from 'react';
import {
  Plus,
  CheckCircle2,
  Circle,
  Trash2,
  Edit2,
  Clock,
  Filter,
  Search,
  ClipboardList,
  AlertTriangle,
  Flame,
  ListTodo
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSubjects, useStudyTasks } from '@/hooks/useData';
import { toast } from 'sonner';
import type { StudyTask } from '@/types';

export default function StudyPlanner() {
  const { subjects } = useSubjects();
  const { tasks, addTask, updateTask, deleteTask, toggleTaskStatus, getPendingTasks, getCompletedTasks, getOverdueTasks, getTodaysTasks } = useStudyTasks();

  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<StudyTask | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<StudyTask | null>(null);

  const [formData, setFormData] = useState({
    subjectId: '',
    description: '',
    targetDate: new Date().toISOString().split('T')[0],
    priority: 'medium' as 'low' | 'medium' | 'high',
    estimatedMinutes: '',
    marks: ''
  });

  const filteredTasks = tasks.filter(t => {
    const matchesSubject = selectedSubject === 'all' || t.subjectId === selectedSubject;
    const matchesSearch = t.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSubject && matchesSearch;
  });

  const pendingTasks = filteredTasks.filter(t => t.status === 'pending');
  const completedTasks = filteredTasks.filter(t => t.status === 'completed');
  const overdueTasks = getOverdueTasks();
  const todaysTasks = getTodaysTasks();

  const getSubjectName = (subjectId: string) => subjects.find(s => s.id === subjectId)?.name || subjectId;
  const getSubjectColor = (subjectId: string) => subjects.find(s => s.id === subjectId)?.color || '#6b7280';

  const isOverdue = (task: StudyTask) => {
    if (task.status === 'completed') return false;
    const today = new Date().toISOString().split('T')[0];
    return task.targetDate < today;
  };

  const isDueToday = (task: StudyTask) => {
    const today = new Date().toISOString().split('T')[0];
    return task.targetDate === today;
  };

  const handleAddTask = () => {
    if (formData.description.trim() && formData.subjectId) {
      addTask({
        subjectId: formData.subjectId,
        description: formData.description.trim(),
        targetDate: formData.targetDate,
        priority: formData.priority,
        estimatedMinutes: formData.estimatedMinutes ? parseInt(formData.estimatedMinutes) : undefined,
        marks: formData.marks ? parseInt(formData.marks) : undefined
      });
      setFormData({
        subjectId: '',
        description: '',
        targetDate: new Date().toISOString().split('T')[0],
        priority: 'medium',
        estimatedMinutes: '',
        marks: ''
      });
      setIsAddDialogOpen(false);
      toast.success('Task added successfully');
    } else {
      toast.error('Please fill in all required fields');
    }
  };

  const handleUpdateTask = () => {
    if (editingTask && formData.description.trim()) {
      updateTask(editingTask.id, {
        description: formData.description.trim(),
        targetDate: formData.targetDate,
        priority: formData.priority,
        estimatedMinutes: formData.estimatedMinutes ? parseInt(formData.estimatedMinutes) : undefined,
        marks: formData.marks ? parseInt(formData.marks) : undefined
      });
      setEditingTask(null);
      setFormData({
        subjectId: '',
        description: '',
        targetDate: new Date().toISOString().split('T')[0],
        priority: 'medium',
        estimatedMinutes: '',
        marks: ''
      });
      toast.success('Task updated');
    }
  };

  const openEditDialog = (task: StudyTask) => {
    setEditingTask(task);
    setFormData({
      subjectId: task.subjectId || '',
      description: task.description,
      targetDate: task.targetDate,
      priority: task.priority || 'medium',
      estimatedMinutes: task.estimatedMinutes?.toString() || '',
      marks: task.marks?.toString() || ''
    });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (dateStr === today.toISOString().split('T')[0]) return 'Today';
    if (dateStr === tomorrow.toISOString().split('T')[0]) return 'Tomorrow';

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const stats = {
    total: tasks.length,
    pending: getPendingTasks().length,
    completed: getCompletedTasks().length,
    overdue: overdueTasks.length,
    today: todaysTasks.length
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold gradient-text">Study Planner</h2>
          <p className="text-muted-foreground mt-1">Plan and track your study tasks</p>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="btn-gradient rounded-xl gap-2">
              <Plus className="w-4 h-4" />
              Add Task
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg card-modern border-0">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                  <ListTodo className="w-5 h-5 text-white" />
                </div>
                Add New Task
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <Label className="text-sm font-medium">Subject</Label>
                <Select value={formData.subjectId} onValueChange={(v) => setFormData({ ...formData, subjectId: v })}>
                  <SelectTrigger className="mt-1.5 rounded-xl h-12">
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {subjects.map(s => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium">Task Description</Label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g., Complete Chapter 5 exercises"
                  className="mt-1.5 rounded-xl h-12"
                />
              </div>



              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Est. Time (mins)</Label>
                  <Input
                    type="number"
                    placeholder="e.g. 60"
                    value={formData.estimatedMinutes}
                    onChange={(e) => setFormData({ ...formData, estimatedMinutes: e.target.value })}
                    className="mt-1.5 rounded-xl h-12"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">Marks / Weight</Label>
                  <Input
                    type="number"
                    placeholder="e.g. 100"
                    value={formData.marks}
                    onChange={(e) => setFormData({ ...formData, marks: e.target.value })}
                    className="mt-1.5 rounded-xl h-12"
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Target Date</Label>
                <Input
                  type="date"
                  value={formData.targetDate}
                  onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                  className="mt-1.5 rounded-xl h-12"
                />
              </div>

              <div>
                <Label className="text-sm font-medium">Priority</Label>
                <Select value={formData.priority} onValueChange={(v) => setFormData({ ...formData, priority: v as 'low' | 'medium' | 'high' })}>
                  <SelectTrigger className="mt-1.5 rounded-xl h-12">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleAddTask} className="w-full btn-gradient rounded-xl h-12">
                Add Task
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <Card className="card-modern card-hover border-0">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center shadow-lg">
                <ClipboardList className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-3xl font-bold">{stats.total}</p>
            <p className="text-sm text-muted-foreground">Total Tasks</p>
          </CardContent>
        </Card>

        <Card className="card-modern card-hover border-0">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
                <Clock className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-3xl font-bold text-amber-500">{stats.pending}</p>
            <p className="text-sm text-muted-foreground">Pending</p>
          </CardContent>
        </Card>

        <Card className="card-modern card-hover border-0">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-3xl font-bold text-emerald-600">{stats.completed}</p>
            <p className="text-sm text-muted-foreground">Completed</p>
          </CardContent>
        </Card>

        <Card className="card-modern card-hover border-0">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-400 to-red-500 flex items-center justify-center shadow-lg">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-3xl font-bold text-rose-500">{stats.overdue}</p>
            <p className="text-sm text-muted-foreground">Overdue</p>
          </CardContent>
        </Card>

        <Card className="card-modern card-hover border-0">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-lg">
                <Flame className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-3xl font-bold text-cyan-600">{stats.today}</p>
            <p className="text-sm text-muted-foreground">Due Today</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-12 rounded-xl"
          />
        </div>
        <Select value={selectedSubject} onValueChange={setSelectedSubject}>
          <SelectTrigger className="w-full sm:w-56 h-12 rounded-xl">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter by subject" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="all">All Subjects</SelectItem>
            {subjects.map(s => (
              <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tasks Tabs */}
      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 rounded-xl h-12">
          <TabsTrigger value="pending" className="rounded-lg">Pending ({pendingTasks.length})</TabsTrigger>
          <TabsTrigger value="completed" className="rounded-lg">Completed ({completedTasks.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          {pendingTasks.length === 0 ? (
            <Card className="card-modern border-0">
              <CardContent className="py-16 text-center">
                <div className="w-20 h-20 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                </div>
                <p className="text-lg font-semibold text-muted-foreground">All caught up!</p>
                <p className="text-sm text-muted-foreground mt-1">No pending tasks</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {pendingTasks.sort((a, b) => new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime()).map(task => (
                <TaskRow
                  key={task.id}
                  task={task}
                  onToggle={() => toggleTaskStatus(task.id)}
                  onEdit={() => openEditDialog(task)}
                  onDelete={() => setTaskToDelete(task)}
                  isOverdue={isOverdue(task)}
                  isDueToday={isDueToday(task)}
                  getSubjectName={getSubjectName}
                  getSubjectColor={getSubjectColor}
                  formatDate={formatDate}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed">
          {completedTasks.length === 0 ? (
            <Card className="card-modern border-0">
              <CardContent className="py-16 text-center">
                <div className="w-20 h-20 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center mx-auto mb-4">
                  <ClipboardList className="w-10 h-10 text-amber-500" />
                </div>
                <p className="text-lg font-semibold text-muted-foreground">No completed tasks yet</p>
                <p className="text-sm text-muted-foreground mt-1">Start completing tasks to see them here</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {completedTasks.sort((a, b) => new Date(b.targetDate).getTime() - new Date(a.targetDate).getTime()).map(task => (
                <TaskRow
                  key={task.id}
                  task={task}
                  onToggle={() => toggleTaskStatus(task.id)}
                  onEdit={() => openEditDialog(task)}
                  onDelete={() => setTaskToDelete(task)}
                  isOverdue={false}
                  isDueToday={false}
                  getSubjectName={getSubjectName}
                  getSubjectColor={getSubjectColor}
                  formatDate={formatDate}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={!!editingTask} onOpenChange={() => setEditingTask(null)}>
        <DialogContent className="sm:max-w-lg card-modern border-0">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Edit Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <Label className="text-sm font-medium">Task Description</Label>
              <Input value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="mt-1.5 rounded-xl h-12" />
            </div>
            <div>
              <Label className="text-sm font-medium">Target Date</Label>
              <Input type="date" value={formData.targetDate} onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })} className="mt-1.5 rounded-xl h-12" />
            </div>
            <div>
              <Label className="text-sm font-medium">Priority</Label>
              <Select value={formData.priority} onValueChange={(v) => setFormData({ ...formData, priority: v as 'low' | 'medium' | 'high' })}>
                <SelectTrigger className="mt-1.5 rounded-xl h-12">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-3">
              <Button onClick={handleUpdateTask} className="flex-1 btn-gradient rounded-xl h-12">Update</Button>
              <Button variant="outline" onClick={() => setEditingTask(null)} className="rounded-xl h-12 px-6">Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete task confirmation */}
      <AlertDialog open={!!taskToDelete} onOpenChange={(open) => !open && setTaskToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete task?</AlertDialogTitle>
            <AlertDialogDescription>
              {taskToDelete && `"${taskToDelete.description}" will be permanently removed. This cannot be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => {
                if (taskToDelete) {
                  deleteTask(taskToDelete.id);
                  setTaskToDelete(null);
                  toast.success('Task deleted.');
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div >
  );
}

interface TaskRowProps {
  task: StudyTask;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  isOverdue: boolean;
  isDueToday: boolean;
  getSubjectName: (id: string) => string;
  getSubjectColor: (id: string) => string;
  formatDate: (date: string) => string;
}

function TaskRow({ task, onToggle, onEdit, onDelete, isOverdue, isDueToday, getSubjectName, getSubjectColor, formatDate }: TaskRowProps) {
  const isCompleted = task.status === 'completed';
  const subjectColor = task.subjectId ? getSubjectColor(task.subjectId) : '#ccc';

  return (
    <div
      className={`
        flex items-start gap-4 p-4 rounded-2xl border transition-all duration-300
        ${isCompleted ? 'bg-muted/30 border-muted' : 'bg-card border-border'}
        ${isOverdue ? 'border-rose-200 dark:border-rose-800 bg-rose-50/30 dark:bg-rose-900/10' : ''}
        ${isDueToday && !isCompleted ? 'border-amber-200 dark:border-amber-800 bg-amber-50/30 dark:bg-amber-900/10' : ''}
      `}
    >
      <button onClick={onToggle} className="mt-1 flex-shrink-0">
        {isCompleted ? (
          <CheckCircle2 className="w-6 h-6 text-emerald-500" />
        ) : (
          <Circle className="w-6 h-6 text-muted-foreground hover:text-violet-500 transition-colors" />
        )}
      </button>

      <div className="flex-1 min-w-0">
        <p className={`font-medium ${isCompleted ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
          {task.description}
        </p>
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: subjectColor }} />
            <span className="text-xs text-muted-foreground">{task.subjectId ? getSubjectName(task.subjectId) : 'No Subject'}</span>
          </div>
          <Badge variant="secondary" className={`
            rounded-lg text-xs
            ${isOverdue ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' : ''}
            ${isDueToday && !isCompleted ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : ''}
          `}>
            {formatDate(task.targetDate)}
          </Badge>
          <Badge className={`rounded-lg text-xs ${task.priority === 'high' ? 'bg-rose-500 text-white' :
            task.priority === 'medium' ? 'bg-amber-500 text-white' :
              'bg-blue-500 text-white'
            }`}>
            {task.priority ? task.priority.charAt(0).toUpperCase() + task.priority.slice(1) : 'Medium'}
          </Badge>
          {isOverdue && <Badge variant="destructive" className="rounded-lg text-xs">Overdue</Badge>}
          {isDueToday && !isCompleted && <Badge className="rounded-lg text-xs bg-amber-500 text-white">Due Today</Badge>}
        </div>
      </div>

      <div className="flex items-center gap-1 flex-shrink-0">
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={onEdit}>
          <Edit2 className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-rose-500" onClick={onDelete}>
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
