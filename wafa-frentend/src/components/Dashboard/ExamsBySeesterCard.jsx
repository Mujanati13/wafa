import React from "react";
import { FaPlay } from "react-icons/fa";

const ExamsBySeesterCard = ({ exam, handleStartExam }) => {
  return (
    <div
      key={exam.id}
      className="bg-gray-800/30 rounded-xl p-6 hover:bg-gray-800/50 transition-colors duration-300 "
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 bg-opacity-20 mr-4">
            <img src={ exam.img } alt="" />
            
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white">{exam.subject}</h3>
            <div className="flex items-center space-x-4 mt-1">
              <span className="text-gray-400 text-sm">
                {exam.questions} questions
              </span>
              <span className="text-gray-400 text-sm">{exam.duration}</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          {exam.lastScore && (
            <div className="text-green-400 font-semibold mb-2">
              Dernier score: {exam.lastScore}
            </div>
          )}
          <button
            disabled={!exam.available}
            onClick={() => exam.available && handleStartExam(exam.id)}
            className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
              exam.available
                ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
                : "bg-gray-600 text-gray-400 cursor-not-allowed"
            }`}
          >
            {exam.available ? (
              <span className="flex items-center">
                <FaPlay className="mr-2" />
                Commencer l'examen
              </span>
            ) : (
              "Indisponible"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExamsBySeesterCard;
