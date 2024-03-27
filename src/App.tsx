import React, { useRef } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Home from './pages/Home';
import About from './pages/About';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Navbar from './components/Navbar';
import Profile from './pages/Profile';
import { Parallax, ParallaxLayer, IParallax } from '@react-spring/parallax';

const App: React.FC = () => {
  const parallax = useRef<IParallax>(null!);

  return (
    <GoogleOAuthProvider clientId="724740010868-5ig790ee5btbdtgfmifhu8dqi8gmjvj0.apps.googleusercontent.com">
      <Router>
        <div className="app-container">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/Login" element={<Login />} />
            <Route path="/Signup" element={<Signup />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </div>
      </Router>
    </GoogleOAuthProvider>
  );
};

export default App;

