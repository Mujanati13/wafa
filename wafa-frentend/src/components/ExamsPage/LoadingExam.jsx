import React from "react";
import Spinner from "@/components/ui/Spinner";

const LoadingExam = () => {
  return (
    <div className="h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center space-y-3 sm:space-y-4">
        <div className="flex justify-center">
          <Spinner color="black" />
        </div>
        <p className="text-sm sm:text-base text-gray-600">Chargement de l'examen...</p>
      </div>
    </div>
  );
};

export default LoadingExam;
