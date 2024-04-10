import React, { useEffect, useState } from 'react';
import axios from 'axios';
import CreateGroupButton from '../components/CreateGroupButton';


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

  useEffect(() => {
    // Fetch user's groups from the backend API
    const fetchGroups = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/groups', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setGroups(response.data);
      } catch (error) {
        console.error('Error fetching groups:', error);
      }
    };

    // Fetch user's personal files from the backend API
    const fetchFiles = async () => {
      try {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const userId = user._id;

        const response = await axios.get(`http://localhost:8080/api/files/user/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setFiles(response.data);
      } catch (error) {
        console.error('Error fetching files:', error);
      }
    };

    fetchGroups();
    fetchFiles();
  }, []);

  return (
    <div className="mt-16 p-4">
      <h1 className="text-2xl font-bold mb-4">Welcome to Your Dashboard</h1>

      <div className="mb-8">
        <h2 className="text-xl font-bold mb-2">Create a New Group</h2>
        <CreateGroupButton />
      </div>

      <div className="grid grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-bold mb-2">Your Groups</h2>
          {/* Render the list of groups */}
          <ul className="space-y-2">
            {groups.map((group) => (
              <li key={group._id} className="text-gray-800">
                {group.groupName}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-bold mb-2">Your Files</h2>
          {/* Render the list of personal files */}
          <ul className="space-y-2">
            {files.map((file) => (
              <li key={file._id} className="text-gray-800">
                {file.filename}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default UserHome;