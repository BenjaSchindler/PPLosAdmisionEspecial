const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    groupId: { type: String, required: true },
    userId: { type: String, required: true },
    sender: { type: String, required: true },
    text: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Chat', chatSchema);
