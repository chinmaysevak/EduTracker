// ============================================
// EduTracker Mock Data Seeder
// Creates a fully populated demo account
// ============================================
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env') });

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import Subject from './models/Subject.js';
import Attendance from './models/Attendance.js';
import StudyTask from './models/StudyTask.js';
import Exam from './models/Exam.js';
import UserProfile from './models/UserProfile.js';
import Timetable from './models/Timetable.js';
import Resource from './models/Resource.js';
import SyllabusUnit from './models/SyllabusUnit.js';
import SyllabusTopic from './models/SyllabusTopic.js';
import StudySession from './models/StudySession.js';
import FocusSession from './models/FocusSession.js';

const MOCK_EMAIL = 'student@edutracker.com';
const MOCK_PASSWORD = 'Student@123';
const MOCK_NAME = 'Alex Johnson';

async function seed() {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // 1. Clean up old mock user if exists
    const existing = await User.findOne({ email: MOCK_EMAIL });
    if (existing) {
        const uid = existing._id;
        await Promise.all([
            Subject.deleteMany({ userId: uid }),
            Attendance.deleteMany({ userId: uid }),
            StudyTask.deleteMany({ userId: uid }),
            Exam.deleteMany({ userId: uid }),
            UserProfile.deleteMany({ userId: uid }),
            Timetable.deleteMany({ userId: uid }),
            Resource.deleteMany({ userId: uid }),
            SyllabusUnit.deleteMany({ userId: uid }),
            SyllabusTopic.deleteMany({ userId: uid }),
            StudySession.deleteMany({ userId: uid }),
            FocusSession.deleteMany({ userId: uid }),
        ]);
        await User.deleteOne({ _id: uid });
        console.log('Cleaned up previous mock data');
    }

    // 2. Create user
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(MOCK_PASSWORD, salt);
    const user = await User.create({
        name: MOCK_NAME,
        email: MOCK_EMAIL,
        passwordHash,
        theme: 'dark'
    });
    const userId = user._id;
    console.log('Created user:', MOCK_EMAIL);

    // 3. Create subjects
    const subjectData = [
        { name: 'Data Structures & Algorithms', color: '#6366f1', difficulty: 4, totalTopics: 14, examDate: '2026-04-15' },
        { name: 'Operating Systems', color: '#f43f5e', difficulty: 3, totalTopics: 12, examDate: '2026-04-18' },
        { name: 'Database Management', color: '#10b981', difficulty: 3, totalTopics: 10, examDate: '2026-04-20' },
        { name: 'Computer Networks', color: '#f59e0b', difficulty: 4, totalTopics: 11, examDate: '2026-04-22' },
        { name: 'Software Engineering', color: '#06b6d4', difficulty: 2, totalTopics: 8, examDate: '2026-04-25' },
        { name: 'Discrete Mathematics', color: '#8b5cf6', difficulty: 5, totalTopics: 10, examDate: '2026-04-28' },
    ];

    const subjects = await Subject.insertMany(
        subjectData.map(s => ({ ...s, userId, clientId: crypto.randomUUID() }))
    );
    console.log('Created', subjects.length, 'subjects');

    // 4. Create attendance records (last 30 days)
    const attendanceDocs = [];
    const today = new Date();
    for (let i = 30; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const dayOfWeek = d.getDay();
        if (dayOfWeek === 0) continue; // Skip Sunday

        const subjectsForDay = {};
        const daySubjects = subjects.slice(0, dayOfWeek === 6 ? 2 : 4);
        daySubjects.forEach(s => {
            const rand = Math.random();
            subjectsForDay[s._id.toString()] = rand < 0.78 ? 'present' : rand < 0.90 ? 'absent' : 'cancelled';
        });

        attendanceDocs.push({
            userId,
            date: d.toISOString().split('T')[0],
            subjects: subjectsForDay
        });
    }
    await Attendance.insertMany(attendanceDocs);
    console.log('Created', attendanceDocs.length, 'attendance records');

    // 5. Create study tasks
    const taskData = [
        { description: 'Complete Binary Tree assignment', subjectId: subjects[0]._id.toString(), targetDate: '2026-03-10', priority: 'high', type: 'assignment', status: 'pending', estimatedMinutes: 120 },
        { description: 'Read Chapter 5 - Process Scheduling', subjectId: subjects[1]._id.toString(), targetDate: '2026-03-09', priority: 'medium', type: 'study', status: 'completed', completedAt: '2026-03-08T14:30:00Z', estimatedMinutes: 90 },
        { description: 'SQL Joins practice problems', subjectId: subjects[2]._id.toString(), targetDate: '2026-03-11', priority: 'medium', type: 'study', status: 'pending', estimatedMinutes: 60 },
        { description: 'Network layer protocol lab report', subjectId: subjects[3]._id.toString(), targetDate: '2026-03-07', priority: 'high', type: 'assignment', status: 'pending', estimatedMinutes: 150 },
        { description: 'UML Diagrams for Library System', subjectId: subjects[4]._id.toString(), targetDate: '2026-03-12', priority: 'low', type: 'project', status: 'pending', estimatedMinutes: 180 },
        { description: 'Graph theory problem set', subjectId: subjects[5]._id.toString(), targetDate: '2026-03-08', priority: 'high', type: 'study', status: 'completed', completedAt: '2026-03-07T18:00:00Z', estimatedMinutes: 75 },
        { description: 'Implement Dijkstra Algorithm', subjectId: subjects[0]._id.toString(), targetDate: '2026-03-14', priority: 'high', type: 'assignment', status: 'pending', estimatedMinutes: 200 },
        { description: 'Revise Normalization (1NF-BCNF)', subjectId: subjects[2]._id.toString(), targetDate: '2026-03-13', priority: 'medium', type: 'exam', status: 'pending', estimatedMinutes: 90 },
        { description: 'OS Lab Viva preparation', subjectId: subjects[1]._id.toString(), targetDate: '2026-03-15', priority: 'high', type: 'exam', status: 'pending', estimatedMinutes: 120 },
        { description: 'Read TCP/IP Chapter', subjectId: subjects[3]._id.toString(), targetDate: '2026-03-16', priority: 'low', type: 'study', status: 'pending', estimatedMinutes: 45 },
    ];
    await StudyTask.insertMany(taskData.map(t => ({ ...t, userId })));
    console.log('Created', taskData.length, 'study tasks');

    // 6. Create exams
    const examData = [
        { title: 'DSA Mid-Semester', subjectId: subjects[0]._id.toString(), examDate: '2026-04-15', syllabus: 'Arrays, Linked Lists, Trees, Graphs, Sorting', preparationStatus: 'in_progress' },
        { title: 'OS Internal Assessment', subjectId: subjects[1]._id.toString(), examDate: '2026-04-18', syllabus: 'Process Management, Deadlocks, Memory Management', preparationStatus: 'not_started' },
        { title: 'DBMS Practical Exam', subjectId: subjects[2]._id.toString(), examDate: '2026-04-20', syllabus: 'SQL, Normalization, ER Diagrams, Transactions', preparationStatus: 'in_progress' },
        { title: 'CN End-Semester', subjectId: subjects[3]._id.toString(), examDate: '2026-04-22', syllabus: 'OSI Model, TCP/IP, Routing, Network Security', preparationStatus: 'not_started' },
        { title: 'SE Project Presentation', subjectId: subjects[4]._id.toString(), examDate: '2026-04-25', syllabus: 'SDLC, Agile, UML, Testing, Project Demo', preparationStatus: 'in_progress' },
    ];
    await Exam.insertMany(examData.map(e => ({ ...e, userId })));
    console.log('Created', examData.length, 'exams');

    // 7. Create timetable
    const timetable = {
        userId,
        timetableData: {
            Monday: [subjects[0].name, subjects[1].name, subjects[2].name, subjects[5].name],
            Tuesday: [subjects[3].name, subjects[4].name, subjects[0].name, subjects[1].name],
            Wednesday: [subjects[2].name, subjects[5].name, subjects[3].name, subjects[4].name],
            Thursday: [subjects[0].name, subjects[1].name, subjects[5].name, subjects[2].name],
            Friday: [subjects[3].name, subjects[4].name, subjects[0].name, subjects[2].name],
            Saturday: [subjects[1].name, subjects[5].name],
        },
        customTimes: {
            Monday: [{ startTime: '09:00', endTime: '10:00' }, { startTime: '10:15', endTime: '11:15' }, { startTime: '11:30', endTime: '12:30' }, { startTime: '14:00', endTime: '15:00' }],
            Tuesday: [{ startTime: '09:00', endTime: '10:00' }, { startTime: '10:15', endTime: '11:15' }, { startTime: '11:30', endTime: '12:30' }, { startTime: '14:00', endTime: '15:00' }],
            Wednesday: [{ startTime: '09:00', endTime: '10:00' }, { startTime: '10:15', endTime: '11:15' }, { startTime: '11:30', endTime: '12:30' }, { startTime: '14:00', endTime: '15:00' }],
            Thursday: [{ startTime: '09:00', endTime: '10:00' }, { startTime: '10:15', endTime: '11:15' }, { startTime: '11:30', endTime: '12:30' }, { startTime: '14:00', endTime: '15:00' }],
            Friday: [{ startTime: '09:00', endTime: '10:00' }, { startTime: '10:15', endTime: '11:15' }, { startTime: '11:30', endTime: '12:30' }, { startTime: '14:00', endTime: '15:00' }],
            Saturday: [{ startTime: '09:00', endTime: '10:00' }, { startTime: '10:15', endTime: '11:15' }],
        }
    };
    await Timetable.create(timetable);
    console.log('Created timetable');

    // 8. Create resources
    const resourceData = [
        { type: 'link', title: 'GeeksForGeeks - DSA', subjectId: subjects[0]._id.toString(), url: 'https://www.geeksforgeeks.org/data-structures/', tags: ['reference', 'practice'] },
        { type: 'youtube', title: 'Abdul Bari - OS Playlist', subjectId: subjects[1]._id.toString(), youtubeUrl: 'https://www.youtube.com/playlist?list=PLBF3763AF2E1C572F', tags: ['video', 'lecture'] },
        { type: 'note', title: 'SQL Quick Reference Notes', subjectId: subjects[2]._id.toString(), content: '## SQL Quick Reference\n\n### SELECT\n```sql\nSELECT col1, col2 FROM table WHERE condition;\n```\n\n### JOINS\n- INNER JOIN: Returns matching rows\n- LEFT JOIN: All from left + matching\n- RIGHT JOIN: All from right + matching\n- FULL JOIN: All rows from both', tags: ['notes', 'quick-ref'], isFavorite: true },
        { type: 'link', title: 'Cisco Networking Academy', subjectId: subjects[3]._id.toString(), url: 'https://www.netacad.com/', tags: ['certification', 'study'] },
        { type: 'note', title: 'SDLC Models Comparison', subjectId: subjects[4]._id.toString(), content: '## SDLC Models\n\n| Model | Best For | Key Feature |\n|-------|----------|-------------|\n| Waterfall | Small projects | Sequential |\n| Agile | Dynamic requirements | Iterative |\n| Spiral | Risk-heavy projects | Risk analysis |\n| V-Model | Critical systems | Verification |', tags: ['notes', 'comparison'] },
        { type: 'link', title: 'Discrete Math - MIT OCW', subjectId: subjects[5]._id.toString(), url: 'https://ocw.mit.edu/courses/6-042j-mathematics-for-computer-science-fall-2010/', tags: ['course', 'reference'], isFavorite: true },
    ];
    await Resource.insertMany(resourceData.map(r => ({ ...r, userId })));
    console.log('Created', resourceData.length, 'resources');

    // 9. Create user profile with XP + badges
    await UserProfile.create({
        userId,
        name: MOCK_NAME,
        xp: 1250,
        level: 5,
        currentStreak: 7,
        longestStreak: 14,
        lastStudyDate: new Date().toISOString().split('T')[0],
        badges: [
            { id: 'first_task', name: 'First Task', description: 'Completed your first task', icon: '🎯', unlockedAt: '2026-02-15T10:00:00Z' },
            { id: 'streak_7', name: 'Week Warrior', description: '7 day study streak', icon: '🔥', unlockedAt: '2026-03-05T10:00:00Z' },
            { id: 'xp_1000', name: 'XP Milestone', description: 'Earned 1000 XP', icon: '⭐', unlockedAt: '2026-03-06T10:00:00Z' },
        ]
    });
    console.log('Created user profile with XP and badges');

    // 10. Create Syllabus Units & Topics (Progress Tracker)
    const syllabusData = {
        [subjects[0]._id.toString()]: [
            { name: 'Unit 1: Arrays & Strings', topics: ['1D Arrays', '2D Arrays', 'String Manipulation', 'Two Pointer Technique'] },
            { name: 'Unit 2: Linked Lists', topics: ['Singly Linked List', 'Doubly Linked List', 'Circular LL', 'Reversal Algorithms'] },
            { name: 'Unit 3: Trees', topics: ['Binary Trees', 'BST Operations', 'AVL Trees', 'Tree Traversals'] },
            { name: 'Unit 4: Graphs', topics: ['Graph Representations', 'BFS & DFS', 'Shortest Path Algorithms'] },
            { name: 'Unit 5: Sorting & Searching', topics: ['Quick Sort', 'Merge Sort', 'Binary Search', 'Hashing'] },
        ],
        [subjects[1]._id.toString()]: [
            { name: 'Unit 1: Process Management', topics: ['Process Lifecycle', 'Scheduling Algorithms', 'Inter-Process Communication'] },
            { name: 'Unit 2: Threads & Concurrency', topics: ['Multithreading Models', 'Synchronization', 'Deadlocks'] },
            { name: 'Unit 3: Memory Management', topics: ['Paging', 'Segmentation', 'Virtual Memory', 'Page Replacement'] },
            { name: 'Unit 4: File Systems', topics: ['File Organization', 'Directory Structure', 'Disk Scheduling'] },
        ],
        [subjects[2]._id.toString()]: [
            { name: 'Unit 1: ER Modeling', topics: ['Entity-Relationship Diagrams', 'Cardinality & Participation', 'Generalization'] },
            { name: 'Unit 2: Relational Model', topics: ['Keys & Constraints', 'Relational Algebra', 'Tuple Calculus'] },
            { name: 'Unit 3: SQL', topics: ['DDL Commands', 'DML & Joins', 'Subqueries & Views', 'Stored Procedures'] },
            { name: 'Unit 4: Normalization', topics: ['Functional Dependencies', '1NF to BCNF', 'Lossless Decomposition'] },
            { name: 'Unit 5: Transactions', topics: ['ACID Properties', 'Concurrency Control', 'Recovery Techniques'] },
        ],
        [subjects[3]._id.toString()]: [
            { name: 'Unit 1: Network Fundamentals', topics: ['OSI Model', 'TCP/IP Stack', 'Network Topologies'] },
            { name: 'Unit 2: Data Link Layer', topics: ['Error Detection', 'Flow Control', 'MAC Protocols'] },
            { name: 'Unit 3: Network Layer', topics: ['IP Addressing', 'Subnetting', 'Routing Protocols'] },
            { name: 'Unit 4: Transport & Application', topics: ['TCP vs UDP', 'DNS & HTTP', 'Socket Programming'] },
        ],
        [subjects[4]._id.toString()]: [
            { name: 'Unit 1: SDLC Models', topics: ['Waterfall', 'Agile & Scrum', 'Spiral Model'] },
            { name: 'Unit 2: Requirements Engineering', topics: ['Elicitation Techniques', 'SRS Document', 'Use Cases'] },
            { name: 'Unit 3: Design & UML', topics: ['Class Diagrams', 'Sequence Diagrams', 'Design Patterns'] },
            { name: 'Unit 4: Testing', topics: ['Unit Testing', 'Integration Testing', 'Black Box vs White Box'] },
        ],
        [subjects[5]._id.toString()]: [
            { name: 'Unit 1: Logic & Proofs', topics: ['Propositional Logic', 'Predicate Logic', 'Proof Techniques'] },
            { name: 'Unit 2: Sets & Relations', topics: ['Set Operations', 'Equivalence Relations', 'Partial Orders'] },
            { name: 'Unit 3: Combinatorics', topics: ['Permutations', 'Combinations', 'Pigeonhole Principle'] },
            { name: 'Unit 4: Graph Theory', topics: ['Eulerian & Hamiltonian Paths', 'Graph Coloring', 'Planar Graphs'] },
        ],
    };

    let totalUnits = 0;
    let totalTopics = 0;

    for (const [subjectId, units] of Object.entries(syllabusData)) {
        for (let i = 0; i < units.length; i++) {
            const unitEntry = units[i];
            // Mark ~60% of units as teacher-completed, ~40% as student-completed
            const teacherDone = i < Math.ceil(units.length * 0.6);
            const studentDone = i < Math.ceil(units.length * 0.4);

            const unit = await SyllabusUnit.create({
                userId,
                subjectId,
                name: unitEntry.name,
                teacherCompleted: teacherDone,
                studentCompleted: studentDone,
                order: i
            });
            totalUnits++;

            // Create topics for this unit
            for (let j = 0; j < unitEntry.topics.length; j++) {
                const topicTeacherDone = teacherDone && j < Math.ceil(unitEntry.topics.length * 0.7);
                const topicStudentDone = studentDone && j < Math.ceil(unitEntry.topics.length * 0.5);

                await SyllabusTopic.create({
                    userId,
                    unitId: unit._id.toString(),
                    name: unitEntry.topics[j],
                    teacherCompleted: topicTeacherDone,
                    studentCompleted: topicStudentDone,
                    order: j
                });
                totalTopics++;
            }
        }
    }
    console.log('Created', totalUnits, 'syllabus units and', totalTopics, 'topics');

    // 11. Create Study Sessions (recent history)
    const studySessionData = [
        { subjectId: subjects[0]._id.toString(), title: 'Binary Trees Practice', sessionDate: '2026-03-06', startTime: '14:00', endTime: '15:30', completed: true, notes: 'Practiced traversals and insertions' },
        { subjectId: subjects[1]._id.toString(), title: 'OS Chapter 5 Reading', sessionDate: '2026-03-07', startTime: '10:00', endTime: '11:30', completed: true, notes: 'Covered process scheduling algorithms' },
        { subjectId: subjects[2]._id.toString(), title: 'SQL Joins Workshop', sessionDate: '2026-03-07', startTime: '16:00', endTime: '17:00', completed: true, notes: 'Inner, Left, Right joins practice' },
        { subjectId: subjects[5]._id.toString(), title: 'Graph Theory Problems', sessionDate: '2026-03-08', startTime: '09:00', endTime: '10:30', completed: true, notes: 'Solved 8 problems on Euler paths' },
        { subjectId: subjects[0]._id.toString(), title: 'DSA Revision - Sorting', sessionDate: '2026-03-08', startTime: '14:00', endTime: '15:00', completed: true, notes: 'Quick sort and merge sort comparison' },
        { subjectId: subjects[3]._id.toString(), title: 'Network Protocols Reading', sessionDate: '2026-03-08', startTime: '19:00', endTime: '20:00', completed: false, notes: 'TCP handshake and flow control' },
    ];
    await StudySession.insertMany(studySessionData.map(s => ({ ...s, userId })));
    console.log('Created', studySessionData.length, 'study sessions');

    // 12. Create Focus Sessions (timer-based study logs)
    const focusData = [];
    for (let i = 7; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        // 1-3 focus sessions per day
        const sessionsPerDay = 1 + Math.floor(Math.random() * 3);
        for (let j = 0; j < sessionsPerDay; j++) {
            const subj = subjects[Math.floor(Math.random() * subjects.length)];
            const duration = 25 + Math.floor(Math.random() * 4) * 25; // 25, 50, 75, or 100 mins
            const startHour = 9 + j * 3;
            focusData.push({
                userId,
                subjectId: subj._id.toString(),
                startTime: `${String(startHour).padStart(2, '0')}:00`,
                endTime: `${String(startHour + Math.floor(duration / 60)).padStart(2, '0')}:${String(duration % 60).padStart(2, '0')}`,
                durationMinutes: duration,
                date: dateStr
            });
        }
    }
    await FocusSession.insertMany(focusData);
    console.log('Created', focusData.length, 'focus sessions');

    console.log('\n========================================');
    console.log('MOCK DATA SEEDED SUCCESSFULLY!');
    console.log('========================================');
    console.log('Email:    ' + MOCK_EMAIL);
    console.log('Password: ' + MOCK_PASSWORD);
    console.log('========================================\n');

    await mongoose.disconnect();
    process.exit(0);
}

seed().catch(err => {
    console.error('Seed failed:', err);
    process.exit(1);
});
