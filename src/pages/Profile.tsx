import React, { useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { googleLogout } from '@react-oauth/google';
import { UserContext } from '../components/UserContext';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { updateUserPhotoURL } = useLocation().state || {};
  const { user, setUser } = useContext(UserContext);

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      const formData = new FormData();
      formData.append('photo', file);

      try {
        const response = await axios.post('http://localhost:8080/uploadProfilePhoto', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: localStorage.getItem('token'),
          },
        });

        if (response.data.user) {
          // Update the user information in the context and local storage
          setUser(response.data.user);
          localStorage.setItem("user", JSON.stringify(response.data.user));

          // Call the updateUserPhotoURL function from the Navbar component
          if (updateUserPhotoURL) {
            updateUserPhotoURL();
          }
        }
      } catch (error) {
        console.error('Error uploading profile photo:', error);
      }
    }
  };

  const handleSignOut = () => {
    // Remove the token and user information from localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Clear the user state in the UserContext
    setUser(null);

    // Perform Google logout
    googleLogout();

    // Redirect to the login page
    navigate("/login");
  };

  if (!user || !user.email) {
    navigate('/login');
    return null;
  }

  return (
    <div className="flex justify-center items-center h-screen bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900">
      <div className="bg-slate-800 shadow-lg rounded-lg px-8 pt-6 pb-8 mb-4 w-full max-w-md">
        <div className="flex flex-col items-center">
          <div className="relative">
            {user.photoURL ? (
              <img src={user.photoURL} alt="User" className="w-32 h-32 rounded-full mb-4 shadow-md" />
            ) : (
              <div className="w-32 h-32 rounded-full bg-gray-300 mb-4 flex items-center justify-center shadow-md">
                <span className="text-4xl text-white font-bold uppercase">{user.username.charAt(0)}</span>
              </div>
            )}
            <label
              htmlFor="photo-upload"
              className="absolute bottom-0 right-0 p-2 bg-purple-700 rounded-full cursor-pointer hover:bg-purple-600"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                />
              </svg>
            </label>
            <input
              id="photo-upload"
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">{user.username}</h2>
          <p className="text-gray-400 mb-4">{user.email}</p>
          <button
            onClick={handleSignOut}
            className="mt-4 px-4 py-2 bg-purple-700 text-white rounded-lg hover:bg-purple-600 focus:outline-none"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
