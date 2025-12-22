import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Users, Lock, Check } from "lucide-react";

const CommunityModal = ({ isOpen, onClose, questionId, questionOptions, correctAnswer, userLevel = 0, requiredLevel = 20 }) => {
  const [userVote, setUserVote] = useState(null);
  const [stats, setStats] = useState({
    totalVotes: 0,
    optionVotes: {},
  });

  const canVote = userLevel >= requiredLevel;

  useEffect(() => {
    if (isOpen && questionOptions) {
      // Generate mock stats based on number of options
      const mockVotes = {};
      let total = 0;
      questionOptions.forEach((opt, index) => {
        const letter = String.fromCharCode(65 + index);
        const votes = opt.isCorrect ? Math.floor(Math.random() * 100) + 100 : Math.floor(Math.random() * 50);
        mockVotes[letter] = votes;
        total += votes;
      });

      setStats({
        totalVotes: total,
        optionVotes: mockVotes,
      });
    }
  }, [isOpen, questionOptions]);

  const handleVote = (option) => {
    if (!canVote) return;
    setUserVote(option);
    // Send vote to backend
  };

  const getPercentage = (option) => {
    if (stats.totalVotes === 0) return 0;
    return ((stats.optionVotes[option] / stats.totalVotes) * 100).toFixed(1);
  };

  const correctPercentage = () => {
    if (!questionOptions || stats.totalVotes === 0) return 0;
    let correctVotes = 0;
    questionOptions.forEach((opt, index) => {
      if (opt.isCorrect) {
        const letter = String.fromCharCode(65 + index);
        correctVotes += stats.optionVotes[letter] || 0;
      }
    });
    return ((correctVotes / stats.totalVotes) * 100).toFixed(1);
  };

  const options = questionOptions ? questionOptions.map((_, i) => String.fromCharCode(65 + i)) : [];

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
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-teal-500 to-teal-600 p-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">
                      Vote de la communauté
                    </h3>
                    <p className="text-sm text-white/80">
                      {stats.totalVotes} votes
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="text-white/80 hover:text-white transition-colors p-1"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Level requirement warning */}
              {!canVote && (
                <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-3">
                  <Lock className="h-5 w-5 text-amber-500 shrink-0" />
                  <p className="text-sm text-amber-700">
                    Vous devez atteindre <strong>{requiredLevel}%</strong> de progression dans ce module pour voter.
                    Niveau actuel: <strong>{userLevel}%</strong>
                  </p>
                </div>
              )}

              {/* Options with vote stats */}
              <div className="space-y-3">
                {options.map((option, index) => {
                  const percentage = getPercentage(option);
                  const isCorrect = questionOptions[index]?.isCorrect;
                  const isUserVote = userVote === option;

                  return (
                    <button
                      key={option}
                      onClick={() => handleVote(option)}
                      disabled={!canVote}
                      className={`relative w-full overflow-hidden rounded-xl border-2 transition-all ${isCorrect
                          ? "border-emerald-500 bg-emerald-50"
                          : isUserVote
                            ? "border-teal-500 bg-teal-50"
                            : "border-gray-200 bg-white hover:border-gray-300"
                        } ${!canVote ? "cursor-not-allowed opacity-75" : "cursor-pointer"}`}
                    >
                      {/* Progress bar background */}
                      <div
                        className={`absolute inset-0 transition-all duration-500 ${isCorrect
                            ? "bg-emerald-200/50"
                            : "bg-teal-200/30"
                          }`}
                        style={{ width: `${percentage}%` }}
                      />

                      <div className="relative flex items-center justify-between p-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${isCorrect
                                ? "bg-emerald-500 text-white"
                                : isUserVote
                                  ? "bg-teal-500 text-white"
                                  : "bg-gray-100 text-gray-700"
                              }`}
                          >
                            {isCorrect ? <Check className="h-4 w-4" /> : option}
                          </div>
                          <div className="text-left">
                            <p className="font-medium text-gray-800 text-sm">
                              Option {option}
                            </p>
                            <p className="text-xs text-gray-500">
                              {stats.optionVotes[option] || 0} votes
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-gray-700">
                            {percentage}%
                          </span>
                          {isCorrect && (
                            <div className="bg-emerald-500 text-white px-2 py-0.5 rounded text-xs font-semibold">
                              Correct
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Summary */}
              <div className="mt-5 p-4 bg-gradient-to-r from-teal-50 to-emerald-50 rounded-xl border border-teal-100">
                <p className="text-sm text-gray-700 text-center">
                  💡 <strong>{correctPercentage()}%</strong> de la communauté a choisi la bonne réponse
                </p>
              </div>

              {/* User vote info */}
              {userVote && (
                <div className="mt-3 p-3 bg-teal-50 border border-teal-200 rounded-lg text-center">
                  <p className="text-sm text-teal-700">
                    Tu as voté pour <strong className="text-teal-800">{userVote}</strong> comme réponse juste
                  </p>
                </div>
              )}

              {/* Vote multiplier info */}
              <div className="mt-4 space-y-2">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-700">
                    💎 Si tu veux ajouter à votre vote une forte valeur (comme si 20 personnes a voté votre choix),
                    <strong> ajouté un explication</strong>.
                  </p>
                </div>
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-700">
                    🎯 En plus tu vas <strong>gagner un point bleu</strong> si ton explication est approuvée!
                  </p>
                </div>
              </div>

              {/* Explanation button */}
              <div className="mt-4 flex justify-center">
                <button
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  explication
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CommunityModal;
