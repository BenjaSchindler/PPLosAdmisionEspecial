import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Blitz: React.FC = () => {
  const [files, setFiles] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');

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

  useEffect(() => {
    // Fetch the user's files from the backend API
    fetchFiles();
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = event.target.files;
    if (uploadedFiles) {
      const fileArray = Array.from(uploadedFiles);
      const formData = new FormData();
      fileArray.forEach((file) => {
        formData.append('file', file);
      });

      // Get the userId from the user object stored in localStorage
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = user._id;
      formData.append('userId', userId);

      try {
        const token = localStorage.getItem('token');
        const response = await axios.post('http://localhost:8080/api/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
          params: {
            userId: userId,
          },
        });
        console.log('Files uploaded successfully:', response.data);
        fetchFiles();
      } catch (error) {
        console.error('Error uploading files:', error);
      }
    }
  };


  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(event.target.value);
  };

  return (
    <div
      className="min-h-screen flex pt-16"
      style={{
        backgroundImage: 'url(https://i.imgur.com/ZNV81El.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Left column */}
      <div className="w-1/6 bg-gray-900 p-4">
        <h2 className="text-xl text-white font-bold mb-4">Files</h2>
        <ul className="space-y-2">
          {files.map((file, index) => (
            <li key={index} className="text-gray-400 hover:text-white cursor-pointer">
              {file.filename}
            </li>
          ))}
        </ul>
        <label htmlFor="file-upload" className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded cursor-pointer">
          Add Files +
        </label>
        <input
          id="file-upload"
          type="file"
          multiple
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>

      {/* Main content */}
      <div className="flex-grow p-8">
        <div className="w-2/3 mx-auto bg-slate-800 shadow-md rounded-lg p-6 mb-4">
          {/* Content of the large column */}
          <h2 className="text-2xl text-white font-bold mb-4">Large Column</h2>
          <p className="text-gray-300">This is the content of the large column.</p>
        </div>
        <input
          type="text"
          className="w-2/3 mx-auto block px-4 py-2 bg-slate-700 text-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter text"
          value={inputText}
          onChange={handleInputChange}
        />
      </div>
    </div>
  );
};

export default Blitz;