const express = require('express');
const router = express.Router();
const Group = require('./groupModel');
const { User } = require('./app');

// Create a new group
router.post('/', async (req, res) => {
  try {
    const { groupName, userId } = req.body;

    const group = new Group({
      groupName,
      members: [userId],
    });

    const savedGroup = await group.save();
    res.status(201).json(savedGroup);
  } catch (error) {
    console.error('Error creating group:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get groups for a specific user
router.get('/', async (req, res) => {
  try {
    const userId = req.query.userId;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const groups = await Group.find({ members: userId }).populate('members', 'username email');
    res.json(groups);
  } catch (error) {
    console.error('Error retrieving groups:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get a specific group by ID
router.get('/:groupId', async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId).populate('members', 'username email');
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }
    res.json(group);
  } catch (error) {
    console.error('Error retrieving group:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add a member to a group
router.post('/:groupId/members', async (req, res) => {
  try {
    const { userId } = req.body;

    const group = await Group.findById(req.params.groupId);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (group.members.includes(userId)) {
      return res.status(400).json({ error: 'User is already a member of the group' });
    }

    group.members.push(userId);
    await group.save();

    res.json(group);
  } catch (error) {
    console.error('Error adding member to group:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Remove a member from a group
router.delete('/:groupId/members/:userId', async (req, res) => {
  try {
    const { groupId, userId } = req.params;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    const memberIndex = group.members.indexOf(userId);
    if (memberIndex === -1) {
      return res.status(400).json({ error: 'User is not a member of the group' });
    }

    group.members.splice(memberIndex, 1);
    await group.save();

    res.json(group);
  } catch (error) {
    console.error('Error removing member from group:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;