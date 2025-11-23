import { motion } from "framer-motion";
import { FaCheckCircle, FaTimesCircle, FaCircle } from "react-icons/fa";

const QuestionProgressBar = ({ totalQuestions, currentQuestion, selectedAnswers }) => {
  const getQuestionStatus = (index) => {
    if (selectedAnswers[index] !== undefined) {
      // Question answered - will determine if correct/incorrect after submission
      return "answered";
    }
    if (index === currentQuestion) {
      return "current";
    }
    return "unanswered";
  };

  const answeredCount = Object.keys(selectedAnswers).length;
  const percentage = ((answeredCount / totalQuestions) * 100).toFixed(0);

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700">
          Progression de l'examen
        </h3>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <FaCheckCircle className="text-green-500" />
            <span className="text-gray-600">Répondu: {answeredCount}</span>
          </div>
          <div className="flex items-center gap-1">
            <FaCircle className="text-gray-300" size={10} />
            <span className="text-gray-600">
              Restant: {totalQuestions - answeredCount}
            </span>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative w-full bg-gray-200 rounded-full h-3 mb-3">
        <motion.div
          className="absolute h-full bg-gradient-to-r from-blue-500 to-teal-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5 }}
        >
          <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full" />
        </motion.div>
      </div>

      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-600">
          Question {currentQuestion + 1} / {totalQuestions}
        </span>
        <span className="font-bold text-blue-600">{percentage}% complété</span>
      </div>

      {/* Question dots indicator */}
      <div className="flex flex-wrap gap-1 mt-3 pt-3 border-t border-gray-200">
        {Array.from({ length: Math.min(totalQuestions, 50) }).map((_, index) => {
          const status = getQuestionStatus(index);
          return (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-all ${
                status === "answered"
                  ? "bg-blue-500 scale-110"
                  : status === "current"
                  ? "bg-teal-500 scale-125 ring-2 ring-teal-200"
                  : "bg-gray-300"
              }`}
              title={`Question ${index + 1}`}
            />
          );
        })}
        {totalQuestions > 50 && (
          <span className="text-xs text-gray-500 ml-2">
            +{totalQuestions - 50} questions
          </span>
        )}
      </div>
    </div>
  );
};

export default QuestionProgressBar;
