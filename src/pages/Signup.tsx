import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import axios, { AxiosError } from 'axios';
import { FormattedMessage } from 'react-intl';

interface ErrorResponse {
  error: string;
}

const SignUp: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [registrationError, setRegistrationError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match');
    } else {
      setPasswordError('');
    }
  }, [password, confirmPassword]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  
    try {
      const response = await axios.post('http://localhost:8080/Signup', {
        username,
        email,
        password,
      });
  
      if (response.status === 201) {
        const { token, user } = response.data;
  
        // Store the token and user information in localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify({
          username: response.data.user.username,
          email: response.data.user.email,
          photoURL: response.data.user.photoURL,
        }));
  
        // Navigate to home page or dashboard upon successful signup
        navigate('/');
      } else {
        // Handle registration error
        setRegistrationError('Error registering user');
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ErrorResponse>;
        if (axiosError.response && axiosError.response.data.error === 'User already exists') {
          setRegistrationError('User already exists');
        } else {
          console.error('Error registering user', axiosError);
          setRegistrationError('An error occurred. Please try again.');
        }
      } else {
        console.error('Error registering user', error);
        setRegistrationError('An error occurred. Please try again.');
      }
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
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
              <FormattedMessage id="signup.usernameLabel" />
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="username"
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              <FormattedMessage id="signup.emailLabel" />
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="email"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              <FormattedMessage id="signup.passwordLabel" />
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
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="confirmPassword">
              <FormattedMessage id="signup.confirmPasswordLabel" />
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="confirmPassword"
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            {registrationError && <p className="text-red-500 text-xs italic">{registrationError}</p>}
          </div>
          <div className="flex items-center justify-between">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="submit"
            >
              <FormattedMessage id="signup.submitButton" />
            </button>
          </div>
          <div className="mt-4 text-center">
            <p className="text-gray-600 mb-2">
              <FormattedMessage id="signup.loginText" />{' '}
              <Link to="/login" className="text-blue-500 hover:text-blue-700 font-bold">
                <FormattedMessage id="signup.loginLink" />
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

export default SignUp;