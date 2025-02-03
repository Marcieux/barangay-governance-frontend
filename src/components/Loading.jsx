import React from "react";

export default function Loading({ message = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center w-full z-50">
      {/* Spinner */}
      <div className="animate-spin rounded-full h-16 w-16 border-y-4 border-white border-solid"></div>
      {/* Message */}
      <p className="text-white text-lg font-medium mt-6 animate-pulse">
        {message}
      </p>
    </div>
  );
}
