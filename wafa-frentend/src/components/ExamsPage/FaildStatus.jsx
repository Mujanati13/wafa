import React from "react";

const FaildStatus = ({ error }) => {
  return (
    <div className="max-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="text-red-500 text-6xl mb-4">⚠️</div>
        <p className="text-red-600 text-lg mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Réessayer
        </button>
      </div>
    </div>
  );
};

export default FaildStatus;
