const express = require('express');
const router = express.Router();
const Invitation = require('./invitationModel');
const User = require('./userModel');
const Group = require('./groupModel');
const { authenticateToken } = require('./authMiddleware');

// Invite a member to a group
router.post('/:groupId/members', authenticateToken, async (req, res) => {
    try {
      const { email } = req.body;
      const invitedBy = req.user.userId;
      const groupId = req.params.groupId;
  
      console.log(`Inviting member with email: ${email} to group: ${groupId} by user: ${invitedBy}`);
  
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
  
      console.log('Invitation created:', newInvitation);
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
      const userId = req.user.userId;
  
      const invitation = await Invitation.findById(invitationId);
      if (!invitation) {
        return res.status(404).json({ error: 'Invitation not found' });
      }
  
      if (invitation.userId.toString() !== userId) {
        return res.status(403).json({ error: 'You are not authorized to respond to this invitation' });
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
router.get('/user/:userId', authenticateToken, async (req, res) => {
  const { userId } = req.params;

  try {
    const invitations = await Invitation.find({ userId, status: 'pending' }).populate('groupId', 'groupName');
    res.status(200).json(invitations);
  } catch (error) {
    console.error('Error fetching invitations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
