import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { googleLogout } from '@react-oauth/google';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isLoggedIn = localStorage.getItem('token'); // Check if the user is logged in
  const userMenuRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const handleSignOut = () => {
    // Remove the token and user information from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    // Perform Google logout
    googleLogout();

    // Redirect to the login page
    navigate('/login');

    // Close the user menu
    setIsUserMenuOpen(false);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      userMenuRef.current &&
      !userMenuRef.current.contains(event.target as Node)
    ) {
      setIsUserMenuOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const getUserPhoto = () => {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const parsedUser = JSON.parse(user);
        return parsedUser.photoURL;
      } catch (error) {
        console.error('Error parsing user data:', error);
        return null;
      }
    }
    return null;
  };

  const getUserInitial = () => {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const parsedUser = JSON.parse(user);
        return parsedUser.username.charAt(0).toUpperCase();
      } catch (error) {
        console.error('Error parsing user data:', error);
        return '';
      }
    }
    return '';
  };

  return (
    <nav className="bg-slate-950 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <img
                src="https://i.imgur.com/3qH4MPc.png"
                alt="Blitz Scaling"
                className="h-8 w-auto mr-2"
              />
              <span className="text-white font-bold text-xl" style={{ fontFamily: 'Orbitron, sans-serif' }}>Blitz Scaling.AI</span>

            </Link>
          </div>
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
            {isLoggedIn ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={toggleUserMenu}
                    className="flex items-center focus:outline-none"
                  >
                    {getUserPhoto() ? (
                      <img
                        className="h-8 w-8 rounded-full"
                        src={getUserPhoto()}
                        alt="User"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-gray-400 flex items-center justify-center">
                        <span className="text-xl text-white font-bold uppercase">
                          {getUserInitial()}
                        </span>
                      </div>
                    )}
                    </button>
                    {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5">
                      <Link
                        to="/Profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        Profile
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                  </div>
                ) : (
                  <>
                    <Link
                        to="/login"
                        className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                        style={{ fontFamily: 'Orbitron, sans-serif' }}
                      >
                        Log In
                      </Link>
                      <Link
                        to="/signup"
                        className="ml-4 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        style={{ fontFamily: 'Orbitron, sans-serif' }}
                      >
                        Sign Up
                      </Link>

                  </>
                )}
            </div>
          </div>
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={toggleMenu}
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:bg-gray-700 focus:text-white"
            >
              <svg
                className={`${isOpen ? 'hidden' : 'block'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              <svg
                className={`${isOpen ? 'block' : 'hidden'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`${isOpen ? 'block' : 'hidden'} md:hidden`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <Link
            to="/"
            className={`${
              location.pathname === '/'
                ? 'text-white bg-gray-900'
                : 'text-gray-300 hover:text-white'
            } block px-3 py-2 rounded-md text-base font-medium`}
            onClick={closeMenu}
          >
            Home
          </Link>
          <Link
            to="/about"
            className={`${
              location.pathname === '/about'
                ? 'text-white bg-gray-900'
                : 'text-gray-300 hover:text-white'
            } block px-3 py-2 rounded-md text-base font-medium`}
            onClick={closeMenu}
          >
            About
          </Link>
          <Link
            to="/contact"
            className={`${
              location.pathname === '/contact'
                ? 'text-white bg-gray-900'
                : 'text-gray-300 hover:text-white'
            } block px-3 py-2 rounded-md text-base font-medium`}
            onClick={closeMenu}
          >
            Contact
          </Link>
        </div>
        <div className="pt-4 pb-3 border-t border-gray-700">
          <div className="flex items-center px-5">
          {isLoggedIn ? (
              <>
                <div className="flex items-center">
                  {getUserPhoto() ? (
                    <img
                      className="h-10 w-10 rounded-full"
                      src={getUserPhoto()}
                      alt="User"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-gray-400 flex items-center justify-center">
                      <span className="text-2xl text-white font-bold uppercase">
                        {getUserInitial()}
                      </span>
                    </div>
                  )}
                  <div className="ml-3">
                    <Link
                      to="/Profile"
                      className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
                      onClick={closeMenu}
                    >
                      Profile
                    </Link>
                  </div>
                </div>
                <button
                  onClick={handleSignOut}
                  className="ml-4 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Sign Out
                </button>
              </>
            ) : (
                <>
                  <Link
                    to="/login"
                    className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
                    onClick={closeMenu}
                  >
                    Log In
                  </Link>
                  <Link
                    to="/signup"
                    className="ml-4 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    onClick={closeMenu}
                  >
                    Sign Up
                  </Link>
                </>
              )}
          </div>
        </div>
      </div>
    </nav>
  );
};
export default Navbar;