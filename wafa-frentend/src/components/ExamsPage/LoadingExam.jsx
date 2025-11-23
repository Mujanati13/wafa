import React from "react";
import Spinner from "@/components/ui/Spinner";

const LoadingExam = () => {
  return (
    <div className="h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <Spinner color="black" />
        <p className="text-gray-600">Chargement de l'examen...</p>
      </div>
    </div>
  );
};

export default LoadingExam;
