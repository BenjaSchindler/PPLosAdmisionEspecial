const mongoose = require('mongoose');

// Define the schema for the Group model
const groupSchema = new mongoose.Schema({
  groupId: {
    type: String,
    unique: true,
    default: () => new mongoose.Types.ObjectId().toString(),
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
  admins: [
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

// Create the Group model based on the schema
const Group = mongoose.model('Group', groupSchema);

// Export the Group model for use in other modules
module.exports = Group;