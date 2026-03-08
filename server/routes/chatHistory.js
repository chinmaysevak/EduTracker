import express from 'express';
import ChatSession from '../models/ChatSession.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// GET /api/chat-history - List all sessions for the user (metadata only, no full messages to save bandwidth)
router.get('/', auth, async (req, res) => {
    try {
        const sessions = await ChatSession.find({ userId: req.userId })
            .select('_id title updatedAt')
            .sort({ updatedAt: -1 });
        res.json(sessions);
    } catch (error) {
        console.error("Error fetching chat histories:", error);
        res.status(500).json({ error: 'Server error fetching chats' });
    }
});

// GET /api/chat-history/:id - Load full messages for a specific session
router.get('/:id', auth, async (req, res) => {
    try {
        const session = await ChatSession.findOne({
            _id: req.params.id,
            userId: req.userId
        });

        if (!session) {
            return res.status(404).json({ error: 'Chat session not found' });
        }

        res.json(session);
    } catch (error) {
        console.error("Error fetching specific chat:", error);
        res.status(500).json({ error: 'Server error loading chat' });
    }
});

// POST /api/chat-history - Create an empty new chat session
router.post('/', auth, async (req, res) => {
    try {
        const session = new ChatSession({
            userId: req.userId,
            title: 'New Conversation',
            messages: []
        });
        await session.save();
        res.status(201).json(session);
    } catch (error) {
        console.error("Error creating chat session:", error);
        res.status(500).json({ error: 'Server error creating chat session' });
    }
});

// PUT /api/chat-history/:id - Add a message to an existing session
router.put('/:id', auth, async (req, res) => {
    try {
        const { message } = req.body;

        if (!message || !message.role || !message.content) {
            return res.status(400).json({ error: 'Invalid message payload' });
        }

        const session = await ChatSession.findOne({
            _id: req.params.id,
            userId: req.userId
        });

        if (!session) {
            return res.status(404).json({ error: 'Chat session not found' });
        }

        // Auto-generate a title if this is the very first user message in the session
        if (session.messages.length === 0 && message.role === 'user') {
            session.title = message.content.slice(0, 30) + (message.content.length > 30 ? '...' : '');
        }

        session.messages.push(message);

        // The pre-save hook on the schema will automatically update `updatedAt`
        await session.save();

        res.json(session);
    } catch (error) {
        console.error("Error updating chat session:", error);
        res.status(500).json({ error: 'Server error appending message' });
    }
});

// DELETE /api/chat-history/:id - Delete a chat session
router.delete('/:id', auth, async (req, res) => {
    try {
        const result = await ChatSession.findOneAndDelete({
            _id: req.params.id,
            userId: req.userId
        });

        if (!result) {
            return res.status(404).json({ error: 'Chat session not found' });
        }

        res.json({ message: 'Session deleted successfully' });
    } catch (error) {
        console.error("Error deleting chat session:", error);
        res.status(500).json({ error: 'Server error deleting chat' });
    }
});

export default router;
