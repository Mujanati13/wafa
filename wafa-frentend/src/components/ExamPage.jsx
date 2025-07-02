import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FaClock, FaQuestion, FaCheck, FaTimes, FaFlag, 
  FaArrowLeft, FaArrowRight, FaPlay, FaPause,
  FaCheckCircle, FaTimesCircle, FaExclamationTriangle,
  FaStethoscope, FaMedkit, FaBrain, FaHeart, FaEye, FaBone
} from 'react-icons/fa'

const ExamPage = () => {
  const { examId } = useParams()
  const navigate = useNavigate()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState({})
  const [timeLeft, setTimeLeft] = useState(5400) // Default 90 minutes
  const [isActive, setIsActive] = useState(false)
  const [flaggedQuestions, setFlaggedQuestions] = useState(new Set())
  const [showResults, setShowResults] = useState(false)
  const [examStarted, setExamStarted] = useState(false)

  // Exam data lookup - this would come from a database in real implementation
  const examDatabase = {
    1: {
    id: 1,
    subject: 'Anatomie Générale',
    icon: FaBone,
    duration: 90,
    totalQuestions: 20,
    questions: [
      {
        id: 1,
        question: "Quelle est la fonction principale du système cardiovasculaire ?",
        options: [
          "Transport des nutriments et de l'oxygène",
          "Production d'hormones",
          "Digestion des aliments",
          "Filtration des déchets"
        ],
        correctAnswer: 0,
        explanation: "Le système cardiovasculaire transporte les nutriments, l'oxygène et les hormones vers les tissus et élimine les déchets métaboliques."
      },
      {
        id: 2,
        question: "Combien d'os compose le squelette humain adulte ?",
        options: [
          "198 os",
          "206 os",
          "215 os",
          "220 os"
        ],
        correctAnswer: 1,
        explanation: "Le squelette humain adulte est composé de 206 os, contrairement au nouveau-né qui en possède environ 270."
      },
      {
        id: 3,
        question: "Quelle est la plus grande cellule du corps humain ?",
        options: [
          "Le neurone",
          "L'ovule",
          "Le globule rouge",
          "La cellule musculaire"
        ],
        correctAnswer: 1,
        explanation: "L'ovule est la plus grande cellule du corps humain avec un diamètre d'environ 0,1 mm."
      },
      {
        id: 4,
        question: "Dans quelle partie du cœur se trouve la valve tricuspide ?",
        options: [
          "Entre l'oreillette droite et le ventricule droit",
          "Entre l'oreillette gauche et le ventricule gauche",
          "À la sortie du ventricule droit",
          "À la sortie du ventricule gauche"
        ],
        correctAnswer: 0,
        explanation: "La valve tricuspide se situe entre l'oreillette droite et le ventricule droit, permettant le passage du sang dans un seul sens."
      },
      {
        id: 5,
        question: "Quel est le nom du processus par lequel les globules rouges transportent l'oxygène ?",
        options: [
          "Osmose",
          "Diffusion simple",
          "Liaison à l'hémoglobine",
          "Transport actif"
        ],
        correctAnswer: 2,
        explanation: "L'oxygène se lie à l'hémoglobine dans les globules rouges pour former l'oxyhémoglobine, permettant son transport."
      },
      {
        id: 6,
        question: "Quelle hormone régule principalement le taux de glucose dans le sang ?",
        options: [
          "L'adrénaline",
          "L'insuline",
          "Le cortisol",
          "La thyroxine"
        ],
        correctAnswer: 1,
        explanation: "L'insuline, produite par le pancréas, régule le taux de glucose sanguin en favorisant son absorption par les cellules."
      },
      {
        id: 7,
        question: "Combien de chambres possède le cœur humain ?",
        options: [
          "2 chambres",
          "3 chambres",
          "4 chambres",
          "5 chambres"
        ],
        correctAnswer: 2,
        explanation: "Le cœur humain possède 4 chambres : 2 oreillettes (droite et gauche) et 2 ventricules (droit et gauche)."
      },
      {
        id: 8,
        question: "Quelle est la fonction principale des reins ?",
        options: [
          "Production d'hormones uniquement",
          "Filtration du sang et élimination des déchets",
          "Stockage des nutriments",
          "Production de globules rouges uniquement"
        ],
        correctAnswer: 1,
        explanation: "Les reins filtrent le sang pour éliminer les déchets et l'excès d'eau, formant l'urine."
      },
      {
        id: 9,
        question: "Dans quel organe se déroule principalement la digestion des protéines ?",
        options: [
          "L'estomac",
          "Le foie",
          "L'intestin grêle",
          "Le gros intestin"
        ],
        correctAnswer: 0,
        explanation: "La digestion des protéines commence dans l'estomac grâce à la pepsine et à l'acidité gastrique."
      },
      {
        id: 10,
        question: "Quel est le neurotransmetteur principal du système nerveux parasympathique ?",
        options: [
          "La dopamine",
          "La sérotonine",
          "L'acétylcholine",
          "La noradrénaline"
        ],
        correctAnswer: 2,
        explanation: "L'acétylcholine est le principal neurotransmetteur du système nerveux parasympathique."
      }
    ]
    },
    2: {
      id: 2,
      subject: 'Biologie Cellulaire',
      icon: FaMedkit,
      duration: 75,
      totalQuestions: 15,
      questions: [
        {
          id: 1,
          question: "Quelle organite est responsable de la production d'ATP ?",
          options: [
            "Le noyau",
            "La mitochondrie",
            "Le réticulum endoplasmique",
            "L'appareil de Golgi"
          ],
          correctAnswer: 1,
          explanation: "La mitochondrie est l'organite responsable de la production d'ATP par la respiration cellulaire."
        }
        // More questions would be added here
      ]
    }
    // More exams would be added here
  }

  // Get exam data based on examId from URL
  const exam = examDatabase[parseInt(examId)]
  
  // Redirect to dashboard if exam not found
  useEffect(() => {
    if (!exam) {
      navigate('/dashboard')
    } else {
      setTimeLeft(exam.duration * 60) // Set timer based on exam duration
    }
  }, [exam, navigate])
  
  // Return loading state if exam not found
  if (!exam) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A0A0F] via-[#111015] to-[#1A1625] flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p>Chargement de l'examen...</p>
        </div>
      </div>
    )
  }

  // Timer effect
  useEffect(() => {
    let interval = null
    if (isActive && timeLeft > 0 && examStarted) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft => timeLeft - 1)
      }, 1000)
    } else if (timeLeft === 0) {
      handleSubmitExam()
    }
    return () => clearInterval(interval)
  }, [isActive, timeLeft, examStarted])

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = seconds % 60
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const handleAnswerSelect = (questionId, optionIndex) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }))
  }

  const handleFlagQuestion = (questionId) => {
    setFlaggedQuestions(prev => {
      const newSet = new Set(prev)
      if (newSet.has(questionId)) {
        newSet.delete(questionId)
      } else {
        newSet.add(questionId)
      }
      return newSet
    })
  }

  const startExam = () => {
    setExamStarted(true)
    setIsActive(true)
  }

  const handleSubmitExam = () => {
    setIsActive(false)
    setShowResults(true)
    
    // Calculate results
    const correctAnswers = exam.questions.filter(q => 
      answers[q.id] === q.correctAnswer
    ).length
    
    const score = (correctAnswers / exam.questions.length) * 20 // Score out of 20
    
    // Save results to localStorage (in a real app, this would be sent to a server)
    const examResult = {
      examId: exam.id,
      subject: exam.subject,
      score: score.toFixed(1),
      correctAnswers,
      totalQuestions: exam.questions.length,
      timeSpent: (exam.duration * 60) - timeLeft,
      date: new Date().toISOString().split('T')[0],
      answers
    }
    
    const existingResults = JSON.parse(localStorage.getItem('examResults') || '[]')
    existingResults.push(examResult)
    localStorage.setItem('examResults', JSON.stringify(existingResults))
  }

  const getQuestionStatus = (questionId) => {
    if (answers[questionId] !== undefined) {
      return 'answered'
    } else if (flaggedQuestions.has(questionId)) {
      return 'flagged'
    }
    return 'unanswered'
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'answered': return 'bg-green-500'
      case 'flagged': return 'bg-yellow-500'
      default: return 'bg-gray-600'
    }
  }

  if (!examStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A0A0F] via-[#111015] to-[#1A1625] flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-8 max-w-2xl w-full"
        >
          <div className="text-center">
            <div className="p-4 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 bg-opacity-20 w-fit mx-auto mb-6">
              <exam.icon className="text-4xl text-purple-400" />
            </div>
            
            <h1 className="text-3xl font-bold text-white mb-4">{exam.subject}</h1>
            
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-800/30 rounded-xl p-4">
                <div className="text-gray-400 text-sm">Questions</div>
                <div className="text-2xl font-bold text-white">{exam.questions.length}</div>
              </div>
              <div className="bg-gray-800/30 rounded-xl p-4">
                <div className="text-gray-400 text-sm">Durée</div>
                <div className="text-2xl font-bold text-white">{exam.duration} min</div>
              </div>
            </div>
            
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6 mb-8">
              <h3 className="text-blue-400 font-semibold mb-2">Instructions</h3>
              <ul className="text-gray-300 text-left space-y-2">
                <li>• Lisez attentivement chaque question</li>
                <li>• Choisissez la meilleure réponse parmi les options proposées</li>
                <li>• Vous pouvez marquer les questions pour les réviser plus tard</li>
                <li>• Le temps est limité, gérez-le bien</li>
                <li>• Une fois soumis, vous ne pourrez plus modifier vos réponses</li>
              </ul>
            </div>
            
            <div className="flex gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex-1 bg-gray-600 text-white py-3 rounded-xl hover:bg-gray-700 transition-colors duration-300"
              >
                Annuler
              </button>
              <button
                onClick={startExam}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 flex items-center justify-center"
              >
                <FaPlay className="mr-2" />
                Commencer l'examen
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  if (showResults) {
    const correctAnswers = exam.questions.filter(q => 
      answers[q.id] === q.correctAnswer
    ).length
    const score = (correctAnswers / exam.questions.length) * 20
    const percentage = (correctAnswers / exam.questions.length) * 100
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A0A0F] via-[#111015] to-[#1A1625] p-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-8 mb-6"
          >
            <div className="text-center mb-8">
              <div className={`p-4 rounded-xl w-fit mx-auto mb-6 ${
                percentage >= 70 ? 'bg-green-500/20' : percentage >= 50 ? 'bg-yellow-500/20' : 'bg-red-500/20'
              }`}>
                {percentage >= 70 ? (
                  <FaCheckCircle className="text-4xl text-green-400" />
                ) : percentage >= 50 ? (
                  <FaExclamationTriangle className="text-4xl text-yellow-400" />
                ) : (
                  <FaTimesCircle className="text-4xl text-red-400" />
                )}
              </div>
              
              <h1 className="text-3xl font-bold text-white mb-2">Résultats de l'examen</h1>
              <p className="text-gray-400">{exam.subject}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div className="bg-gray-800/30 rounded-xl p-6">
                  <div className="text-gray-400 text-sm">Score</div>
                  <div className="text-3xl font-bold text-white">{score.toFixed(1)}/20</div>
                </div>
                <div className="bg-gray-800/30 rounded-xl p-6">
                  <div className="text-gray-400 text-sm">Réponses correctes</div>
                  <div className="text-3xl font-bold text-white">{correctAnswers}/{exam.questions.length}</div>
                </div>
                <div className="bg-gray-800/30 rounded-xl p-6">
                  <div className="text-gray-400 text-sm">Pourcentage</div>
                  <div className="text-3xl font-bold text-white">{percentage.toFixed(1)}%</div>
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Detailed Results */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-8"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Détail des réponses</h2>
            <div className="space-y-6">
              {exam.questions.map((question, index) => {
                const userAnswer = answers[question.id]
                const isCorrect = userAnswer === question.correctAnswer
                
                return (
                  <div key={question.id} className="bg-gray-800/30 rounded-xl p-6">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-lg font-semibold text-white flex-1">
                        {index + 1}. {question.question}
                      </h3>
                      <div className={`p-2 rounded-full ${isCorrect ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                        {isCorrect ? (
                          <FaCheck className="text-green-400" />
                        ) : (
                          <FaTimes className="text-red-400" />
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      {question.options.map((option, optionIndex) => (
                        <div
                          key={optionIndex}
                          className={`p-3 rounded-lg border ${
                            optionIndex === question.correctAnswer
                              ? 'border-green-500 bg-green-500/10 text-green-400'
                              : optionIndex === userAnswer && userAnswer !== question.correctAnswer
                              ? 'border-red-500 bg-red-500/10 text-red-400'
                              : 'border-gray-600 text-gray-300'
                          }`}
                        >
                          {option}
                          {optionIndex === question.correctAnswer && (
                            <span className="ml-2 text-green-400">✓ Bonne réponse</span>
                          )}
                          {optionIndex === userAnswer && userAnswer !== question.correctAnswer && (
                            <span className="ml-2 text-red-400">✗ Votre réponse</span>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                      <p className="text-blue-400 font-medium mb-1">Explication :</p>
                      <p className="text-gray-300">{question.explanation}</p>
                    </div>
                  </div>
                )
              })}
            </div>
            
            <div className="flex gap-4 mt-8">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300"
              >
                Retour au tableau de bord
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  const currentQ = exam.questions[currentQuestion]
  const progress = ((currentQuestion + 1) / exam.questions.length) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0A0F] via-[#111015] to-[#1A1625] p-6">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-6">
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <exam.icon className="text-2xl text-purple-400 mr-3" />
              <h1 className="text-2xl font-bold text-white">{exam.subject}</h1>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="flex items-center text-white">
                <FaClock className="mr-2 text-blue-400" />
                <span className={`font-bold ${timeLeft < 600 ? 'text-red-400' : 'text-white'}`}>
                  {formatTime(timeLeft)}
                </span>
              </div>
              
              <button
                onClick={() => setIsActive(!isActive)}
                className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors duration-300"
              >
                {isActive ? <FaPause /> : <FaPlay />}
              </button>
              
              <button
                onClick={() => navigate('/dashboard')}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors duration-300"
              >
                Quitter
              </button>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
            <motion.div 
              className="h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          
          <div className="flex items-center justify-between text-gray-400">
            <span>Question {currentQuestion + 1} sur {exam.questions.length}</span>
            <span>{progress.toFixed(0)}% complété</span>
          </div>
        </div>
      </div>
      
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Question Panel */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-8"
            >
              <div className="flex items-start justify-between mb-6">
                <h2 className="text-xl font-semibold text-white flex-1">
                  {currentQ.question}
                </h2>
                <button
                  onClick={() => handleFlagQuestion(currentQ.id)}
                  className={`p-2 rounded-lg transition-colors duration-300 ${
                    flaggedQuestions.has(currentQ.id) 
                      ? 'bg-yellow-500/20 text-yellow-400' 
                      : 'bg-gray-700 text-gray-400 hover:text-yellow-400'
                  }`}
                >
                  <FaFlag />
                </button>
              </div>
              
              <div className="space-y-4">
                {currentQ.options.map((option, index) => (
                  <motion.label
                    key={index}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`block p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                      answers[currentQ.id] === index
                        ? 'border-purple-500 bg-purple-500/10 text-white'
                        : 'border-gray-600 bg-gray-800/30 text-gray-300 hover:border-gray-500 hover:bg-gray-700/30'
                    }`}
                  >
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name={`question-${currentQ.id}`}
                        value={index}
                        checked={answers[currentQ.id] === index}
                        onChange={() => handleAnswerSelect(currentQ.id, index)}
                        className="hidden"
                      />
                      <div className={`w-5 h-5 rounded-full border-2 mr-4 flex items-center justify-center ${
                        answers[currentQ.id] === index
                          ? 'border-purple-500 bg-purple-500'
                          : 'border-gray-400'
                      }`}>
                        {answers[currentQ.id] === index && (
                          <div className="w-2 h-2 bg-white rounded-full" />
                        )}
                      </div>
                      <span className="flex-1">{option}</span>
                    </div>
                  </motion.label>
                ))}
              </div>
              
              <div className="flex justify-between mt-8">
                <button
                  onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                  disabled={currentQuestion === 0}
                  className="flex items-center px-6 py-3 bg-gray-700 text-white rounded-xl hover:bg-gray-600 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaArrowLeft className="mr-2" />
                  Précédent
                </button>
                
                {currentQuestion === exam.questions.length - 1 ? (
                  <button
                    onClick={handleSubmitExam}
                    className="px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 font-semibold"
                  >
                    Terminer l'examen
                  </button>
                ) : (
                  <button
                    onClick={() => setCurrentQuestion(Math.min(exam.questions.length - 1, currentQuestion + 1))}
                    className="flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300"
                  >
                    Suivant
                    <FaArrowRight className="ml-2" />
                  </button>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
        
        {/* Question Navigator */}
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Navigation</h3>
          
          <div className="grid grid-cols-5 gap-2 mb-6">
            {exam.questions.map((_, index) => {
              const status = getQuestionStatus(exam.questions[index].id)
              return (
                <button
                  key={index}
                  onClick={() => setCurrentQuestion(index)}
                  className={`w-10 h-10 rounded-lg font-semibold transition-all duration-300 ${
                    currentQuestion === index
                      ? 'bg-purple-500 text-white'
                      : `${getStatusColor(status)} text-white hover:opacity-80`
                  }`}
                >
                  {index + 1}
                </button>
              )
            })}
          </div>
          
          <div className="space-y-3 text-sm">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
              <span className="text-gray-300">Répondu</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-yellow-500 rounded mr-2"></div>
              <span className="text-gray-300">Marqué</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-gray-600 rounded mr-2"></div>
              <span className="text-gray-300">Non répondu</span>
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-700">
            <div className="text-gray-400 text-sm mb-2">Statistiques</div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-300">Répondues:</span>
                <span className="text-white">{Object.keys(answers).length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Marquées:</span>
                <span className="text-white">{flaggedQuestions.size}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Restantes:</span>
                <span className="text-white">{exam.questions.length - Object.keys(answers).length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ExamPage 