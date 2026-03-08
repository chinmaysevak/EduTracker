import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useSubjects, useAttendance, useStudyTasks, useSyllabus } from '@/hooks/useData';
import { ArrowLeft, Printer, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Report() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { subjects } = useSubjects();
    const { calculateSubjectAttendance } = useAttendance();
    const { tasks } = useStudyTasks();
    const { getSubjectProgress } = useSyllabus();

    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <div className="min-h-screen bg-gray-50/50 text-black p-4 md:p-8 font-sans">
            {/* Controls - Hidden when printing */}
            <div className="print:hidden max-w-[800px] mx-auto mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white rounded-2xl shadow-sm border border-border/50">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-xl">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <h3 className="font-semibold">Semester Report</h3>
                        <p className="text-xs text-muted-foreground">Ready to export</p>
                    </div>
                </div>
                <Button onClick={() => window.print()} className="gap-2 btn-gradient shadow-lg w-full sm:w-auto h-11 rounded-xl">
                    <Printer className="w-4 h-4" /> Print or Save PDF
                </Button>
            </div>

            {/* A4 Document Container */}
            <div className="max-w-[800px] mx-auto bg-white print:p-0 p-8 sm:p-12 shadow-md print:shadow-none border print:border-none border-gray-200" style={{ minHeight: '297mm' }}>
                {/* Header */}
                <div className="flex items-end justify-between border-b-2 border-slate-800 pb-6 mb-8">
                    <div>
                        <div className="flex items-center gap-3 mb-2 text-violet-600">
                            <FileText className="w-8 h-8" />
                            <span className="text-xl font-bold tracking-widest uppercase">EduTrack</span>
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 mt-2">Semester Progress</h1>
                        <p className="text-slate-500 mt-2 font-medium">Generated on {today}</p>
                    </div>
                    <div className="text-right">
                        <h2 className="text-xl font-bold text-slate-800">{user?.name || 'Student Name'}</h2>
                        <p className="text-slate-500 font-medium">{user?.email || 'N/A'}</p>
                    </div>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-3 gap-4 mb-10">
                    <div className="p-5 border border-slate-200 rounded-xl bg-slate-50">
                        <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-1">Total Subjects</p>
                        <p className="text-3xl font-black text-slate-800">{subjects.length}</p>
                    </div>
                    <div className="p-5 border border-slate-200 rounded-xl bg-slate-50">
                        <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-1">Tasks Completed</p>
                        <p className="text-3xl font-black text-slate-800">{tasks.filter(t => t.status === 'completed').length}</p>
                    </div>
                    <div className="p-5 border border-slate-200 rounded-xl bg-slate-50">
                        <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-1">Pending Tasks</p>
                        <p className="text-3xl font-black text-slate-800">{tasks.filter(t => t.status !== 'completed').length}</p>
                    </div>
                </div>

                {/* Subject Breakdown */}
                <h3 className="text-xl font-black mb-4 text-slate-800 uppercase tracking-wider text-sm border-b border-slate-200 pb-2">Academic Performance Matrix</h3>
                <table className="w-full text-left border-collapse mb-10">
                    <thead>
                        <tr className="bg-slate-100 uppercase text-[10px] sm:text-xs tracking-wider text-slate-600">
                            <th className="p-3 sm:p-4 font-bold border-y border-slate-200">Subject</th>
                            <th className="p-3 sm:p-4 font-bold border-y border-slate-200">Attendance</th>
                            <th className="p-3 sm:p-4 font-bold border-y border-slate-200">Status</th>
                            <th className="p-3 sm:p-4 font-bold border-y border-slate-200">Syllabus Completion</th>
                        </tr>
                    </thead>
                    <tbody>
                        {subjects.map(subject => {
                            const att = calculateSubjectAttendance(subject.id);
                            const prog = getSubjectProgress(subject.id);
                            return (
                                <tr key={subject.id} className="border-b border-slate-100">
                                    <td className="p-3 sm:p-4 font-bold text-slate-800 flex items-center gap-3">
                                        <span className="w-3 h-3 rounded-full print:border print:border-black" style={{ backgroundColor: subject.color || '#ccc' }} />
                                        {subject.name}
                                    </td>
                                    <td className="p-3 sm:p-4">
                                        <span className={`font-black ${att.percentage >= 75 ? 'text-emerald-600' : 'text-rose-500'}`}>
                                            {att.percentage}%
                                        </span>
                                    </td>
                                    <td className="p-3 sm:p-4 text-sm font-medium text-slate-600">
                                        {att.present} / {att.total}
                                    </td>
                                    <td className="p-3 sm:p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-24 h-2.5 bg-slate-200 rounded-full overflow-hidden print:border print:border-slate-300">
                                                <div className="h-full bg-indigo-500 print:bg-slate-800" style={{ width: `${Math.max(prog.student, 3)}%` }} />
                                            </div>
                                            <span className="text-sm font-bold text-slate-700">{prog.student}%</span>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        {subjects.length === 0 && (
                            <tr>
                                <td colSpan={4} className="p-8 text-center text-slate-400 font-medium">No subjects enrolled.</td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {/* Footer */}
                <div className="mt-20 pt-8 border-t border-slate-200 text-center text-xs text-slate-400 font-medium tracking-wide">
                    <p>Generated securely by EduTrack AI Assistant.</p>
                    <p className="mt-1">This is an automated system document.</p>
                </div>
            </div>

            {/* Hide the PWA prompt context in print */}
            <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .max-w-\\[800px\\] *, .max-w-\\[800px\\] {
            visibility: visible;
          }
          .max-w-\\[800px\\] {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
        </div>
    );
}
