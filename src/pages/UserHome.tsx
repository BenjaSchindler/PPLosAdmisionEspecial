import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaTimes, FaUsersCog } from 'react-icons/fa';
import { useUser } from '../components/UserContext';

interface Group {
  _id: string;
  groupName: string;
  administrators: { _id: string; email: string }[];
  members: { _id: string; email: string }[];
}

interface FileData {
  _id: string;
  filename: string;
}

const UserHome: React.FC = () => {
  const { user } = useUser();
  const [groups, setGroups] = useState<Group[]>([]);
  const [files, setFiles] = useState<FileData[]>([]);
  const [groupName, setGroupName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const token = localStorage.getItem('token');
        const userId = user?._id;

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

    const fetchFiles = async () => {
      try {
        const token = localStorage.getItem('token');
        const userId = user?._id;

        if (token && userId) {
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
  }, [user]);

  const handleCreateGroup = async () => {
    if (!user?._id) {
      console.error('User ID is not defined');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const userId = user._id;

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
    if (!user?._id) {
      console.error('User ID is not defined');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const userId = user._id;

      if (!selectedFile) {
        alert('Please select a file first.');
        return;
      }

      const formData = new FormData();
      formData.append('file', selectedFile);
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

  const handleAdminButtonClick = (group: Group) => {
    setSelectedGroup(group);
    setShowModal(true);
  };

  const fetchUserIdByEmail = async (email: string) => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`http://localhost:8080/api/user/email/${email}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data._id;
  };

  const refreshSelectedGroup = async (groupId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:8080/api/groups/${groupId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSelectedGroup(response.data);
    } catch (error) {
      console.error('Error refreshing selected group:', error);
    }
  };

  const handleAddMember = async () => {
    if (!selectedGroup) return;

    try {
      const userId = await fetchUserIdByEmail(newMemberEmail);

      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:8080/api/groups/${selectedGroup._id}/members`,
        { userId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      await refreshSelectedGroup(selectedGroup._id);
      setNewMemberEmail('');
    } catch (error) {
      console.error('Error adding member:', error);
    }
  };

  const handleAddAdmin = async () => {
    if (!selectedGroup) return;

    try {
      const userId = await fetchUserIdByEmail(newAdminEmail);

      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:8080/api/groups/${selectedGroup._id}/administrators`,
        { userId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      await refreshSelectedGroup(selectedGroup._id);
      setNewAdminEmail('');
    } catch (error) {
      console.error('Error adding administrator:', error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!selectedGroup) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8080/api/groups/${selectedGroup._id}/members/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      await refreshSelectedGroup(selectedGroup._id);
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white px-4 py-8">
      <div className="max-w-4xl mx-auto mt-16">
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
          </div>
          <button
            onClick={handleFileUpload}
            className="mt-2 bg-blue-600 hover:bg-blue-700 rounded-md px-6 py-2 text-white font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 font-orbitron"
          >
            Upload
          </button>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 font-orbitron">Your Groups</h2>
          {groups.length === 0 ? (
            <p className="text-gray-400 font-orbitron">You have no groups.</p>
          ) : (
            groups.map((group) => (
              <div key={group._id} className="border border-gray-600 bg-gray-800 rounded-md px-4 py-2 mb-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold font-orbitron">{group.groupName}</h3>
                  <button
                    onClick={() => handleAdminButtonClick(group)}
                    className="bg-yellow-600 hover:bg-yellow-700 rounded-md px-2 py-1 text-white font-bold flex items-center font-orbitron"
                  >
                    <FaUsersCog className="mr-2" /> Admin
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 font-orbitron">Your Files</h2>
          {files.length === 0 ? (
            <p className="text-gray-400 font-orbitron">You have no uploaded files.</p>
          ) : (
            files.map((file) => (
              <div key={file._id} className="border border-gray-600 bg-gray-800 rounded-md px-4 py-2 mb-4 font-orbitron">
                {file.filename}
              </div>
            ))
          )}
        </div>

        {showModal && selectedGroup && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-gray-800 rounded-md shadow-lg p-8 w-full max-w-md">
              <h3 className="text-2xl font-bold mb-4 text-center font-orbitron">{selectedGroup.groupName} - Admin Panel</h3>
              <div className="mb-4">
                <h4 className="text-lg font-bold mb-2 font-orbitron">Add Member</h4>
                <div className="flex">
                  <input
                    type="email"
                    value={newMemberEmail}
                    onChange={(e) => setNewMemberEmail(e.target.value)}
                    placeholder="Enter member's email"
                    className="border border-gray-600 bg-gray-700 rounded-l-md px-4 py-2 w-full text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-orbitron"
                  />
                  <button
                    onClick={handleAddMember}
                    className="bg-green-600 hover:bg-green-700 rounded-r-md px-6 py-2 text-white font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 font-orbitron"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="text-lg font-bold mb-2 font-orbitron">Add Admin</h4>
                <div className="flex">
                  <input
                    type="email"
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                    placeholder="Enter admin's email"
                    className="border border-gray-600 bg-gray-700 rounded-l-md px-4 py-2 w-full text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-orbitron"
                  />
                  <button
                    onClick={handleAddAdmin}
                    className="bg-yellow-600 hover:bg-yellow-700 rounded-r-md px-6 py-2 text-white font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 font-orbitron"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="text-lg font-bold mb-2 font-orbitron">Members</h4>
                <ul>
                  {selectedGroup.members.map((member) => (
                    <li key={member._id} className="flex justify-between items-center mb-2 border border-gray-600 bg-gray-700 rounded-md px-4 py-2">
                      <span>{member.email}</span>
                      <button
                        onClick={() => handleDeleteUser(member._id)}
                        className="bg-red-600 hover:bg-red-700 rounded-md px-2 py-1 text-white font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <FaTimes />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => setShowModal(false)}
                className="mt-4 bg-red-600 hover:bg-red-700 rounded-md px-4 py-2 text-white font-bold w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserHome;
