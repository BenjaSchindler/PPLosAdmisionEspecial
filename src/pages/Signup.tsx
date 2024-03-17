import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin, GoogleLoginResponse, GoogleLoginResponseOffline } from 'react-google-login';

const SignUp: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match');
    } else {
      setPasswordError('');
    }
  }, [password, confirmPassword]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (passwordError) {
      return;
    }
    // Perform sign-up logic here, e.g., send request to server, validate credentials, etc.
    console.log('Sign-up submitted:', email, password, confirmPassword);
    // Navigate to home page or dashboard upon successful sign-up
    navigate('/');
  };

  const handleGoogleSuccess = (response: GoogleLoginResponse | GoogleLoginResponseOffline) => {
    if ('profileObj' in response) {
      // Successful Google sign-up
      console.log('Google sign-up success:', response.profileObj);
      // Navigate to home page or dashboard upon successful sign-up
      navigate('/');
    }
  };

  const handleGoogleFailure = (error: any) => {
    console.error('Google sign-up error:', error);
  };

  return (
    <div className="flex justify-center items-center h-screen bg-slate-900">
      <div className="w-full max-w-xs">
        <form className="bg-slate-950 shadow-md rounded px-8 pt-6 pb-8 mb-4" onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              Email
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
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="confirmPassword">
              Confirm Password
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
            {passwordError && <p className="text-red-500 text-xs italic">{passwordError}</p>}
          </div>
          <div className="flex items-center justify-between">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="submit"
            >
              Sign Up
            </button>
          </div>
          <div className="mt-4 text-center">
            <p className="text-gray-600 mb-2">
                    Already have an account?{' '}
                <Link to="/login" className="text-blue-500 hover:text-blue-700 font-bold">
                    Log in
                </Link>
            </p>
            <div className="border-t border-gray-300 pt-4">
              <p className="text-gray-600 mb-2">or</p>
              <GoogleLogin
                clientId="YOUR_ACTUAL_GOOGLE_CLIENT_ID"
                buttonText="Sign up with Google"
                onSuccess={handleGoogleSuccess}
                onFailure={handleGoogleFailure}
                cookiePolicy={'single_host_origin'}
                className="w-full"
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignUp;