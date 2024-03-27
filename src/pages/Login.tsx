import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';

const Login: React.FC = () => {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  
    try {
      const response = await axios.post('http://localhost:8080/Login', {
        usernameOrEmail,
        password,
      });
  
      if (response.data.token) {
        // Store the token and user information in localStorage
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify({
          username: response.data.user.username,
          email: response.data.user.email,
          photoURL: response.data.user.photoURL,
        }));
  
        // Navigate to home page or dashboard upon successful login
        navigate('/');
      } else {
        // Handle login error
        setLoginError('Invalid credentials');
      }
    } catch (error) {
      console.error('Error logging in:', error);
      setLoginError('An error occurred. Please try again.');
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      const res = await axios.post('http://localhost:8080/googleLogin', {
        googleToken: credentialResponse.credential,
      });
  
      if (res.data.token) {
        // Store the token and user information in localStorage
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify({
          username: res.data.user.username,
          email: res.data.user.email,
          photoURL: res.data.user.photoURL,
        }));
  
        // Navigate to home page or dashboard upon successful login
        navigate('/');
      } else {
        // Handle login error
        console.error('Google login failed');
      }
    } catch (error) {
      console.error('Error logging in with Google:', error);
    }
  };

  const handleGoogleFailure = () => {
    console.error('Google login failed');
    // Handle login failure, display error message, etc.
  };


  return (
    <div className="flex justify-center items-center h-screen bg-slate-900">
      <div className="w-full max-w-xs">
        <form className="bg-slate-950 shadow-md rounded px-8 pt-6 pb-8 mb-4" onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              Email or Username
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="Email or Username"
              type="Email or Username"
              placeholder="Email or Username"
              value={usernameOrEmail}
              onChange={(e) => setUsernameOrEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              Password
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {loginError && <p className="text-red-500 text-xs italic">{loginError}</p>}
          <div className="flex items-center justify-between">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="submit"
            >
              Sign In
            </button>
            </div>
            <div className="mt-4 text-center">
              <p className="text-gray-600 mb-2">
              Don't have an account?{' '}
              <Link to="/signup" className="text-blue-500 hover:text-blue-700 font-bold">
                  Sign up
              </Link>
              </p>
              <div className="border-t border-gray-300 pt-4">
                <p className="text-gray-600 mb-2 pb-1">or</p>
                <GoogleLogin 
                onSuccess={handleGoogleSuccess} 
                onError={handleGoogleFailure} 
                />
              </div>
            </div>
        </form>

  </div>
</div>
  );
};

export default Login;