
import React from "react";

const ExplicationModel = ({ question }) => {
  return (
    <div className="mt-8 p-4 bg-white border border-gray-200 rounded-2xl shadow-sm max-w-2xl mx-auto">
      {/* Main Tabs */}
      <div className="flex border-b border-gray-200 mb-4">
        <button className="px-4 py-1 font-medium border-b-2 border-blue-600 text-blue-700 bg-white rounded-t-md focus:outline-none">explication AI</button>
        <button className="px-4 py-1 font-medium text-gray-600 ml-2 bg-white rounded-t-md focus:outline-none">vous explications</button>
      </div>

      {/* Sub-tabs (Pills) */}
      <div className="flex items-center space-x-2 mb-4">
        <button className="px-4 py-1 rounded-full bg-blue-100 text-blue-700 font-medium border border-blue-300">explications 1</button>
        <button className="px-4 py-1 rounded-full bg-gray-100 text-gray-700 font-medium border border-gray-300">explication 2</button>
        <button className="px-4 py-1 rounded-full bg-gray-50 text-gray-400 font-medium border border-gray-200 cursor-not-allowed flex items-center" disabled>
          <span className="text-lg mr-1">+</span>ajouter
        </button>
      </div>

      {/* Images Row */}
      <div className="flex space-x-8 mb-2 pl-1">
        <span className="text-gray-500">image1</span>
        <span className="text-gray-500">image 2</span>
      </div>

      {/* Explanation Text Area */}
      <div className="border border-gray-300 rounded-lg bg-white min-h-[120px] p-4 text-gray-800 text-base whitespace-pre-line">
        {question.explanation || ""}
      </div>

      {/* Correct Answers (if multipleChoice) */}
      {question.multipleChoice && (
        <div className="mt-4 text-blue-700 text-sm">
          <strong>Réponses correctes:</strong>{" "}
          {question.correctAnswers.join(", ")}
        </div>
      )}
    </div>
  );
};

export default ExplicationModel;
