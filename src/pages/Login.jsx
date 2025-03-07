import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (token && role) {
      navigate(role === "encoder" ? "/encode-name/set-pcs" : "/get-names");
    }
  }, [navigate]); 

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/login`, {
        username,
        password,
      });

      const { role, token } = response.data;
      localStorage.setItem("token", token);
      localStorage.setItem("role", role);

      if (role === "encoder") {
        navigate("/encode-name/set-pcs"); // Restrict encoder to this route
      } else {
        navigate("/get-names"); // Superadmin and admin route
      }
    } catch (err) {
      setError("Invalid username or password");
      console.error(err);
    }
  };

  return (
    <div className="flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow-md w-[400px]"
      >
        {error && (
          <p className="text-center rounded-sm shadow-lg p-2 text-sm text-white bg-red-500 mb-4">
            {error}
          </p>
        )}
        <div className="mb-4">
          <label className="block mb-2 text-sm font-medium text-red-500">
            Username
          </label>

          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-2 border border-red-500 rounded outline-none text-sm"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2 text-sm font-medium text-red-500">
            Password
          </label>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"} // Toggle between text and password types
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border border-red-500 rounded outline-none text-sm"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)} // Toggle showPassword state
              className="absolute right-2 top-2 text-red-500"
            >
              <i
                className={`fa-regular ${
                  showPassword ? "fa-eye" : "fa-eye-slash"
                }`}
              ></i>
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="w-full p-2 font-semibold text-red-500 rounded"
        >
          Login
        </button>
      </form>
    </div>
  );
}
