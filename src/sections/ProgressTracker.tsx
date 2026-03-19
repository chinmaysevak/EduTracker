import { useState } from 'react';
import { Plus, Upload, Sparkles } from 'lucide-react';
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
  const [showImport, setShowImport] = useState(false);

  const handleSyllabusImport = (data: { subjects: { name: string; units: { name: string; topics: string[] }[] }[] }) => {
    try {
      data.subjects.forEach(s => {
        const existing = subjects.subjects.find(sub => sub.name.toLowerCase() === s.name.toLowerCase());
        if (!existing) {
          subjects.addSubject(s.name);
        }
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
      {/* ── Premium Hero Header ── */}
      <div className="section-hero mesh-gradient mb-5">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="text-xs font-semibold text-primary uppercase tracking-widest">Track & Conquer</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight font-display gradient-text-vibrant">Progress Tracker</h1>
            <p className="text-muted-foreground mt-1 text-sm">Master your syllabus — every topic checked is a step closer to success! 🎯</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-2 rounded-xl hover:shadow-lg transition-all" onClick={() => setShowImport(!showImport)}>
              <Upload className="w-4 h-4" /> Import
            </Button>
            <Button onClick={() => setIsAddSubjectOpen(true)} className="gap-2 rounded-xl btn-gradient btn-glow">
              <Plus className="w-4 h-4" /> Add Subject
            </Button>
          </div>
        </div>
      </div>

      {/* ── Summary (moved above subjects) ── */}
      <ProgressSummary />

      {/* ── Import Section (collapsible) ── */}
      {showImport && (
        <div className="mb-6 animate-in slide-in-from-top-2 duration-300">
          <SyllabusScanner onImport={handleSyllabusImport} />
        </div>
      )}

      {/* ── Subjects Grid ── */}
      <div className="flex-1 space-y-4">
        <h2 className="text-lg font-bold tracking-tight flex items-center gap-2">
          <span className="w-1.5 h-6 rounded-full bg-gradient-to-b from-primary to-violet-500" />
          Subjects Overview
        </h2>

        {subjects.subjects.length === 0 ? (
          <div className="text-center p-10 bg-card border border-border/50 rounded-2xl card-shine">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/15 to-violet-500/15 flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No subjects added</h3>
            <p className="text-muted-foreground mb-6 text-sm max-w-sm mx-auto">Start by adding your subjects to track your syllabus progress.</p>
            <Button onClick={() => setIsAddSubjectOpen(true)} className="rounded-xl gap-2 btn-gradient btn-glow">
              <Plus className="w-4 h-4" /> Add Your First Subject
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
