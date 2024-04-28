import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Blitz: React.FC = () => {
  const [files, setFiles] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');

  // Function to fetch files from the server
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

  // useEffect hook to fetch files when the component mounts
  useEffect(() => {
    fetchFiles();
  }, []);

  // Event handler for input text change
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = event.target.files;
    if (uploadedFiles) {
      const fileArray = Array.from(uploadedFiles);
      const formData = new FormData();
      fileArray.forEach((file) => {
        formData.append('file', file);
      });

      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = user._id;
      formData.append('userId', userId);

      try {
        await axios.post('http://localhost:8080/api/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        const updatedFilesResponse = await axios.get(`http://localhost:8080/api/files/user/${userId}`);
        setFiles(updatedFilesResponse.data);
      } catch (error) {
        console.error('Error uploading files:', error);
      }
    }
  };

  // Event handler for input text change
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(event.target.value);
  };

  // Event handler for question submission
  const handleQuestionSubmit = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/ask', { question });
      setAnswer(response.data.answer);
    } catch (error) {
      console.error('Error submitting question:', error);
    }
  };

  return (
    <div
      className="min-h-screen flex pt-20" // Add top padding to create space below the navbar
      style={{
        backgroundImage: 'url(https://i.imgur.com/ZNV81El.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="w-1/6 bg-gray-900 p-4">
        <h2 className="text-xl text-white font-bold mb-4 font-orbitron">Python App</h2>
        <div className="mb-4">
          <input
            type="text"
            className="w-full px-4 py-2 bg-slate-700 text-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-orbitron"
            placeholder="Enter your question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
          <button
            className="mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded font-orbitron"
            onClick={handleQuestionSubmit}
          >
            Submit
          </button>
        </div>
        <div className="text-gray-400 font-orbitron">{answer}</div>
      </div>
    </div>
  );
};

export default Blitz;