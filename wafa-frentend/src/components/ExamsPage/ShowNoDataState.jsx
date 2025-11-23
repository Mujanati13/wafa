import React from "react";

const ShowNoDataState = () => {
  return (
    <div className="max-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="text-gray-500 text-6xl mb-4">📝</div>
        <p className="text-gray-600 text-lg">
          Aucune question trouvée pour cet examen.
        </p>
      </div>
    </div>
  );
};

export default ShowNoDataState;
