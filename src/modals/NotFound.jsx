import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="fixed inset-0 bg-gray-950 bg-opacity-60 flex justify-center items-center">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96 max-w-sm text-center transform transition-transform duration-300 scale-95 hover:scale-100">
        <h1 className="text-2xl font-semibold text-red-600 mb-6">Page Not Found</h1>
        <p className="text-gray-700 mb-6">
          Sorry, the page you are looking for does not exist.
        </p>
        <Link
          to="/login"
          className="bg-red-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition duration-200"
        >
          Go Back Home
        </Link>
      </div>
    </div>
  );
}
