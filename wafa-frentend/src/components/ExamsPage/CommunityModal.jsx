import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaThumbsUp, FaThumbsDown } from "react-icons/fa";
import { FiUsers } from "react-icons/fi";

const CommunityModal = ({ isOpen, onClose, questionId, correctAnswer }) => {
  const [userVote, setUserVote] = useState(null);
  const [stats, setStats] = useState({
    totalVotes: 0,
    optionVotes: { A: 0, B: 0, C: 0, D: 0, E: 0 },
  });

  useEffect(() => {
    if (isOpen) {
      // Fetch community stats (placeholder)
      // In real implementation, fetch from backend
      setStats({
        totalVotes: 247,
        optionVotes: {
          A: 45,
          B: 12,
          C: 178,
          D: 8,
          E: 4,
        },
      });
    }
  }, [isOpen]);

  const handleVote = (option) => {
    setUserVote(option);
    // Send vote to backend
  };

  const getPercentage = (option) => {
    if (stats.totalVotes === 0) return 0;
    return ((stats.optionVotes[option] / stats.totalVotes) * 100).toFixed(1);
  };

  const options = ["A", "B", "C", "D", "E"];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                  <FiUsers className="text-teal-600" size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">
                    Vote de la communauté
                  </h3>
                  <p className="text-sm text-gray-500">
                    {stats.totalVotes} votes
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FaTimes size={20} />
              </button>
            </div>

            <div className="space-y-3">
              {options.map((option) => {
                const percentage = getPercentage(option);
                const isCorrect = correctAnswer?.includes(option);
                const isUserVote = userVote === option;

                return (
                  <div
                    key={option}
                    className={`relative overflow-hidden rounded-lg border-2 transition-all ${
                      isCorrect
                        ? "border-green-500 bg-green-50"
                        : isUserVote
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 bg-white"
                    }`}
                  >
                    {/* Progress bar background */}
                    <div
                      className={`absolute inset-0 transition-all duration-500 ${
                        isCorrect
                          ? "bg-green-200/50"
                          : "bg-blue-200/30"
                      }`}
                      style={{ width: `${percentage}%` }}
                    />

                    <div className="relative flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                            isCorrect
                              ? "bg-green-500 text-white"
                              : isUserVote
                              ? "bg-blue-500 text-white"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {option}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">
                            Option {option}
                          </p>
                          <p className="text-xs text-gray-500">
                            {stats.optionVotes[option]} votes
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-gray-700">
                          {percentage}%
                        </span>
                        {isCorrect && (
                          <div className="bg-green-500 text-white px-2 py-1 rounded text-xs font-semibold">
                            Correct
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 text-center">
                💡 <strong>{percentage}%</strong> de la communauté a choisi la
                bonne réponse
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CommunityModal;
