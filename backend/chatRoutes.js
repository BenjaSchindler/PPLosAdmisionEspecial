// chatRoutes.js
const express = require('express');
const Chat = require('./chatModel');
const router = express.Router();

// Save a new chat message
router.post('/', async (req, res) => {
    const { groupId, userId, sender, text } = req.body;

    try {
        const newChat = new Chat({ groupId, userId, sender, text });
        await newChat.save();
        res.status(201).json(newChat);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// Fetch chat history by user ID
router.get('/user/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const chats = await Chat.find({ userId }).sort({ timestamp: 1 });
    res.status(200).json(chats);
  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Fetch chat history by group ID
router.get('/:groupId', async (req, res) => {
  const { groupId } = req.params;

  try {
    const chats = await Chat.find({ groupId }).sort({ timestamp: 1 });
    res.status(200).json(chats);
  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

