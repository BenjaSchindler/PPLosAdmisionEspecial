const express = require('express');
const router = express.Router();
const Group = require('./groupModel');
const User = require('./userModel'); // Ensure this import statement is correct
const { authenticateToken } = require('./authMiddleware');

// Create a new group
router.post('/', authenticateToken, async (req, res) => {
  const { groupName, userId } = req.body;

  try {
    const newGroup = new Group({ groupName, administrators: [userId], members: [userId] });
    await newGroup.save();
    res.status(201).json(newGroup);
  } catch (error) {
    console.error('Error creating group:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Fetch groups by user ID
router.get('/', authenticateToken, async (req, res) => {
  const { userId } = req.query;

  try {
    const groups = await Group.find({ members: userId })
      .populate('members', 'username email')
      .populate('administrators', 'username email');
    res.status(200).json(groups);
  } catch (error) {
    console.error('Error fetching groups:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get a specific group by ID
router.get('/:groupId', authenticateToken, async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId)
      .populate('members', 'username email')
      .populate('administrators', 'username email');
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }
    res.json(group);
  } catch (error) {
    console.error('Error retrieving group:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Fetch groups by user ID
router.get('/', authenticateToken, async (req, res) => {
  const { userId } = req.query;

  try {
    const groups = await Group.find({ members: userId })
      .populate('members', 'username email')
      .populate('administrators', 'username email');
    res.status(200).json(groups);
  } catch (error) {
    console.error('Error fetching groups:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});



// Add a member to a group
router.post('/:groupId/members', authenticateToken, async (req, res) => {
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
router.delete('/:groupId/members/:userId', authenticateToken, async (req, res) => {
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

// Add an administrator to a group
router.post('/:groupId/administrators', authenticateToken, async (req, res) => {
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

    if (group.administrators.includes(userId)) {
      return res.status(400).json({ error: 'User is already an administrator of the group' });
    }

    group.administrators.push(userId);
    if (!group.members.includes(userId)) {
      group.members.push(userId);
    }
    await group.save();

    res.json(group);
  } catch (error) {
    console.error('Error adding administrator to group:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Remove an administrator from a group
router.delete('/:groupId/administrators/:userId', authenticateToken, async (req, res) => {
  try {
    const { groupId, userId } = req.params;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    const adminIndex = group.administrators.indexOf(userId);
    if (adminIndex === -1) {
      return res.status(400).json({ error: 'User is not an administrator of the group' });
    }

    group.administrators.splice(adminIndex, 1);
    await group.save();

    res.json(group);
  } catch (error) {
    console.error('Error removing administrator from group:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
