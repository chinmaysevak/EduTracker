import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    role: { type: String, enum: ['user', 'ai'], required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
}, { _id: false }); // Disable separate _ids for subdocuments to keep DB clean

const chatSessionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true // Index for fast lookup when user pulls their history
    },
    title: {
        type: String,
        default: 'New Conversation'
    },
    messages: [messageSchema],
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt timestamp automatically on saves
chatSessionSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});

export default mongoose.model('ChatSession', chatSessionSchema);
