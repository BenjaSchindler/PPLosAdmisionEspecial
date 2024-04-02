const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  groupId: {
    type: String,
    required: true,
    unique: true,
  },
  groupName: {
    type: String,
    required: true,
  },
  members: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Group = mongoose.model('Group', groupSchema);

module.exports = Group;