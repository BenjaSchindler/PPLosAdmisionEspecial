const mongoose = require('mongoose');
const User = require('./app').User;
const Group = require('./groupModel');

const fileSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true,
  },
  path: {
    type: String,
    required: true,
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
  },
});

const File = mongoose.model('File', fileSchema);

module.exports = File;