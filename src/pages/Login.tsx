import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin, GoogleLoginResponse, GoogleLoginResponseOffline } from 'react-google-login';


const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Perform login logic here, e.g., send request to server, validate credentials, etc.
    console.log('Login submitted:', email, password);
    // Navigate to home page or dashboard upon successful login
    navigate('/');
  };
  const handleGoogleSuccess = (response: GoogleLoginResponse | GoogleLoginResponseOffline) => {
    if ('profileObj' in response) {
      // Successful Google login
      console.log('Google login success:', response.profileObj);
      // Navigate to home page or dashboard upon successful login
      navigate('/');
    }
  };
  const handleGoogleFailure = (error: any) => {
    console.error('Google login error:', error);
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
          <div className="flex items-center justify-between">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="submit"
            >
              Sign In
            </button>
            </div>
            <div className="mt-4 text-center">
                    <p className="text-gray-600 mb-2">Don't have an account? Sign up</p>
                    <div className="border-t border-gray-300 pt-4">
                        <p className="text-gray-600 mb-2 pb-1">or</p>
                        <GoogleLogin
                            clientId="YOUR_GOOGLE_CLIENT_ID"
                            buttonText="Continue with Google"
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

export default Login;