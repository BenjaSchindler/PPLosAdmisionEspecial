import React, { useState, useRef, useEffect } from 'react';
import { FaChevronDown } from 'react-icons/fa';
import { useUser } from '../components/UserContext';
import axios from 'axios';

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
  const [showOptions, setShowOptions] = useState<boolean>(false);
  const [resultOption, setResultOption] = useState<string>('output'); // default option
  const [groups, setGroups] = useState<Group[]>([]);
  const [files, setFiles] = useState<FileData[]>([]);
  const [groupName, setGroupName] = useState('');
  const [selectedFile, setSelectedFile] = useState<FileData | null>(null);
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

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
        console.debug(`Fetching chat history for file: ${selectedFile.filename} and user: ${user._id}`);
        const response = await axios.get(`http://localhost:5001/api/chats/file/${selectedFile._id}/user/${user._id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setMessages(response.data);
        console.info('Chat history fetched successfully');
      } catch (error) {
        console.error('Error fetching chat history:', error);
      }
    };

    fetchChatHistory();
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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileToUpload(file);
    }
  };

  const handleFileUpload = async () => {
    try {
      const token = localStorage.getItem('token');
      const userId = user?._id;

      if (!fileToUpload) {
        alert('Please select a file first.');
        return;
      }

      if (!userId) {
        alert('User ID not found.');
        return;
      }

      const formData = new FormData();
      formData.append('file', fileToUpload);
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

      setFileToUpload(null);
      (document.getElementById('file-upload') as HTMLInputElement).value = '';
    } catch (error) {
      console.error('Error uploading file:', error);
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
    console.debug(`User submitted question: ${question}`);

    try {
      const response = await fetch('http://localhost:5001/api/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question,
          resultOption,
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
      console.info(`Bot response received: ${data.answer}`);
    } catch (error) {
      console.error('Error fetching answer:', error);
      const errorMessage = { sender: 'bot', text: 'Error occurred while fetching answer' };
      setMessages([...messages, userMessage, errorMessage]);
    } finally {
      setLoading(false);
    }

    setQuestion('');
  };

  const toggleOptions = () => {
    setShowOptions(!showOptions);
  };

  const selectOption = (option: string) => {
    setResultOption(option);
    setShowOptions(false);
  };

  return (
    <div className="flex h-screen" style={{ paddingTop: '60px', backgroundColor: '#1a202c' }}>
      <div className="w-1/4 bg-gray-900 text-white p-4 flex flex-col">
        <h2 className="text-xl mb-4">Your Groups</h2>
        <ul className="flex-1 overflow-y-auto">
          {groups.map((group) => (
            <li key={group._id} className="p-2 bg-gray-700 rounded-md mb-2">{group.groupName}</li>
          ))}
        </ul>
        <h2 className="text-xl mb-4 mt-8">Your Files</h2>
        <ul className="flex-1 overflow-y-auto">
          {files.map((file) => (
            <li key={file._id} className={`p-2 cursor-pointer ${selectedFile && selectedFile._id === file._id ? 'bg-gray-700' : ''}`} onClick={() => setSelectedFile(file)}>
              {file.filename}
            </li>
          ))}
        </ul>
        <input type="file" id="file-upload" onChange={handleFileChange} className="mt-4 p-2 bg-white text-gray-800 cursor-pointer" />
        <button
          onClick={handleFileUpload}
          className="bg-blue-600 hover:bg-blue-700 rounded-md px-4 py-2 mt-2 text-white font-bold"
        >
          Upload
        </button>
      </div>
      <div className="flex-1 flex flex-col">
        <div className="absolute top-16 right-4">
          <button
            type="button"
            onClick={toggleOptions}
            className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring focus:ring-blue-300"
          >
            Options <FaChevronDown />
          </button>
          {showOptions && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded-lg shadow-lg">
              <div className="py-2 px-4 hover:bg-gray-100 cursor-pointer" onClick={() => selectOption('output')}>
                Only Output
              </div>
              <div className="py-2 px-4 hover:bg-gray-100 cursor-pointer" onClick={() => selectOption('full')}>
                Show Everything
              </div>
            </div>
          )}
        </div>
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
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-transparent" style={{ marginBottom: '20px' }}>
          <form onSubmit={handleSubmit} className="flex space-x-0 mx-auto max-w-2xl relative">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Enter your question"
              className="flex-1 rounded-l-lg border border-gray-300 p-2 focus:outline-none focus:ring focus:border-blue-300"
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
