import React from 'react'
import { motion } from 'framer-motion'
import { FaPlay } from 'react-icons/fa'

const ExamCard = ({ exam, handleStartExam }) => {

    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
          case 'Facile': return 'text-green-500'
          case 'Moyen': return 'text-yellow-500'
          case 'Difficile': return 'text-red-500'
          case 'Très Difficile': return 'text-purple-500'
          default: return 'text-gray-400'
        }
      }
  return (
    <motion.div
                  key={exam.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden transition-all duration-300 ${
                    exam.available ? 'hover:border-purple-500/50' : 'opacity-60'
                  }`}
                >
                  <div className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 bg-opacity-20 mr-4">
                        <exam.icon className="text-xl text-purple-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white">{exam.subject}</h3>
                        <p className={`text-sm font-medium ${getDifficultyColor(exam.difficulty)}`}>{exam.difficulty}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-gray-400">
                        <span>Questions:</span>
                        <span>{exam.questions}</span>
                      </div>
                      <div className="flex justify-between text-gray-400">
                        <span>Durée:</span>
                        <span>{exam.duration}</span>
                      </div>
                      {exam.lastScore && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Dernier score:</span>
                          <span className="text-green-400 font-semibold">{exam.lastScore}</span>
                        </div>
                      )}
                    </div>
                    
                    <button 
                      disabled={!exam.available}
                      onClick={() => exam.available && handleStartExam(exam.id)}
                      className={`w-full py-3 rounded-xl font-medium transition-all duration-300 ${
                        exam.available
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600'
                          : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {exam.available ? (
                        <span className="flex items-center justify-center">
                          <FaPlay className="mr-2" />
                          Commencer l'examen
                        </span>
                      ) : (
                        'Indisponible'
                      )}
                    </button>
                  </div>
                </motion.div>
  )
}

export default ExamCard