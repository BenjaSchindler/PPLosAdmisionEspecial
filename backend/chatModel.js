const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    fileId: { type: mongoose.Schema.Types.ObjectId, ref: 'File', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    sender: { type: String, required: true },
    text: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Chat', chatSchema);
