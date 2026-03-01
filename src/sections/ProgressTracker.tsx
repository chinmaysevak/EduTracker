import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStudentStore } from '@/context/StudentContext';
import ProgressSummary from '@/components/progress/ProgressSummary';
import SubjectProgressCard from '@/components/progress/SubjectProgressCard';
import AddSubjectModal from '@/components/progress/AddSubjectModal';

export default function ProgressTracker() {
  const { subjects } = useStudentStore();
  const [isAddSubjectOpen, setIsAddSubjectOpen] = useState(false);

  return (
    <div className="h-full flex flex-col pt-16 md:pt-0 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-8">
      {/* Header section */}
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Progress Tracker</h1>
          <p className="text-muted-foreground mt-1">Track your syllabus completion status alongside your teacher's.</p>
        </div>
        <Button onClick={() => setIsAddSubjectOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" /> Add Subject
        </Button>
      </div>

      <ProgressSummary />

      <div className="flex-1 mt-4 space-y-4">
        <h2 className="text-xl font-bold mb-4">Subjects Overview</h2>

        {subjects.subjects.length === 0 ? (
          <div className="text-center p-12 bg-card border border-border/50 rounded-2xl">
            <h3 className="text-lg font-medium mb-2">No subjects added</h3>
            <p className="text-muted-foreground mb-6">Start by adding your subjects to track your syllabus progress.</p>
            <Button onClick={() => setIsAddSubjectOpen(true)}>
              <Plus className="w-4 h-4 mr-2" /> Add Your First Subject
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {subjects.subjects.map(subject => (
              <SubjectProgressCard key={subject.id} subject={subject} />
            ))}
          </div>
        )}
      </div>

      {isAddSubjectOpen && (
        <AddSubjectModal onClose={() => setIsAddSubjectOpen(false)} />
      )}
    </div>
  );
}
