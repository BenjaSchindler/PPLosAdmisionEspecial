import React, { useState } from 'react';
import axios from 'axios';

const CreateGroupButton = () => {
  const [groupName, setGroupName] = useState('');

  const handleCreateGroup = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        '/api/groups',
        {
          groupId: Date.now().toString(), // Generate a unique group ID
          groupName,
          members: [], // Initially, the group has no members
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log('Group created:', response.data);
      // Perform any additional actions after creating the group
    } catch (error) {
      console.error('Error creating group:', error);
    }
  };

  return (
    <div>
      <input
        type="text"
        value={groupName}
        onChange={(e) => setGroupName(e.target.value)}
        placeholder="Enter group name"
      />
      <button onClick={handleCreateGroup}>Create Group</button>
    </div>
  );
};

export default CreateGroupButton;