import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Home from './pages/Home';
import About from './pages/About';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Navbar from './components/Navbar';
import Profile from './pages/Profile';
import './App.css'; // Importa el archivo de estilos CSS si es necesario
import Blitz from './pages/Blitz';
import UserHome from './pages/UserHome';

const App: React.FC = () => {
  const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID || '';
  console.log(googleClientId);

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <Router>
        <div className="app-container">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/Login" element={<Login />} />
            <Route path="/Signup" element={<Signup />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/Blitz" element={<Blitz />} />
            <Route path="/UserHome" element={<UserHome />} />
          </Routes>
        </div>
      </Router>
    </GoogleOAuthProvider>
  );
};

export default App;
