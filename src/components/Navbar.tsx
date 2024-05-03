import React, { useState, useEffect, useRef, useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { googleLogout } from "@react-oauth/google";
import LanguageSelector from "./LanguageSelector";
import { useTranslation } from "react-i18next";
import { TFunction } from "i18next";
import { UserContext } from "./UserContext";

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isLoggedIn = localStorage.getItem("token");
  const menuRef = useRef<HTMLDivElement>(null);
  const languageMenuRef = useRef<HTMLDivElement>(null);
  const { user } = useContext(UserContext);

  const { t }: { t: TFunction } = useTranslation();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
    setIsUserMenuOpen(false);
  };

  const closeMenu = () => {
    setIsOpen(false);
    setIsUserMenuOpen(false);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
    if (isUserMenuOpen) {
      setIsOpen(false);
    }
  };

  const handleSignOut = () => {
    // Remove the token and user information from localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Perform Google logout
    googleLogout();

    // Redirect to the login page
    navigate("/login");

    // Close the user menu and mobile menu
    setIsUserMenuOpen(false);
    setIsOpen(false);
  };

  const handleClickOutside = (event: MouseEvent) => {
    const menuButton = document.querySelector(".md\\:hidden button");
    if (
      menuRef.current &&
      !menuRef.current.contains(event.target as Node) &&
      languageMenuRef.current &&
      !languageMenuRef.current.contains(event.target as Node) &&
      !menuButton?.contains(event.target as Node)
    ) {
      setIsUserMenuOpen(false);
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const getUserPhoto = () => {
    return user?.photoURL || null;
  };

  const getUserInitial = () => {
    return user?.username?.charAt(0).toUpperCase() || "";
  };

  return (
    <nav className="bg-slate-950 shadow-md fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <img
                src="https://i.imgur.com/3qH4MPc.png"
                alt="Blitz Scaling"
                className="h-8 w-auto mr-2"
              />
              <span
                className="text-white font-bold text-xl"
                style={{ fontFamily: "Orbitron, sans-serif" }}
              >
                Blitz
              </span>
            </Link>
          </div>
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              <div ref={languageMenuRef} className="relative z-50">
                <LanguageSelector />
              </div>
              {isLoggedIn ? (
                <div className="relative z-50" ref={menuRef}>
                  <Link
                    to="/Profile"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      setIsOpen(false);
                    }}
                  >
                    <button className="flex items-center focus:outline-none">
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
                  </Link>
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 z-50">
                      <Link
                        to="/Profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          setIsOpen(false);
                        }}
                      >
                        {t("navbar.profile")}
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                      >
                        {t("navbar.signout")}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                    style={{ fontFamily: "Orbitron, sans-serif" }}
                  >
                    {t("navbar.login")}
                  </Link>
                  <Link
                    to="/signup"
                    className="ml-4 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    style={{ fontFamily: "Orbitron, sans-serif" }}
                  >
                    {t("navbar.signup")}
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
                className={`${isOpen ? "hidden" : "block"} h-6 w-6`}
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
                className={`${isOpen ? "block" : "hidden"} h-6 w-6`}
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
      <div className={`${isOpen ? "block" : "hidden"} md:hidden`} ref={menuRef}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <Link
            to="/"
            className={`${
              location.pathname === "/"
                ? "text-white bg-gray-900"
                : "text-gray-300 hover:text-white"
            } block px-3 py-2 rounded-md text-base font-medium`}
            onClick={closeMenu}
          >
            Home
          </Link>
          <Link
            to="/Blitz"
            className={`${
              location.pathname === "/Blitz"
                ? "text-white bg-gray-900"
                : "text-gray-300 hover:text-white"
            } block px-3 py-2 rounded-md text-base font-medium`}
            onClick={closeMenu}
          >
            Blitz
          </Link>
          <Link
            to="/UserHome"
            className={`${
              location.pathname === "/UserHome"
                ? "text-white bg-gray-900"
                : "text-gray-300 hover:text-white"
            } block px-3 py-2 rounded-md text-base font-medium`}
            onClick={closeMenu}
          >
            UserHome
          </Link>
        </div>
        <div className="pt-4 pb-3 border-t border-gray-700">
          <div className="flex items-center px-5">
            <div ref={languageMenuRef} className="relative z-50">
              <LanguageSelector />
            </div>
            {isLoggedIn ? (
              <div className="flex items-center">
                <Link to="/Profile" onClick={closeMenu}>
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
                </Link>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
                  onClick={closeMenu}
                >
                  {t("navbar.login")}
                </Link>
                <Link
                  to="/signup"
                  className="ml-4 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  onClick={closeMenu}
                >
                  {t("navbar.signup")}
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
