import React from "react";

export function AccessDeniedModal({ onClose }) {
  return (
    <div className="fixed inset-0 bg-gray-950 bg-opacity-60 flex justify-center items-center transition-opacity duration-300">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96 max-w-sm text-center transform transition-transform duration-300 scale-95 hover:scale-100">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Access Denied</h2>
        <p className="text-gray-600 mb-4">
          You don't have permission to access this page.
        </p>
        <button
          onClick={onClose}
          className="bg-red-500 text-white px-6 py-2 rounded-lg shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-700 focus:ring-opacity-50 transition duration-200"
        >
          Close
        </button>
      </div>
    </div>
  );
}
