import React, { useState } from "react";

export default function Login() {
  const [username, setUsername] = useState("");

  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    // Handle login logic here

    console.log("Logged in:", { username, password });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-red-500">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow-md w-[400px]"
      >
        <h2 className="mb-4 text-xl font-bold text-center">Login</h2>

        <div className="mb-4">
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Username
          </label>

          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded outline-none"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Password
          </label>

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded outline-none"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full p-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Login
        </button>
      </form>
    </div>
  );
}
