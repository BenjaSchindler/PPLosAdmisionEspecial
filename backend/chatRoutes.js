const express = require('express');
const Chat = require('./chatModel');
const { authenticateToken } = require('./authMiddleware'); // Ensure this is correctly imported
const router = express.Router();

// Fetch chat history by user ID and file ID
router.get('/file/:fileId/user/:userId', authenticateToken, async (req, res) => {
    const { fileId, userId } = req.params;

    console.log(`Received userId: ${userId}`);
    console.log(`Received fileId: ${fileId}`);
    console.log(`Authenticated user: ${req.user}`);

    try {
        const chats = await Chat.find({ fileId: fileId, userId: userId }).sort({ timestamp: 1 });

        console.log('Fetched chats:', chats);
        res.status(200).json(chats);
    } catch (error) {
        console.error('Error fetching chat history:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;

