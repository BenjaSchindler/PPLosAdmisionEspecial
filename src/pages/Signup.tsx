import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import axios, { AxiosError } from "axios";
import { useTranslation } from "react-i18next";
import { TFunction } from "i18next";
import { useUser } from '../components/UserContext';

interface ErrorResponse {
  error: string;
}

const SignUp: React.FC = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [registrationError, setRegistrationError] = useState("");
  const navigate = useNavigate();
  const { setUser } = useUser();

  const { t }: { t: TFunction } = useTranslation();

  useEffect(() => {
    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match");
    } else {
      setPasswordError("");
    }
  }, [password, confirmPassword]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await axios.post("http://localhost:8080/Signup", {
        username,
        email,
        password,
      });

      if (response.status === 201) {
        const { token, user } = response.data;
        setUser(user);
        // Store the token and user information in localStorage
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));

        // Navigate to home page or dashboard upon successful signup
        navigate("/");
      } else {
        // Handle registration error
        setRegistrationError("Error registering user");
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ErrorResponse>;
        if (
          axiosError.response &&
          axiosError.response.data.error === "User already exists"
        ) {
          setRegistrationError("User already exists");
        } else {
          console.error("Error registering user", axiosError);
          setRegistrationError("An error occurred. Please try again.");
        }
      } else {
        console.error("Error registering user", error);
        setRegistrationError("An error occurred. Please try again.");
      }
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      const res = await axios.post("http://localhost:8080/googleLogin", {
        googleToken: credentialResponse.credential,
      });
      if (res.data.token) {
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
              htmlFor="username"
            >
              {t("signup.usernameLabel")}
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 sm:text-base text-gray-700 leading-tight focus:outline-none focus:shadow-outline font-orbitron"
              id="username"
              type="text"
              placeholder={t("signup.usernameLabel")}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2 font-orbitron"
              htmlFor="email"
            >
              {t("signup.emailLabel")}
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 sm:text-base text-gray-700 leading-tight focus:outline-none focus:shadow-outline font-orbitron"
              id="email"
              type="email"
              placeholder={t("signup.emailLabel")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2 font-orbitron"
              htmlFor="password"
            >
              {t("signup.passwordLabel")}
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 sm:text-base text-gray-700 leading-tight focus:outline-none focus:shadow-outline font-orbitron"
              id="password"
              type="password"
              placeholder={t("signup.passwordLabel")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <label
              className="block text-gray-700 text-sm font-bold mb-2 font-orbitron"
              htmlFor="confirmPassword"
            >
              {t("signup.confirmPasswordLabel")}
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 sm:text-base text-gray-700 leading-tight focus:outline-none focus:shadow-outline font-orbitron"
              id="confirmPassword"
              type="password"
              placeholder={t("signup.confirmPasswordLabel")}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            {registrationError && (
              <p className="text-red-500 text-xs italic">{registrationError}</p>
            )}
          </div>
          <div className="flex items-center justify-between">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 sm:text-base sm:py-3 sm:px-6 rounded focus:outline-none focus:shadow-outline font-orbitron"
              type="submit"
            >
              {t("signup.submitButton")}
            </button>
          </div>
          <div className="mt-4 text-center">
            <p className="text-gray-600 mb-2 font-orbitron">
              {t("signup.loginText")}{" "}
              <Link
                to="/login"
                className="text-blue-500 hover:text-blue-700 font-bold font-orbitron"
              >
                {t("signup.loginLink")}
              </Link>
            </p>
            <div className="border-t border-gray-300 pt-4">
              <p className="text-gray-600 mb-2 pb-1">{t("login.or")}</p>
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

export default SignUp;
