import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { TFunction } from "i18next";
import { useUser } from '../components/UserContext';

const Login: React.FC = () => {
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const navigate = useNavigate();
  const { setUser } = useUser();

  const { t }: { t: TFunction } = useTranslation();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:8080/Login", {
        usernameOrEmail,
        password,
      });
      if (response.data.token) {
        // Update the user state in the UserContext with the received user data
        setUser(response.data.user);
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        navigate("/");
      } else {
        setLoginError("Invalid credentials");
      }
    } catch (error) {
      console.error("Error logging in:", error);
      setLoginError("An error occurred. Please try again.");
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      const res = await axios.post("http://localhost:8080/googleLogin", {
        googleToken: credentialResponse.credential,
      });
      if (res.data.token) {
        setUser(res.data.user);
        // Store the token and user information in localStorage
        localStorage.setItem("token", res.data.token);
        localStorage.setItem(
          "user",
          JSON.stringify({
            _id: res.data.user._id, // Include the user ID
            username: res.data.user.username,
            email: res.data.user.email,
            photoURL: res.data.user.photoURL,
          })
        );
        // Navigate to home page or dashboard upon successful login
        navigate("/");
      } else {
        // Handle login error
        console.error("Google login failed");
      }
    } catch (error) {
      console.error("Error logging in with Google:", error);
    }
  };

  const handleGoogleFailure = () => {
    console.error("Google login failed");
    // Handle login failure, display error message, etc.
  };

  return (
    <div
      className="flex justify-center items-center h-screen"
      style={{
        backgroundImage: "url(https://i.imgur.com/ZNV81El.jpg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="w-full sm:max-w-sm md:max-w-md lg:max-w-lg">
        <form
          className="bg-slate-950 shadow-md rounded px-8 pt-6 pb-8 mb-4"
          onSubmit={handleSubmit}
        >
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2 font-orbitron"
              htmlFor="email"
            >
              {t("login.emailLabel")}
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 sm:text-base text-gray-700 leading-tight focus:outline-none focus:shadow-outline font-orbitron"
              id="Email or Username"
              type="Email or Username"
              placeholder={t("login.emailLabel")}
              value={usernameOrEmail}
              onChange={(e) => setUsernameOrEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <label
              className="block text-gray-700 text-sm font-bold mb-2 font-orbitron"
              htmlFor="password"
            >
              {t("login.passwordLabel")}
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 sm:text-base text-gray-700 leading-tight focus:outline-none focus:shadow-outline font-orbitron"
              id="password"
              type="password"
              placeholder={t("login.passwordLabel")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {loginError && (
            <p className="text-red-500 text-xs italic">{loginError}</p>
          )}
          <div className="flex items-center justify-between">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 sm:text-base sm:py-3 sm:px-6 rounded focus:outline-none focus:shadow-outline font-orbitron"
              type="submit"
            >
              {t("login.submitButton")}
            </button>
          </div>
          <div className="mt-4 text-center">
            <p className="text-gray-600 mb-2 font-orbitron">
              {t("login.signupText")}{" "}
              <Link
                to="/signup"
                className="text-blue-500 hover:text-blue-700 font-bold font-orbitron" 
              >
                {t("login.signupLink")}
              </Link>
            </p>

            <div className="border-t border-gray-300 pt-4">
              <p className="text-gray-600 mb-2 pb-1 font-orbitron">{t("login.or")}</p>
              <div className="flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleFailure}
                />
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
