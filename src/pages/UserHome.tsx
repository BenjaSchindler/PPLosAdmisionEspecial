import React, { useEffect, useState } from 'react';
import axios from 'axios';
import backgroundImage from './assets/background.jpg'; // Asegúrate de que la ruta sea correcta

interface Group {
  _id: string;
  groupName: string;
}

interface FileData {
  _id: string;
  filename: string;
}

const UserHome: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [files, setFiles] = useState<FileData[]>([]);
  const [groupName, setGroupName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const userId = user._id;
    
        if (token && userId) {
          console.info('Fetching groups for user:', userId); 
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

    const fetchFiles = async () => {
      try {
        const token = localStorage.getItem('token');
        console.debug('Token value (fetchFiles):', token);
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        console.debug('User object:', user);

        if (token && user._id) {
          const userId = user._id;
          console.debug('User ID:', userId);
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

      console.debug('Creating group with user ID:', userId, 'and group name:', groupName);
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
      console.info('Group created:', response.data);

      const updatedGroupsResponse = await axios.get(`http://localhost:8080/api/groups?userId=${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setGroups(updatedGroupsResponse.data);

      setGroupName('');
    } catch (error) {
      console.error('Error creating group:', error);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleFileUpload = async () => {
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = user._id;

      if (!selectedFile) {
        alert('Please select a file first.');
        return;
      }

      const formData = new FormData();
      formData.append('file', selectedFile as Blob);
      formData.append('userId', userId);

      const response = await axios.post(
        'http://localhost:8080/api/files/upload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log('File uploaded:', response.data);

      const updatedFilesResponse = await axios.get(`http://localhost:8080/api/files/user/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setFiles(updatedFilesResponse.data);

      setSelectedFile(null);
      (document.getElementById('file-upload') as HTMLInputElement).value = '';
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center text-white px-4 py-8"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="max-w-4xl mx-auto mt-16 bg-gray-900 bg-opacity-75 p-8 rounded-lg">
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

        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 font-orbitron">Upload a SQL File</h2>
          <div className="flex">
            <input
              id="file-upload"
              type="file"
              onChange={handleFileChange}
              className="border border-gray-600 bg-gray-800 rounded-l-md px-4 py-2 w-full text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-orbitron"
            />
            <button
              onClick={handleFileUpload}
              className="bg-blue-600 hover:bg-blue-700 rounded-r-md px-6 py-2 text-white font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 font-orbitron"
            >
              Upload
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

