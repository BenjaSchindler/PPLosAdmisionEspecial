const express = require('express');
const router = express.Router();
const Group = require('./groupModel');
const User = require('./userModel');
const Invitation = require('./invitationModel');
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

// Add a member to a group via invitation
router.post('/:groupId/members', authenticateToken, async (req, res) => {
  try {
    const { email } = req.body;
    const invitedBy = req.user.userId;
    const groupId = req.params.groupId;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    const newInvitation = new Invitation({
      groupId,
      userId: user._id,
      invitedBy
    });
    await newInvitation.save();

    res.status(201).json(newInvitation);
  } catch (error) {
    console.error('Error inviting member to group:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Respond to an invitation
router.patch('/invitations/:invitationId', authenticateToken, async (req, res) => {
  try {
    const { invitationId } = req.params;
    const { status } = req.body;

    const invitation = await Invitation.findById(invitationId);
    if (!invitation) {
      return res.status(404).json({ error: 'Invitation not found' });
    }

    if (status === 'accepted') {
      const group = await Group.findById(invitation.groupId);
      if (!group) {
        return res.status(404).json({ error: 'Group not found' });
      }

      if (!group.members.includes(invitation.userId)) {
        group.members.push(invitation.userId);
        await group.save();
      }
    }

    invitation.status = status;
    await invitation.save();

    res.json(invitation);
  } catch (error) {
    console.error('Error responding to invitation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Fetch invitations by user ID
router.get('/invitations/user/:userId', authenticateToken, async (req, res) => {
  const { userId } = req.params;

  try {
    const invitations = await Invitation.find({ userId, status: 'pending' }).populate('groupId', 'groupName');
    res.status(200).json(invitations);
  } catch (error) {
    console.error('Error fetching invitations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Remove a member from a group
router.delete('/:groupId/members/:userId', authenticateToken, async (req, res) => {
  const { groupId, userId } = req.params;
  console.log(`Request to remove user with ID: ${userId} from group ID: ${groupId}`);

  try {
    const group = await Group.findById(groupId);
    if (!group) {
      console.log('Group not found');
      return res.status(404).json({ error: 'Group not found' });
    }

    const memberIndex = group.members.indexOf(userId);
    if (memberIndex === -1) {
      console.log('User is not a member of the group');
      return res.status(400).json({ error: 'User is not a member of the group' });
    }

    group.members.splice(memberIndex, 1);
    await group.save();

    console.log('User removed successfully');
    res.json(group);
  } catch (error) {
    console.error('Error removing member from group:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add this in your groupRoutes.js or equivalent
router.get('/:groupId/isAdmin', authenticateToken, async (req, res) => {
  const { groupId } = req.params;
  const userId = req.user.userId;

  try {
    const group = await Group.findById(groupId);
    if (group.administrators.includes(userId)) {
      return res.json({ isAdmin: true });
    } else {
      return res.json({ isAdmin: false });
    }
  } catch (error) {
    console.error('Error checking admin status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
