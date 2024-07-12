import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { FaTimes, FaUsersCog, FaPlus } from 'react-icons/fa';
import { useUser } from '../components/UserContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

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

interface Invitation {
  _id: string;
  groupId: { _id: string; groupName: string };
}

const UserHome: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useUser();
  const [groups, setGroups] = useState<Group[]>([]);
  const [files, setFiles] = useState<FileData[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [groupName, setGroupName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [groupFiles, setGroupFiles] = useState<FileData[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');

  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

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

    const fetchInvitations = async () => {
      try {
        const token = localStorage.getItem('token');
        const userId = user?._id;

        if (token && userId) {
          const response = await axios.get(`http://localhost:8080/api/invitations/user/${userId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setInvitations(response.data);
        } else {
          console.error('User not authenticated');
        }
      } catch (error) {
        console.error('Error fetching invitations:', error);
      }
    };

    fetchGroups();
    fetchFiles();
    fetchInvitations();
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
      handleFileUpload(file);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!user?._id) {
      console.error('User ID is not defined');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const userId = user._id;

      const formData = new FormData();
      formData.append('file', file);
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
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  const handleAdminButtonClick = (event: React.MouseEvent, group: Group) => {
    event.stopPropagation();
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
      console.log(`Adding member with email: ${newMemberEmail}`);
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `http://localhost:8080/api/invitations/${selectedGroup._id}/members`,
        { email: newMemberEmail },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setNewMemberEmail('');
      console.log(`Invitation sent to ${newMemberEmail}`, response.data);
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
      const groupId = selectedGroup._id;
      console.log(`Deleting user with ID: ${userId} from group ID: ${groupId}`);
      const url = `http://localhost:8080/api/groups/${groupId}/members/${userId}`;
      console.log(`Request URL: ${url}`);

      await axios.delete(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      await refreshSelectedGroup(groupId);
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const handleRespondToInvitation = async (invitationId: string, status: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `http://localhost:8080/api/invitations/invitations/${invitationId}`,
        { status },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Refresh invitations and groups after responding to an invitation
      const userId = user?._id;
      if (userId) {
        const [updatedGroupsResponse, updatedInvitationsResponse] = await Promise.all([
          axios.get(`http://localhost:8080/api/groups?userId=${userId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          axios.get(`http://localhost:8080/api/invitations/user/${userId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

        setGroups(updatedGroupsResponse.data);
        setInvitations(updatedInvitationsResponse.data);
      }
    } catch (error) {
      console.error('Error responding to invitation:', error);
    }
  };

  const handleGroupClick = (groupId: string) => {
    navigate(`/blitz/${groupId}/null`);
  };

  const handleFileClick = (fileId: string) => {
    navigate(`/blitz/null/${fileId}`);
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    try {
      const token = localStorage.getItem('token');
  
      if (!token) {
        alert('User not authenticated.');
        return;
      }
  
      const response = await axios.delete(`http://localhost:8080/api/files/${fileId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      if (response.status === 200) {
        console.log(`File with ID: ${fileId} deleted successfully`);
        // Refresh the file list
        setFiles(files.filter(file => file._id !== fileId));
      } else {
        console.error(`Failed to delete file with ID: ${fileId}`);
      }
    } catch (error) {
      console.error(`Error deleting file with ID: ${fileId}`, error);
    }
  };
  

  const handleDeleteGroupFile = async (groupId: string, fileId: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8080/api/files/group/${groupId}/${fileId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Refresh the group files list
      const updatedGroupFilesResponse = await axios.get(`http://localhost:8080/api/files/group/${groupId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setGroupFiles(updatedGroupFilesResponse.data);
    } catch (error) {
      console.error('Error deleting group file:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white px-4 py-8">
      <div className="max-w-4xl mx-auto mt-16">
        <h1 className="text-4xl font-bold mb-8 text-center font-orbitron">
          {t('userHome.welcome')}{" "}
          <span
            className="text-blue-500 hover:text-blue-700 cursor-pointer"
            onClick={() => navigate('/Profile')}
          >
            {user?.username ? `${user.username}` : ''}
          </span>
        </h1>

        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 font-orbitron">{t('userHome.createGroup')}</h2>
          <div className="flex">
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder={t('userHome.enterGroupName')}
              className="border border-gray-600 bg-gray-800 rounded-l-md px-4 py-2 w-full text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-orbitron"
            />
            <button
              onClick={handleCreateGroup}
              className="bg-blue-600 hover:bg-blue-700 rounded-r-md px-6 py-2 text-white font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 font-orbitron"
            >
              {t('userHome.create')}
            </button>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              <h2 className="text-2xl font-bold font-orbitron mr-4">{t('userHome.yourFiles')}</h2>
              <button
                onClick={triggerFileInput}
                className="bg-blue-600 hover:bg-blue-700 rounded-md px-4 py-2 text-white font-bold flex items-center focus:outline-none focus:ring-2 focus:ring-blue-500 font-orbitron"
              >
                {t('userHome.addFile')}
              </button>
              <input
                id="file-upload"
                type="file"
                onChange={handleFileChange}
                className="hidden"
                ref={fileInputRef}
              />
            </div>
          </div>
          {files.length === 0 ? (
            <p className="text-gray-400 font-orbitron">{t('userHome.noFiles')}</p>
          ) : (
            files.map((file) => (
              <div
                key={file._id}
                className="border border-gray-600 bg-gray-800 rounded-md px-4 py-2 mb-4 flex justify-between items-center cursor-pointer font-orbitron"
              >
                <span onClick={() => handleFileClick(file._id)}>{file.filename}</span>
                <button
                  onClick={() => handleDeleteFile(file._id)}
                  className="bg-grey-600 hover:bg-red-500 rounded-md px-2 py-1 text-white font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  x
                </button>
              </div>
            ))
          )}
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 font-orbitron">{t('userHome.yourGroups')}</h2>
          {groups.length === 0 ? (
            <p className="text-gray-400 font-orbitron">{t('userHome.noGroups')}</p>
          ) : (
            groups.map((group) => (
              <div
                key={group._id}
                className="border border-gray-600 bg-gray-800 rounded-md px-4 py-2 mb-4 cursor-pointer"
                onClick={() => handleGroupClick(group._id)}
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold font-orbitron">{group.groupName}</h3>
                  {group.administrators.some(admin => admin._id === user?._id) && (
                    <button
                      onClick={(e) => handleAdminButtonClick(e, group)}
                      className="bg-yellow-600 hover:bg-yellow-700 rounded-md px-2 py-1 text-white font-bold flex items-center font-orbitron"
                    >
                      <FaUsersCog className="mr-2" /> {t('userHome.admin')}
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 font-orbitron">{t('userHome.invitations')}</h2>
          {invitations.length === 0 ? (
            <p className="text-gray-400 font-orbitron">{t('userHome.noInvitations')}</p>
          ) : (
            invitations.map((invitation) => (
              <div key={invitation._id} className="bg-gray-800 p-4 rounded-md mb-4 shadow-lg">
                <p className="text-white mb-2">{t('userHome.invitationText', { groupName: invitation.groupId.groupName })}</p>
                <button
                  onClick={() => handleRespondToInvitation(invitation._id, 'accepted')}
                  className="bg-green-600 hover:bg-green-700 rounded-md px-4 py-2 text-white font-bold mr-2"
                >
                  {t('userHome.accept')}
                </button>
                <button
                  onClick={() => handleRespondToInvitation(invitation._id, 'rejected')}
                  className="bg-red-600 hover:bg-red-700 rounded-md px-4 py-2 text-white font-bold"
                >
                  {t('userHome.reject')}
                </button>
              </div>
            ))
          )}
        </div>

        {showModal && selectedGroup && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-gray-800 rounded-md shadow-lg p-8 w-full max-w-md">
              <h3 className="text-2xl font-bold mb-4 text-center font-orbitron">{t('userHome.adminPanel', { groupName: selectedGroup.groupName })}</h3>
              <div className="mb-4">
                <h4 className="text-lg font-bold mb-2 font-orbitron">{t('userHome.addMember')}</h4>
                <div className="flex">
                  <input
                    type="email"
                    value={newMemberEmail}
                    onChange={(e) => setNewMemberEmail(e.target.value)}
                    placeholder={t('userHome.enterMemberEmail')}
                    className="border border-gray-600 bg-gray-700 rounded-l-md px-4 py-2 w-full text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-orbitron"
                  />
                  <button
                    onClick={handleAddMember}
                    className="bg-green-600 hover:bg-green-700 rounded-r-md px-6 py-2 text-white font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 font-orbitron"
                  >
                    {t('userHome.invite')}
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="text-lg font-bold mb-2 font-orbitron">{t('userHome.addAdmin')}</h4>
                <div className="flex">
                  <input
                    type="email"
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                    placeholder={t('userHome.enterAdminEmail')}
                    className="border border-gray-600 bg-gray-700 rounded-l-md px-4 py-2 w-full text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-orbitron"
                  />
                  <button
                    onClick={handleAddAdmin}
                    className="bg-yellow-600 hover:bg-yellow-700 rounded-r-md px-6 py-2 text-white font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 font-orbitron"
                  >
                    {t('userHome.add')}
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="text-lg font-bold mb-2 font-orbitron">{t('userHome.members')}</h4>
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
                {t('userHome.close')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserHome;
