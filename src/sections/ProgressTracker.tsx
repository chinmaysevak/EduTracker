import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStudentStore } from '@/context/StudentContext';
import ProgressSummary from '@/components/progress/ProgressSummary';
import SubjectProgressCard from '@/components/progress/SubjectProgressCard';
import AddSubjectModal from '@/components/progress/AddSubjectModal';
import { SyllabusScanner } from '@/components/SyllabusScanner';
import { toast } from 'sonner';

export default function ProgressTracker() {
  const { subjects, syllabus } = useStudentStore();
  const [isAddSubjectOpen, setIsAddSubjectOpen] = useState(false);

  const handleSyllabusImport = (data: { subjects: { name: string; units: { name: string; topics: string[] }[] }[] }) => {
    try {
      data.subjects.forEach(s => {
        // Add subject if it doesn't exist
        const existing = subjects.subjects.find(sub => sub.name.toLowerCase() === s.name.toLowerCase());
        if (!existing) {
          subjects.addSubject(s.name);
        }
        // Find the subject (just added or existing)
        const subject = subjects.subjects.find(sub => sub.name.toLowerCase() === s.name.toLowerCase());
        if (subject) {
          s.units.forEach(u => {
            syllabus.addUnit(subject.id, u.name);
          });
        }
      });
      toast.success('Syllabus imported! Subjects and units have been created.');
    } catch (err) {
      toast.error('Failed to import some items');
    }
  };

  return (
    <div className="settings-bg h-full flex flex-col max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-8">
      {/* Header section */}
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Progress Tracker</h1>
          <p className="text-muted-foreground mt-1">Track your syllabus completion status alongside your teacher's.</p>
        </div>
        <Button onClick={() => setIsAddSubjectOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" /> Add Subject
        </Button>
      </div>

      {/* AI Syllabus Scanner */}
      <div className="mb-4">
        <SyllabusScanner onImport={handleSyllabusImport} />
      </div>

      <ProgressSummary />

      <div className="flex-1 mt-4 space-y-4">
        <h2 className="text-xl font-bold mb-4">Subjects Overview</h2>

        {subjects.subjects.length === 0 ? (
          <div className="text-center p-8 bg-card border border-border/50 rounded-2xl">
            <h3 className="text-lg font-medium mb-2">No subjects added</h3>
            <p className="text-muted-foreground mb-6">Start by adding your subjects to track your syllabus progress.</p>
            <Button onClick={() => setIsAddSubjectOpen(true)}>
              <Plus className="w-4 h-4 mr-2" /> Add Your First Subject
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
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

