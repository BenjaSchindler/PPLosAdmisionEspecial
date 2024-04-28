// Import the Mongoose library for MongoDB
const mongoose = require('mongoose');
const User = require('./app').User;
const Group = require('./groupModel');

// Define the schema for the File model
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

// Create the File model based on the schema
const File = mongoose.model('File', fileSchema);

// Export the File model for use in other modules
module.exports = File;