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

// Gemini initialization moved inside routes to allow process.env to load first

const SYLLABUS_PROMPT = `You are an academic syllabus parser. Analyze the provided syllabus text and extract structured data.

Return a valid JSON object with this exact structure:
{
  "subjects": [
    {
      "name": "Subject Name",
      "credits": 3,
      "units": [
        {
          "name": "Unit 1: Title",
          "topics": ["Topic 1", "Topic 2", "Topic 3"]
        }
      ]
    }
  ],
  "exams": [
    {
      "title": "Midterm Exam",
      "subject": "Subject Name",
      "date": "2025-03-15",
      "weight": "30%"
    }
  ]
}

IMPORTANT RULES:
- Return ONLY the JSON object, no markdown fences or extra text
- If you can't find specific data, use reasonable defaults
- Dates should be in YYYY-MM-DD format
- If no dates are visible, omit the exams array
- Extract as many topics as possible from each unit/chapter`;

// POST /api/syllabus-scanner/parse — Parse syllabus text with Gemini
router.post('/parse', authMiddleware, async (req, res) => {
    try {
        const { text } = req.body;

        if (!text || text.trim().length < 20) {
            return res.status(400).json({ error: 'Syllabus text must be at least 20 characters' });
        }

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ error: 'Gemini API key not configured' });
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        const result = await model.generateContent(`${SYLLABUS_PROMPT}\n\nSYLLABUS TEXT:\n${text}`);
        const responseText = result.response.text();

        // Clean up response — remove markdown code fences if present
        let cleaned = responseText.trim();
        if (cleaned.startsWith('```json')) cleaned = cleaned.slice(7);
        if (cleaned.startsWith('```')) cleaned = cleaned.slice(3);
        if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3);
        cleaned = cleaned.trim();

        const parsed = JSON.parse(cleaned);

        res.json({ data: parsed });
    } catch (error) {
        console.error('Syllabus Scanner Error:', error.message);
        if (error instanceof SyntaxError) {
            return res.status(500).json({ error: 'AI returned invalid format. Please try again.' });
        }
        res.status(500).json({ error: 'Failed to parse syllabus. Please try again.' });
    }
});

// POST /api/syllabus-scanner/parse-image — Parse syllabus image with Gemini Vision
router.post('/parse-image', authMiddleware, async (req, res) => {
    try {
        const { imageBase64, mimeType } = req.body;

        if (!imageBase64) {
            return res.status(400).json({ error: 'Image data is required' });
        }

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ error: 'Gemini API key not configured' });
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        const imagePart = {
            inlineData: {
                data: imageBase64,
                mimeType: mimeType || 'image/jpeg',
            },
        };

        const result = await model.generateContent([SYLLABUS_PROMPT, imagePart]);
        const responseText = result.response.text();

        let cleaned = responseText.trim();
        if (cleaned.startsWith('```json')) cleaned = cleaned.slice(7);
        if (cleaned.startsWith('```')) cleaned = cleaned.slice(3);
        if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3);
        cleaned = cleaned.trim();

        const parsed = JSON.parse(cleaned);

        res.json({ data: parsed });
    } catch (error) {
        console.error('Syllabus Image Scanner Error:', error.message);
        if (error instanceof SyntaxError) {
            return res.status(500).json({ error: 'AI returned invalid format. Please try again.' });
        }
        res.status(500).json({ error: 'Failed to parse syllabus image. Please try again.' });
    }
});

export default router;
