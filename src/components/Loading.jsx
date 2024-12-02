import React from "react";

export default function Loading({ message = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center h-screen w-full bg-gray-100 z-50">
      {/* Spinner */}
      <div className="animate-spin rounded-full h-16 w-16 border-y-4 border-red-500 border-solid"></div>
      {/* Message */}
      <p className="text-gray-700 text-lg font-medium mt-6 animate-pulse">
        {message}
      </p>
    </div>
  );
}
