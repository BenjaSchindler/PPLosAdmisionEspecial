const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  groupName: { type: String, required: true },
  administrators: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }]
});

module.exports = mongoose.model('Group', groupSchema);