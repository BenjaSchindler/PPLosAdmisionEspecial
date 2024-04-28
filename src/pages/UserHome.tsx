import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Group {
  _id: string;
  groupName: string;
  // other group properties
}

interface File {
  _id: string;
  filename: string;
  // other file properties
}

const UserHome: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [groupName, setGroupName] = useState('');

  useEffect(() => {
    // Fetch user's groups from the backend API
    const fetchGroups = async () => {
      try {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const userId = user._id;
    
        if (token && userId) {
          const response = await axios.get(`http://localhost:8080/api/groups?userId=${userId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setGroups(response.data);
        } else {
          console.error('User not authenticated or user ID not found');
        }
      } catch (error) {
        console.error('Error fetching groups:', error);
      }
    };

    // Fetch user's personal files from the backend API
    const fetchFiles = async () => {
      try {
        const token = localStorage.getItem('token');
        console.log('Token value (fetchFiles):', token);
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        console.log('User object:', user);

        if (token && user._id) {
          const userId = user._id;
          console.log('User ID:', userId);
          const response = await axios.get(`http://localhost:8080/api/files/user/${userId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          setFiles(response.data);
        } else {
          console.error('User not authenticated');
        }
      } catch (error) {
        console.error('Error fetching files:', error);
      }
    };

    fetchGroups();
    fetchFiles();
  }, []);


  const handleCreateGroup = async () => {
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = user._id;
  
      console.log(userId);
      console.log(groupName);
      const response = await axios.post(
        'http://localhost:8080/api/groups',
        {
          groupName,
          userId,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log('Group created:', response.data);
  
      // Fetch the updated list of groups after creating a new group
      const updatedGroupsResponse = await axios.get(`http://localhost:8080/api/groups?userId=${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setGroups(updatedGroupsResponse.data);
  
      // Clear the input field
      setGroupName('');
    } catch (error) {
      console.error('Error creating group:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white px-4 py-8">
      <div className="max-w-4xl mx-auto mt-16"> {/* Add top margin here */}
        <h1 className="text-4xl font-bold mb-8 text-center font-orbitron">Welcome to Your Dashboard</h1>

        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 font-orbitron">Create a New Group</h2>
          <div className="flex">
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Enter group name"
              className="border border-gray-600 bg-gray-800 rounded-l-md px-4 py-2 w-full text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-orbitron"
            />
            <button
              onClick={handleCreateGroup}
              className="bg-blue-600 hover:bg-blue-700 rounded-r-md px-6 py-2 text-white font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 font-orbitron"
            >
              Create
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-4 font-orbitron">Your Groups</h2>
            <ul className="space-y-4">
              {groups.map((group) => (
                <li key={group._id} className="bg-gray-700 rounded-md px-4 py-2 font-orbitron">
                  {group.groupName}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-4 font-orbitron">Your Files</h2>
            <ul className="space-y-4">
              {files.map((file) => (
                <li key={file._id} className="bg-gray-700 rounded-md px-4 py-2 font-orbitron">
                  {file.filename}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserHome;