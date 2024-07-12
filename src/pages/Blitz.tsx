import React, { useState, useRef, useEffect } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { useUser } from '../components/UserContext';
import axios from 'axios';
import { useParams } from 'react-router-dom';

interface Group {
  _id: string;
  groupName: string;
}

interface FileData {
  _id: string;
  filename: string;
}

const Blitz: React.FC = () => {
  const { user } = useUser();
  const [question, setQuestion] = useState<string>('');
  const [messages, setMessages] = useState<{ sender: string, text: string }[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [groups, setGroups] = useState<Group[]>([]);
  const [files, setFiles] = useState<FileData[]>([]);
  const [groupFiles, setGroupFiles] = useState<FileData[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileData | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [showGroups, setShowGroups] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | undefined>(undefined);
  const { groupId, fileId } = useParams<{ groupId: string, fileId: string }>();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const fetchChatHistory = async () => {
      if (!selectedFile || !user?._id) return;
      try {
        const response = await axios.get(`http://localhost:8080/api/chats/file/${selectedFile._id}/user/${user._id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setMessages(response.data);
      } catch (error) {
        console.error('Error fetching chat history:', error);
      }
    };

    if (selectedFile) {
      setMessages([]); // Clear messages before fetching new chat history
      fetchChatHistory();
    }
  }, [selectedFile, user]);

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
          if (response.data.length > 0) {
            setSelectedFile(response.data[0]);
          }
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

  useEffect(() => {
    const fetchGroupFiles = async (groupId: string) => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:8080/api/files/group/${groupId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setGroupFiles(response.data);
      } catch (error) {
        console.error('Error fetching group files:', error);
      }
    };

    if (groupId) {
      fetchGroupFiles(groupId);
    }

    if (fileId) {
      setSelectedFile({ _id: fileId, filename: '' });
    }
  }, [groupId, fileId]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const token = localStorage.getItem('token');
        const userId = user?._id;

        if (!userId) {
          alert('User ID not found.');
          return;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('userId', userId);

        if (selectedGroup) {
          formData.append('groupId', selectedGroup._id);
        }

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

        if (selectedGroup) {
          const updatedGroupFilesResponse = await axios.get(`http://localhost:8080/api/files/group/${selectedGroup._id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setGroupFiles(updatedGroupFilesResponse.data);
        } else {
          const updatedFilesResponse = await axios.get(`http://localhost:8080/api/files/user/${userId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setFiles(updatedFilesResponse.data);
        }

        setSelectedFile(response.data);
      } catch (error) {
        console.error('Error uploading file:', error);
      }
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (question.trim() === '') {
      alert('Please enter a question.');
      return;
    }

    const userMessage = { sender: 'user', text: question };
    setMessages([...messages, userMessage]);
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5001/api/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question,
          userId: user?._id || 'default_user_id',
          sender: user?._id || 'default_user_id',
          fileId: selectedFile?._id,
          dbFilePath: selectedFile ? selectedFile.filename : '',
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      const botMessage = { sender: 'bot', text: data.answer || 'No answer received' };
      setMessages([...messages, userMessage, botMessage]);
    } catch (error) {
      console.error('Error fetching answer:', error);
      const errorMessage = { sender: 'bot', text: 'Error occurred while fetching answer' };
      setMessages([...messages, userMessage, errorMessage]);
    } finally {
      setLoading(false);
    }

    setQuestion('');
  };

  const handleFileClick = (file: FileData) => {
    setSelectedFile(file);
    setMessages([]); // Clear messages before fetching new chat history
  };

  const handleGroupClick = async (group: Group) => {
    setSelectedGroup(group);
    setSelectedFile(null);
    setMessages([]);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:8080/api/files/group/${group._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setGroupFiles(response.data);

      // Check if the user is an admin of the selected group
      const adminResponse = await axios.get(`http://localhost:8080/api/groups/${group._id}/isAdmin`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setIsAdmin(adminResponse.data.isAdmin ?? false);
    } catch (error) {
      console.error('Error fetching group files or checking admin status:', error);
    }
  };

  const handleBackToFiles = () => {
    setSelectedGroup(null);
    setGroupFiles([]);
    setSelectedFile(null);
  };

  const toggleGroupView = () => {
    setShowGroups(!showGroups);
  };

  return (
    <div className="flex h-screen" style={{ paddingTop: '60px', backgroundImage: 'url(https://i.imgur.com/ZNV81El.jpeg)', backgroundSize: 'cover' }}>
      <div className="w-1/4 bg-gray-900 text-white p-4 flex flex-col rounded-lg shadow-md">
        <h2 className="text-xl mb-4 cursor-pointer flex justify-between items-center" onClick={toggleGroupView}>
          {selectedGroup ? selectedGroup.groupName : 'My Files'}
          {showGroups ? <FaChevronUp /> : <FaChevronDown />}
        </h2>
        {showGroups && (
          <div className="bg-gray-800 rounded-lg shadow-md p-4 mb-4">
            <ul className="overflow-y-auto">
              <li
                className={`p-2 cursor-pointer ${!selectedGroup ? 'bg-blue-700' : 'bg-gray-700'} mb-2 rounded-md`}
                onClick={handleBackToFiles}
              >
                My Files
              </li>
              <hr className="border-gray-600 my-2" />
              {groups.map((group) => (
                <li
                  key={group._id}
                  className={`p-2 cursor-pointer ${selectedGroup && selectedGroup._id === group._id ? 'bg-blue-700' : 'bg-gray-700'} mb-2 rounded-md`}
                  onClick={() => handleGroupClick(group)}
                >
                  {group.groupName}
                </li>
              ))}
            </ul>
          </div>
        )}
        <hr className="my-4 border-gray-600" />
        <ul className="flex-1 overflow-y-auto">
          {!selectedGroup && (
            files.map((file) => (
              <li
                key={file._id}
                className={`p-2 cursor-pointer ${selectedFile && selectedFile._id === file._id ? 'bg-gray-700' : ''} rounded-md`}
                onClick={() => handleFileClick(file)}
              >
                {file.filename}
              </li>
            ))
          )}
          {selectedGroup && (
            groupFiles.map((file) => (
              <li
                key={file._id}
                className={`p-2 cursor-pointer ${selectedFile && selectedFile._id === file._id ? 'bg-gray-700' : ''} rounded-md`}
                onClick={() => handleFileClick(file)}
              >
                {file.filename}
              </li>
            ))
          )}
        </ul>
        <label 
          htmlFor="file-upload" 
          className={`mt-4 p-2 rounded-md flex items-center justify-center ${selectedGroup && isAdmin === false ? 'bg-gray-600 cursor-not-allowed' : 'bg-blue-600 cursor-pointer hover:bg-blue-700'}`}
        >
          Add a file +
        </label>
        <input 
          type="file" 
          id="file-upload" 
          onChange={handleFileChange} 
          className="hidden" 
          disabled={selectedGroup && isAdmin === false || undefined}
        />
      </div>
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 pb-20">
          <div className="max-w-2xl mx-auto space-y-4">
            {messages.length === 0 && (
              <div className="flex justify-center">
                <img src="https://imgur.com/YXpZPKU.png" alt="Welcome" />
              </div>
            )}
            {messages.map((message, index) => (
              <div key={index} className={`flex ${message.sender === 'bot' ? 'justify-start' : 'justify-end'}`}>
                <div className={`rounded-lg p-3 ${message.sender === 'bot' ? 'bg-gray-300 text-gray-900' : 'bg-blue-500 text-white'}`} style={{ maxWidth: '75%', margin: '10px' }}>
                  {message.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-300 text-gray-900 rounded-lg p-3" style={{ maxWidth: '75%', margin: '10px' }}>
                  <TypingIndicator />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
        <div className="flex-shrink-0 p-4 bg-transparent">
          <form onSubmit={handleSubmit} className="flex space-x-0 max-w-2xl mx-auto">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Enter your question"
              className="flex-1 rounded-l-lg border border-gray-700 p-2 focus:outline-none focus:ring focus:border-blue-300 bg-gray-800 text-white"
              style={{ borderRight: 'none' }}
            />
            <button
              type="submit"
              className="bg-blue-600 text-white rounded-r-lg p-2 hover:bg-blue-700 focus:outline-none focus:ring focus:ring-blue-300"
            >
              Submit
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const TypingIndicator: React.FC = () => (
  <div className="flex space-x-1.5">
    <div className="w-2.5 h-2.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
    <div className="w-2.5 h-2.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
    <div className="w-2.5 h-2.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
  </div>
);

export default Blitz;
