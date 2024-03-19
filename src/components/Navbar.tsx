import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { googleLogout } from '@react-oauth/google';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isLoggedIn = localStorage.getItem('token'); // Check if the user is logged in

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const handleSignOut = () => {
    // Remove the token and user information from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    // Perform Google logout
    googleLogout();

    // Redirect to the login page
    navigate('/login');
  };

  return (
    <nav className="bg-slate-950 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <img
                src="https://i.imgur.com/6qoxKwb.jpeg"
                alt="Blitz Scaling"
                className="h-8 w-auto mr-2"
              />
              <span className="text-white font-bold text-xl">Blitz Scaling</span>
            </Link>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link
                to="/"
                className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Home
              </Link>
              <Link
                to="/about"
                className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                About
              </Link>
              <Link
                to="/contact"
                className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Contact
              </Link>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              {isLoggedIn ? (
                  <button
                    onClick={handleSignOut}
                    className="ml-4 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Sign Out
                  </button>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Log In
                    </Link>
                    <Link
                      to="/signup"
                      className="ml-4 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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
                <button
                  onClick={handleSignOut}
                  className="ml-4 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Sign Out
                </button>
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