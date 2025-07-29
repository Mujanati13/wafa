import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaArrowLeft, FaArrowRight, FaClock, FaCheckCircle, FaTimesCircle, FaTimes, FaMoon, FaSun, FaCheck, FaChevronRight } from "react-icons/fa";

const ExamPage = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [examCompleted, setExamCompleted] = useState(false);
  const [expandedPeriods, setExpandedPeriods] = useState({ 'janvier2024': true });
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Exam data with medical questions - updated to support multiple correct answers
  const examData = {
    "gyneco": {
      title: "Gyneco-obstétricale",
      subject: "Cancérologies", 
      description: "Janvier 2024 Q 25 ",
      totalQuestions: 89,
      completed: 0,
      questions: [
        {
          id: 25,
          period: "Janvier 2024",
          status: "current",
          question: "Concernant le cancer du col stade Ibl:",
          options: [
            "C'est un stade pré invasif",
            "il est étendu aux paramètres",
            "il peut être traité par une hystérectomie élargie avec lymphadénectomie",
            "il nécessite toujours une chimiothérapie",
            "Il est de bon pronostic"
          ],
          correctAnswers: ["C", "E"], // Multiple correct answers
          multipleChoice: true,
          explanation: "Au stade Ibl, le cancer peut être traité par une hystérectomie élargie avec lymphadénectomie et il est généralement de bon pronostic quand traité appropriément."
        },
        {
          id: 26,
          period: "Janvier 2024", 
          status: "pending",
          question: "Les facteurs de risque du cancer du col utérin incluent:",
          options: [
            "L'infection par HPV",
            "Le tabagisme",
            "L'immunodépression",
            "La multiparité",
            "L'âge précoce des premiers rapports"
          ],
          correctAnswers: ["A", "B", "C", "D", "E"], // Multiple correct answers
          multipleChoice: true,
          explanation: "Tous ces facteurs augmentent le risque de cancer du col utérin : HPV, tabagisme, immunodépression, multiparité et âge précoce des premiers rapports."
        },
        {
          id: 39,
          period: "Janvier 2024",
          status: "pending", 
          question: "Le dépistage du cancer du col utérin:",
          options: [
            "Se fait par frottis cervical",
            "Commence à 25 ans",
            "Se fait tous les 3 ans",
            "Peut détecter les lésions précancéreuses",
            "Nécessite une anesthésie générale"
          ],
          correctAnswers: ["A", "B", "C", "D"], // Multiple correct answers
          multipleChoice: true,
          explanation: "Le dépistage par frottis permet une détection précoce efficace et se fait sans anesthésie."
        }
      ]
    }
  };

  const exam = examData[examId] || examData["gyneco"];
  const question = exam.questions[currentQuestion];

  const examPeriods = [
    {
      id: "janvier2024",
      label: "Janvier 2024", 
      questions: [
        { id: 25, status: "active" },
        { id: 26, status: "pending" },
        { id: 39, status: "pending" }
      ]
    },
    {
      id: "juillet2024",
      label: "Juillet 2024",
      questions: []
    },
    {
      id: "octobre2024", 
      label: "Octobre 2024",
      questions: []
    },
    {
      id: "novembre2024",
      label: "Novembre 2024", 
      questions: []
    },
    {
      id: "janvier2023",
      label: "Janvier 2023",
      questions: []
    },
    {
      id: "juin2023",
      label: "Juin 2023", 
      questions: []
    },
    {
      id: "janvier2022",
      label: "Janvier 2022",
      questions: []
    },
    {
      id: "janvier2021", 
      label: "Janvier 2021",
      questions: []
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (answerKey) => {
    const currentQuestionAnswers = selectedAnswers[currentQuestion] || [];
    
    if (question.multipleChoice) {
      // For multiple choice questions
      if (currentQuestionAnswers.includes(answerKey)) {
        // Remove answer if already selected
        setSelectedAnswers({
          ...selectedAnswers,
          [currentQuestion]: currentQuestionAnswers.filter(key => key !== answerKey)
        });
      } else {
        // Add answer to selection
        setSelectedAnswers({
          ...selectedAnswers,
          [currentQuestion]: [...currentQuestionAnswers, answerKey]
        });
      }
    } else {
      // For single choice questions
      setSelectedAnswers({
        ...selectedAnswers,
        [currentQuestion]: [answerKey]
      });
    }
  };

  const handleCheckAnswer = () => {
    setShowResults(true);
  };

  const handleExit = () => {
    navigate('/dashboard/home');
  };

  const togglePeriod = (periodId) => {
    setExpandedPeriods(prev => ({
      ...prev,
      [periodId]: !prev[periodId]
    }));
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const getQuestionStatus = (questionId) => {
    if (questionId === question.id) return 'active';
    return 'pending';
  };

  // Check if answer is correct
  const isAnswerCorrect = () => {
    const userAnswers = selectedAnswers[currentQuestion] || [];
    const correctAnswers = question.correctAnswers || [];
    
    if (userAnswers.length !== correctAnswers.length) return false;
    
    return userAnswers.every(answer => correctAnswers.includes(answer)) &&
           correctAnswers.every(answer => userAnswers.includes(answer));
  };

  // Get answer option styling based on correctness and selection
  const getAnswerOptionStyle = (answerKey, index) => {
    const currentQuestionAnswers = selectedAnswers[currentQuestion] || [];
    const isSelected = currentQuestionAnswers.includes(answerKey);
    const isCorrect = question.correctAnswers.includes(answerKey);
    
    if (showResults) {
      if (isCorrect && isSelected) {
        return 'bg-green-500 text-white border-green-500'; // Correct and selected
      } else if (isCorrect && !isSelected) {
        return 'bg-green-100 text-green-800 border-green-300'; // Correct but not selected
      } else if (!isCorrect && isSelected) {
        return 'bg-red-500 text-white border-red-500'; // Wrong and selected
      }
      return 'bg-gray-100 text-gray-600 border-gray-200'; // Not selected and not correct
    }
    
    if (isSelected) {
      return 'bg-blue-50 text-blue-900 border-blue-300';
    }
    
    return 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50';
  };

  // Get icon for answer option
  const getAnswerIcon = (answerKey) => {
    const currentQuestionAnswers = selectedAnswers[currentQuestion] || [];
    const isSelected = currentQuestionAnswers.includes(answerKey);
    const isCorrect = question.correctAnswers.includes(answerKey);

    if (showResults) {
      if (isCorrect) {
        return <FaCheck className="w-3 h-3 text-white" />;
      } else if (isSelected) {
        return <FaTimes className="w-3 h-3 text-white" />;
      }
    }

    if (question.multipleChoice) {
      return isSelected ? <FaCheck className="w-3 h-3" /> : null;
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Sidebar Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
              <span className="text-pink-600 text-lg">🫸</span>
            </div>
            <span className="font-semibold text-gray-900 text-lg">{exam.title}</span>
          </div>
          
          {/* Subject Progress */}
          <div className="mb-6">
            <div className="text-base font-medium text-gray-900 mb-2">{exam.subject}</div>
            <div className="text-sm text-gray-500 mb-3">
              {exam.completed}% Complete
            </div>
            <div className="text-sm text-gray-400">
              {exam.completed} / {exam.totalQuestions}
            </div>
          </div>
        </div>

        {/* Period Navigation */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {examPeriods.map((period) => (
            <div key={period.id}>
              <button
                onClick={() => togglePeriod(period.id)}
                className="w-full flex items-center space-x-3 text-left text-sm text-gray-700 hover:text-gray-900 py-2"
              >
                <span className={`transform transition-transform ${expandedPeriods[period.id] ? 'rotate-90' : ''}`}>
                  <FaChevronRight />
                </span>
                <span className="font-medium">{period.label}</span>
              </button>
              
              {expandedPeriods[period.id] && period.questions.length > 0 && (
                <div className="ml-8 space-y-2 mt-2">
                  {period.questions.map((q) => (
                    <button
                      key={q.id}
                      onClick={() => {
                        const questionIndex = exam.questions.findIndex(eq => eq.id === q.id);
                        if (questionIndex !== -1) setCurrentQuestion(questionIndex);
                      }}
                      className={`flex items-center space-x-3 text-sm py-2 px-3 rounded-lg transition-all w-full ${
                        q.id === question.id 
                          ? 'bg-red-100 text-red-700 border border-red-200' 
                          : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                      }`}
                    >
                      <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        q.id === question.id ? 'border-red-500 bg-red-500' : 'border-gray-300'
                      }`}>
                        {q.id === question.id && <span className="w-2 h-2 bg-white rounded-full"></span>}
                      </span>
                      <span className="font-medium">Q{q.id}</span>
                    </button>
                  ))}
                </div>
              )}

              {expandedPeriods[period.id] && period.questions.length === 0 && (
                <div className="ml-8 text-sm text-gray-400 py-2">Aucune question</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-4">
          <div className="flex items-center justify-between">
            <div></div>
            
            <div className="flex items-center space-x-6">
              <button
                onClick={handleExit}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <FaTimes className="w-4 h-4" />
                <span className="text-sm font-medium">Exit</span>
              </button>
              
              <button
                onClick={toggleTheme}
                className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                {isDarkMode ? <FaSun className="w-5 h-5" /> : <FaMoon className="w-5 h-5" />}
              </button>
              
              <div className="w-10 h-10 bg-gray-900 text-white rounded-lg flex items-center justify-center text-sm font-bold">
                YK
              </div>
            </div>
          </div>
        </div>

        {/* Question Content */}
        <div className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-5xl mx-auto">
            {/* Question Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <span className="text-gray-600 font-medium">{question.period} Q {question.id}</span>
                 
                  {question.multipleChoice && (
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-md text-sm font-medium">
                      Choix multiples
                    </span>
                  )}
                </div>
                
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => currentQuestion > 0 && setCurrentQuestion(currentQuestion - 1)}
                    disabled={currentQuestion === 0}
                    className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <FaArrowLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => currentQuestion < exam.questions.length - 1 && setCurrentQuestion(currentQuestion + 1)}
                    disabled={currentQuestion === exam.questions.length - 1}
                    className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <FaArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Question */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              {/* Question Number and Total */}
              <div className="px-8 py-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-6 text-lg font-semibold text-gray-800">
                    <span>{currentQuestion + 1}</span>
                    <span className="text-gray-400">{exam.totalQuestions}</span>
                  </div>
                  {question.multipleChoice && (
                    <div className="text-sm text-gray-500">
                      {selectedAnswers[currentQuestion]?.length || 0} réponse(s) sélectionnée(s)
                    </div>
                  )}
                </div>
              </div>
              
              {/* Question Text */}
              <div className="px-8 py-6">
                <h2 className="text-xl text-gray-900 mb-8 font-medium leading-relaxed">
                  {question.question}
                </h2>

                {question.multipleChoice && (
                  <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="text-blue-800 text-sm font-medium">
                      💡 Cette question accepte plusieurs réponses. Cliquez sur toutes les bonnes réponses.
                    </div>
                  </div>
                )}

                {/* Answer Options */}
                <div className="space-y-4 mb-8">
                  {question.options.map((option, index) => {
                    const answerKey = String.fromCharCode(65 + index);
                    const currentQuestionAnswers = selectedAnswers[currentQuestion] || [];
                    const isSelected = currentQuestionAnswers.includes(answerKey);
                    
                    return (
                      <button
                        key={index}
                        onClick={() => !showResults && handleAnswerSelect(answerKey)}
                        disabled={showResults}
                        className={`w-full p-6 border-2 rounded-xl text-left transition-all ${getAnswerOptionStyle(answerKey, index)}`}
                      >
                        <div className="flex items-center space-x-5">
                          <div className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center font-bold text-base relative ${
                            showResults && question.correctAnswers.includes(answerKey)
                              ? 'border-white bg-green-500 text-white'
                              : showResults && isSelected && !question.correctAnswers.includes(answerKey)
                              ? 'border-white bg-red-500 text-white'
                              : isSelected
                              ? 'border-blue-400 bg-blue-500 text-white'
                              : 'border-gray-400 bg-white text-gray-600'
                          }`}>
                            {question.multipleChoice && (showResults || isSelected) ? (
                              <div className="absolute inset-0 flex items-center justify-center">
                                {getAnswerIcon(answerKey)}
                              </div>
                            ) : (
                              answerKey
                            )}
                            {!question.multipleChoice && (
                              <span className={showResults && question.correctAnswers.includes(answerKey) ? 'text-white' : ''}>
                                {answerKey}
                              </span>
                            )}
                          </div>
                          <span className="text-base font-medium leading-relaxed">{option}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-6">
                  <div className="flex space-x-4">
                    {showResults && (
                      <>
                        <button className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-colors ${
                          isAnswerCorrect() 
                            ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                            : 'bg-red-100 text-red-700 hover:bg-red-200'
                        }`}>
                          {isAnswerCorrect() ? (
                            <>
                              <FaCheckCircle className="w-4 h-4" />
                              <span className="font-medium">Correct</span>
                            </>
                          ) : (
                            <>
                              <FaTimesCircle className="w-4 h-4" />
                              <span className="font-medium">Incorrect</span>
                            </>
                          )}
                        </button>
                        <button className="flex items-center space-x-2 px-6 py-3 bg-pink-100 text-pink-700 rounded-lg hover:bg-pink-200 transition-colors">
                          <span className="text-sm">👥</span>
                          <span className="font-medium">Community</span>
                        </button>
                      </>
                    )}
                  </div>
                  
                  {!showResults && (selectedAnswers[currentQuestion]?.length > 0) && (
                    <button
                      onClick={handleCheckAnswer}
                      className="bg-black text-white px-8 py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium"
                    >
                      Check Answer ✓
                    </button>
                  )}
                </div>

                {/* Explanation */}
                {showResults && (
                  <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-xl">
                    <div className="text-blue-800 font-semibold mb-3 text-base">Explication:</div>
                    <div className="text-blue-700 text-base leading-relaxed">{question.explanation}</div>
                    {question.multipleChoice && (
                      <div className="mt-4 text-blue-700 text-sm">
                        <strong>Réponses correctes:</strong> {question.correctAnswers.join(', ')}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamPage; 