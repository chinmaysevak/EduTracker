// ============================================
// Custom Timetable Configuration
// ============================================

export interface TimetableSlot {
  subject: string;
  startTime: string;
  endTime: string;
}

export interface DaySchedule {
  day: string;
  slots: TimetableSlot[];
}

// Subject colors for consistent theming
export const subjectColors: Record<string, string> = {
  "Mathematical Aptitude": "#3b82f6",    // Blue
  "Lab On Advance Java": "#8b5cf6",       // Purple
  "Optimization Technique": "#10b981",    // Green
  "Cyber Security": "#ef4444",            // Red
  "HTML CSS": "#f59e0b",                  // Amber
  "Advance Java": "#06b6d4",              // Cyan
  "Computer Network": "#ec4899",          // Pink
  "Lab On HTML": "#84cc16"                // Lime
};

// Default time slots for classes
const defaultTimeSlots = [
  { start: "09:00", end: "10:00" },
  { start: "10:00", end: "11:00" },
  { start: "11:00", end: "12:00" },
  { start: "12:00", end: "13:00" },
  { start: "13:00", end: "14:00" },
  { start: "14:00", end: "15:00" },
  { start: "15:00", end: "16:00" },
  { start: "16:00", end: "17:00" }
];

// Default initial timetable
export const defaultTimetable: Record<string, string[]> = {
  "Monday": ["Mathematical Aptitude", "Lab On Advance Java"],
  "Tuesday": ["Optimization Technique", "Optimization Technique", "Optimization Technique", "Cyber Security", "HTML CSS"],
  "Wednesday": ["Advance Java", "Computer Network", "HTML CSS", "Lab On HTML"],
  "Thursday": ["Advance Java", "Computer Network", "HTML CSS"],
  "Friday": ["Advance Java", "Computer Network", "Mathematical Aptitude", "Mathematical Aptitude"],
  "Saturday": [],
  "Sunday": []
};

// Default initial custom times
export const defaultCustomTimes: Record<string, { startTime: string; endTime: string }[]> = {
  "Monday": [],
  "Tuesday": [],
  "Wednesday": [],
  "Thursday": [],
  "Friday": [],
  "Saturday": [],
  "Sunday": []
};

// Get subject color
export function getSubjectColor(subjectName: string): string {
  return subjectColors[subjectName] || "#6b7280";
}

// Generate timetable with times (for backward compatibility)
export function generateTimetableWithTimes(timetableData?: Record<string, string[]>, customTimes?: Record<string, { startTime: string; endTime: string }[]>): DaySchedule[] {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const data = timetableData || defaultTimetable;
  const times = customTimes || defaultCustomTimes;
  
  return days.map(day => {
    const subjects = data[day] || [];
    const dayTimes = times[day] || [];
    
    const slots: TimetableSlot[] = subjects.map((subject, index) => ({
      subject,
      startTime: dayTimes[index]?.startTime || defaultTimeSlots[index]?.start || "09:00",
      endTime: dayTimes[index]?.endTime || defaultTimeSlots[index]?.end || "10:00"
    }));
    
    return { day, slots };
  });
}

// Extract unique subjects from timetable
export function extractSubjects(timetableData: Record<string, string[]>): string[] {
  return Array.from(new Set(Object.values(timetableData).flat())).sort();
}
