import express from 'express';
import jwt from 'jsonwebtoken';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = express.Router();

// Auth middleware
function authMiddleware(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });
    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch {
        return res.status(401).json({ error: 'Invalid token' });
    }
}

// Gemini is initialized inside the route so it catches late-loaded ENV vars

const SYSTEM_PROMPT = `You are a full-powered AI assistant integrated into EduTracker, a student dashboard app. You are powered by Google Gemini and you should behave exactly like a real, unrestricted Gemini AI.

You can do EVERYTHING a general-purpose AI can do:
- Write essays, stories, poems, reports, and any creative content
- Explain any concept in science, math, history, literature, programming, etc.
- Write and debug code in any programming language
- Answer general knowledge questions on any topic
- Have casual, fun conversations
- Translate languages, summarize articles, brainstorm ideas
- Help with homework, assignments, and exam prep with detailed answers

BONUS CONTEXT: You also have access to the student's real academic data (subjects, attendance, tasks, exams) which is provided as context. When the student asks about their schedule, academics, or study planning, use this data to give personalized advice. But do NOT force academic data into every response — only mention it when it is relevant to what the student asked.

Your style:
- Be natural, friendly, and conversational
- Use emojis sparingly (1-2 per response max)
- Give thorough, detailed answers — never cut yourself short
- Use markdown formatting (bold, lists, headers) for readability

FORMATTING RULE: Do NOT use angle brackets (< or >) anywhere in your response. They break the UI renderer. Use ** for emphasis instead.

IMPORTANT: When referencing academic data, use specific subjects, dates, and numbers. Never fabricate academic data.`;

// POST /api/ai/chat
router.post('/chat', authMiddleware, async (req, res) => {
    try {
        const { message, academicContext } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ error: 'Gemini API key not configured' });
        }

        // Initialize here to guarantee process.env has fully loaded
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

        // Build context string from academic data
        let contextStr = '';
        if (academicContext) {
            const { subjects, attendance, tasks, exams, performanceIndex } = academicContext;

            if (subjects?.length > 0) {
                contextStr += `\n📚 SUBJECTS: ${subjects.map(s => s.name).join(', ')}`;
            }

            if (attendance?.length > 0) {
                contextStr += `\n📊 ATTENDANCE:\n`;
                attendance.forEach(a => {
                    contextStr += `  - ${a.subject}: ${a.percentage}% (${a.present}/${a.total} classes)\n`;
                });
            }

            if (tasks?.pending?.length > 0) {
                contextStr += `\n📝 PENDING TASKS (${tasks.pending.length}):\n`;
                tasks.pending.slice(0, 10).forEach(t => {
                    contextStr += `  - [${t.subject}] ${t.description} (due: ${t.targetDate})\n`;
                });
            }

            if (tasks?.overdue?.length > 0) {
                contextStr += `\n⚠️ OVERDUE TASKS (${tasks.overdue.length}):\n`;
                tasks.overdue.slice(0, 5).forEach(t => {
                    contextStr += `  - [${t.subject}] ${t.description} (was due: ${t.targetDate})\n`;
                });
            }

            if (tasks?.completed !== undefined) {
                contextStr += `\n✅ COMPLETED TASKS: ${tasks.completed}`;
            }

            if (exams?.length > 0) {
                contextStr += `\n🎯 UPCOMING EXAMS:\n`;
                exams.forEach(e => {
                    contextStr += `  - ${e.title} (${e.subject}) on ${e.date} — Prep: ${e.status}\n`;
                });
            }

            if (performanceIndex) {
                contextStr += `\n📈 PERFORMANCE INDEX: ${performanceIndex.overall}/100 (${performanceIndex.level})`;
            }
        }

        const chat = model.startChat({
            history: [],
            generationConfig: {
                maxOutputTokens: 2000,
                temperature: 0.7,
            },
        });

        const fullPrompt = `${SYSTEM_PROMPT}\n\n--- STUDENT ACADEMIC DATA ---${contextStr || '\nNo data available yet.'}\n--- END DATA ---\n\nStudent says: "${message}"`;

        const result = await chat.sendMessage(fullPrompt);
        const response = result.response.text();
        console.log('\n--- GEMINI OUTPUT DUMP ---');
        console.log(response);
        console.log('--- END DUMP ---\n');

        res.json({ reply: response });
    } catch (error) {
        console.error('Gemini AI Error:', error.message);
        res.status(500).json({ error: `AI Error: ${error.message}` });
    }
});

export default router;
