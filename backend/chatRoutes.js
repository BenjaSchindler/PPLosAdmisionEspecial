const express = require('express');
const Chat = require('./chatModel');
const router = express.Router();

// Save a new chat message
router.post('/', async (req, res) => {
    const { fileId, userId, sender, text } = req.body;

    try {
        const newChat = new Chat({ fileId, userId, sender, text });
        await newChat.save();
        res.status(201).json(newChat);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Fetch chat history by user ID and file ID
router.get('/file/:fileId/user/:userId', async (req, res) => {
    const { fileId, userId } = req.params;

    try {
        const chats = await Chat.find({ fileId, userId }).sort({ timestamp: 1 });
        res.status(200).json(chats);
    } catch (error) {
        console.error('Error fetching chat history:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;

