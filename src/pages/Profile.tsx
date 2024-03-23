import React from 'react';
import { useNavigate } from 'react-router-dom';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (!user || !user.email) {
    // If user data is not available, redirect to the login page
    navigate('/login');
    return null;
  }

  return (
    <div className="flex justify-center items-center h-screen bg-slate-900">
      <div className="bg-slate-950 shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <div className="flex flex-col items-center">
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt="User"
              className="w-32 h-32 rounded-full mb-4"
            />
          ) : (
            <div className="w-32 h-32 rounded-full bg-gray-300 mb-4 flex items-center justify-center">
              <span className="text-4xl text-white font-bold uppercase">
                {user.username.charAt(0)}
              </span>
            </div>
          )}
          <h2 className="text-xl font-bold text-white mb-2">{user.username}</h2>
          <p className="text-gray-300 mb-4">{user.email}</p>
        </div>
      </div>
    </div>
  );
};

export default Profile;