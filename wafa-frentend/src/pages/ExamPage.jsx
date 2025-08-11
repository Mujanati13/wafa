import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiEdit } from "react-icons/fi";
import { motion } from "framer-motion";
import {
  FaArrowLeft,
  FaArrowRight,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaTimes,
  FaMoon,
  FaSun,
  FaCheck,
  FaChevronRight,
  FaPlay,
  FaFilter,
  FaFlag,
  FaExclamationTriangle,
  FaPlus,
  FaMinus,
} from "react-icons/fa";
import { IoIosArrowForward } from "react-icons/io";
import { ImFontSize } from "react-icons/im";
import { PiImagesSquareFill } from "react-icons/pi";
import ResumeModel from "../components/ExamsPage/ResumeModel";
import ExplicationModel from "../components/ExamsPage/ExplicationModel";

const ExamPage = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [examCompleted, setExamCompleted] = useState(false);
  const [expandedPeriods, setExpandedPeriods] = useState({ janvier2024: true });
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [editModelShow, setEditModelShow] = useState(false);
  const [fontSize, setFontSize] = useState(16); // Default font size
  const [showFontSizeMenu, setShowFontSizeMenu] = useState(false);
  const [help, setHelp] = useState(false);
  // Exam data with medical questions - updated to support multiple correct answers
  const examData = {
    gyneco: {
      title: "Santé publique",
      subject: "nom d'app",
      description: "Janvier 2024 Q 25 ",
      totalQuestions: 50,
      completed: 11,
      questions: [
        {
          id: 1,
          period: "Septembre 2024",
          status: "current",
          question: "Text question",
          options: [
            "Sur les vaccins",
            "Sur la sérothérapie",
            "Sur la biothérapie",
            "Sur les Anti Inflammatoires non stéroïdiens",
            "Aucune réponse n'est juste",
          ],
          correctAnswers: ["C", "D"], // Multiple correct answers
          multipleChoice: true,
          explanation:
            "La biothérapie et les AINS sont des traitements importants en médecine.",
        },
        {
          id: 2,
          period: "Septembre 2024",
          status: "pending",
          question: "Question sur les traitements médicaux:",
          options: ["Option A", "Option B", "Option C", "Option D", "Option E"],
          correctAnswers: ["A", "B"], // Multiple correct answers
          multipleChoice: true,
          explanation: "Explication de la réponse correcte.",
        },
        {
          id: 3,
          period: "Septembre 2024",
          status: "pending",
          question:
            "Quels sont les facteurs de risque de l'hypertension artérielle ?",
          options: [
            "Tabagisme",
            "Sédentarité",
            "Consommation excessive de sel",
            "Exercice physique régulier",
            "Obésité",
          ],
          correctAnswers: ["A", "B", "C", "E"],
          multipleChoice: true,
          explanation:
            "Le tabagisme, la sédentarité, la consommation excessive de sel et l'obésité sont des facteurs de risque.",
        },
        {
          id: 4,
          period: "Septembre 2024",
          status: "pending",
          question:
            "Parmi les suivants, lesquels sont des vaccins obligatoires en France chez l’enfant ?",
          options: ["BCG", "Hépatite B", "Coqueluche", "Rougeole", "Tétanos"],
          correctAnswers: ["B", "C", "D", "E"],
          multipleChoice: true,
          explanation:
            "Hépatite B, coqueluche, rougeole et tétanos sont obligatoires.",
        },
        {
          id: 5,
          period: "Septembre 2024",
          status: "pending",
          question: "Quels sont des exemples de maladies auto-immunes ?",
          options: [
            "Diabète de type 1",
            "Polyarthrite rhumatoïde",
            "Tuberculose",
            "Lupus érythémateux disséminé",
            "Grippe",
          ],
          correctAnswers: ["A", "B", "D"],
          multipleChoice: true,
          explanation:
            "Le diabète de type 1, la polyarthrite rhumatoïde et le lupus sont des maladies auto-immunes.",
        },
        {
          id: 6,
          period: "Septembre 2024",
          status: "pending",
          question:
            "Lesquels des éléments suivants sont des symptômes du diabète ?",
          options: [
            "Polyurie",
            "Polydipsie",
            "Perte de poids",
            "Fièvre",
            "Vision trouble",
          ],
          correctAnswers: ["A", "B", "C", "E"],
          multipleChoice: true,
          explanation:
            "Polyurie, polydipsie, perte de poids et vision trouble sont des symptômes du diabète.",
        },
        {
          id: 7,
          period: "Septembre 2024",
          status: "pending",
          question:
            "Quels sont des moyens de prévention des maladies cardiovasculaires ?",
          options: [
            "Arrêt du tabac",
            "Activité physique régulière",
            "Consommation excessive d’alcool",
            "Alimentation équilibrée",
            "Gestion du stress",
          ],
          correctAnswers: ["A", "B", "D", "E"],
          multipleChoice: true,
          explanation:
            "Arrêter de fumer, faire du sport, manger équilibré et gérer le stress préviennent les maladies cardiovasculaires.",
        },
        {
          id: 8,
          period: "Septembre 2024",
          status: "pending",
          question: "Quels sont des exemples d’antibiotiques ?",
          options: [
            "Amoxicilline",
            "Ibuprofène",
            "Ciprofloxacine",
            "Paracétamol",
            "Azithromycine",
          ],
          correctAnswers: ["A", "C", "E"],
          multipleChoice: true,
          explanation:
            "Amoxicilline, ciprofloxacine et azithromycine sont des antibiotiques.",
        },
        {
          id: 9,
          period: "Septembre 2024",
          status: "pending",
          question: "Quels sont des facteurs de risque du cancer du poumon ?",
          options: [
            "Tabagisme",
            "Exposition à l’amiante",
            "Pollution de l’air",
            "Consommation de fruits",
            "Antécédents familiaux",
          ],
          correctAnswers: ["A", "B", "C", "E"],
          multipleChoice: true,
          explanation:
            "Tabac, amiante, pollution et antécédents familiaux sont des facteurs de risque.",
        },
        {
          id: 10,
          period: "Septembre 2024",
          status: "pending",
          question: "Lesquels des suivants sont des signes d’infection ?",
          options: [
            "Fièvre",
            "Rougeur",
            "Douleur",
            "Somnolence",
            "Chaleur locale",
          ],
          correctAnswers: ["A", "B", "C", "E"],
          multipleChoice: true,
          explanation:
            "Fièvre, rougeur, douleur et chaleur locale sont des signes d’infection.",
        },
        {
          id: 11,
          period: "Septembre 2024",
          status: "pending",
          question: "Quels sont des exemples de maladies chroniques ?",
          options: [
            "Asthme",
            "Grippe",
            "Diabète",
            "Hypertension artérielle",
            "Varicelle",
          ],
          correctAnswers: ["A", "C", "D"],
          multipleChoice: true,
          explanation:
            "Asthme, diabète et hypertension sont des maladies chroniques.",
        },
        {
          id: 12,
          period: "Septembre 2024",
          status: "pending",
          question: "Quels sont des modes de transmission du VIH ?",
          options: [
            "Rapports sexuels non protégés",
            "Partage de seringues",
            "Poignée de main",
            "Transmission mère-enfant",
            "Toux",
          ],
          correctAnswers: ["A", "B", "D"],
          multipleChoice: true,
          explanation:
            "Rapports non protégés, seringues partagées et transmission mère-enfant transmettent le VIH.",
        },
      ],
    },
  };

  const exam = examData[examId] || examData["gyneco"];
  const question = exam.questions[currentQuestion];

  const examPeriods = [
    {
      id: "octobre2024",
      label: "Octobre 2024",
      questions: [
        { id: 4, status: "active" },
        { id: 5, status: "pending" },
      ],
    },
    {
      id: "janvier2023",
      label: "Janvier 2023",
      questions: [{ id: 3, status: "active" }],
    },
    {
      id: "normal2022",
      label: "Normal 2022",
      questions: [
        { id: 1, status: "active" },
        { id: 2, status: "pending" },
        { id: 6, status: "pending" },
        { id: 7, status: "pending" },
        { id: 8, status: "pending" },
      ],
    },
    {
      id: "normal2021",
      label: "Normal 2021",
      questions: [],
    },
    {
      id: "normal2020",
      label: "Normal 2020",
      questions: [],
    },
    {
      id: "normal2019",
      label: "Normal 2019",
      questions: [],
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Close font size menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showFontSizeMenu && !event.target.closest(".font-size-selector")) {
        setShowFontSizeMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showFontSizeMenu]);

  // Keyboard shortcuts for font size
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case "=":
          case "+":
            event.preventDefault();
            increaseFontSize();
            break;
          case "-":
            event.preventDefault();
            decreaseFontSize();
            break;
          case "0":
            event.preventDefault();
            resetFontSize();
            break;
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handleAnswerSelect = (answerKey) => {
    const currentQuestionAnswers = selectedAnswers[currentQuestion] || [];

    if (question.multipleChoice) {
      // For multiple choice questions
      if (currentQuestionAnswers.includes(answerKey)) {
        // Remove answer if already selected
        setSelectedAnswers({
          ...selectedAnswers,
          [currentQuestion]: currentQuestionAnswers.filter(
            (key) => key !== answerKey
          ),
        });
      } else {
        // Add answer to selection
        setSelectedAnswers({
          ...selectedAnswers,
          [currentQuestion]: [...currentQuestionAnswers, answerKey],
        });
      }
    } else {
      // For single choice questions
      setSelectedAnswers({
        ...selectedAnswers,
        [currentQuestion]: [answerKey],
      });
    }
  };

  const handleCheckAnswer = () => {
    setShowResults(true);
  };

  const togglePeriod = (periodId) => {
    setExpandedPeriods((prev) => ({
      ...prev,
      [periodId]: !prev[periodId],
    }));
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const increaseFontSize = () => {
    setFontSize((prev) => Math.min(prev + 2, 24)); // Max 24px
  };

  const decreaseFontSize = () => {
    setFontSize((prev) => Math.max(prev - 2, 12)); // Min 12px
  };

  const resetFontSize = () => {
    setFontSize(16); // Reset to default
  };

  const getQuestionStatus = (questionId) => {
    if (questionId === question.id) return "active";
    return "pending";
  };
  const handleExit = () => {
    navigate("/dashboard/home");
  };

  // Check if answer is correct
  const isAnswerCorrect = () => {
    const userAnswers = selectedAnswers[currentQuestion] || [];
    const correctAnswers = question.correctAnswers || [];

    if (userAnswers.length !== correctAnswers.length) return false;

    return (
      userAnswers.every((answer) => correctAnswers.includes(answer)) &&
      correctAnswers.every((answer) => userAnswers.includes(answer))
    );
  };

  // Get answer option styling based on correctness and selection
  const getAnswerOptionStyle = (answerKey, index) => {
    const currentQuestionAnswers = selectedAnswers[currentQuestion] || [];
    const isSelected = currentQuestionAnswers.includes(answerKey);
    const isCorrect = question.correctAnswers.includes(answerKey);

    if (showResults) {
      if (isCorrect && isSelected) {
        return "bg-green-500 text-white border-green-500"; // Correct and selected
      } else if (isCorrect && !isSelected) {
        return "bg-green-100 text-green-800 border-green-300"; // Correct but not selected
      } else if (!isCorrect && isSelected) {
        return "bg-red-500 text-white border-red-500"; // Wrong and selected
      }
      return "bg-gray-100 text-gray-600 border-gray-200"; // Not selected and not correct
    }

    if (isSelected) {
      return "bg-blue-500 text-white border-blue-300";
    }

    return "bg-white text-gray-700 border-gray-200 hover:bg-gray-50";
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

  // Get feedback message based on user's answer
  const getFeedbackMessage = () => {
    const userAnswers = selectedAnswers[currentQuestion] || [];
    const correctAnswers = question.correctAnswers || [];
    const hasSelectedCorrect = userAnswers.some((answer) =>
      correctAnswers.includes(answer)
    );
    const hasSelectedIncorrect = userAnswers.some(
      (answer) => !correctAnswers.includes(answer)
    );
    const missedCorrect = correctAnswers.some(
      (answer) => !userAnswers.includes(answer)
    );

    if (hasSelectedCorrect && !hasSelectedIncorrect && !missedCorrect) {
      return {
        type: "correct",
        message: "Parfait ! Vous avez sélectionné toutes les bonnes réponses.",
        icon: <FaCheckCircle className="w-5 h-5 text-green-500" />,
      };
    } else if (hasSelectedCorrect && (hasSelectedIncorrect || missedCorrect)) {
      return {
        type: "partial",
        message:
          "Vous avez sélectionné certaines bonnes réponses, mais il y a des erreurs.",
        icon: <FaExclamationTriangle className="w-5 h-5 text-yellow-500" />,
      };
    } else {
      return {
        type: "incorrect",
        message: "Vous n'avez pas sélectionné les bonnes réponses.",
        icon: <FaTimesCircle className="w-5 h-5 text-red-500" />,
      };
    }
  };

  return (
    <div className="max-h-screen bg-gray-50 flex relative">
      {/* Top Header Bar */}
      <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
        <div className="flex items-center justify-between px-6 py-4">
          {/* Left - Logo and App Name */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-blue-600 text-sm">📊</span>
            </div>
            <span className="font-semibold text-gray-900">Santé publique</span>
          </div>

          {/* Center - App Name */}
          <div className="text-gray-600 font-medium">WAFA</div>

          {/* Right - Controls */}
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              {isDarkMode ? (
                <FaSun className="w-4 h-4" />
              ) : (
                <FaMoon className="w-4 h-4" />
              )}
            </button>
            <span onClick={() => handleExit()} className="cursor-pointer">
              Exit
            </span>
          </div>
        </div>
      </div>

      {/* Left Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col pt-16 max-h-screen relative">
        {/* Add Button */}
        <div className="p-6 absolute -right-2">
          {!help ? (
            <button
              onClick={() => setHelp(true)}
              className="w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center text-white hover:bg-blue-600 transition-colors absolute "
            >
              <FaPlus className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => setHelp(false)}
              className="w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center text-white hover:bg-blue-600 transition-colors absolute "
            >
              <FaMinus className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {examPeriods.map((period) => (
            <div key={period.id}>
              <button
                onClick={() => togglePeriod(period.id)}
                className={`w-full flex items-center space-x-3 text-left text-sm py-2 px-3 rounded-lg transition-all ${
                  period.id === "normal2022"
                    ? "bg-blue-100 text-blue-700 font-semibold"
                    : "text-gray-700 hover:text-gray-900"
                }`}
              >
                <FaPlay
                  className={`w-3 h-3 ${
                    period.id === "normal2022"
                      ? "text-blue-600"
                      : "text-gray-500"
                  }`}
                />
                <span className="font-medium">{period.label}</span>
              </button>

              {expandedPeriods[period.id] && period.questions.length > 0 && (
                <div className="ml-8 mt-2">
                  <div className="grid grid-cols-5 ">
                    {period.questions.map((q, index) => {
                      // Determine color based on position (alternating pattern like in the image)
                      const isReddishPink = index % 5 < 2 || index % 5 >= 3;
                      const bgColor = isReddishPink
                        ? "bg-rose-400"
                        : "bg-teal-400";
                      const isCurrentQuestion = q.id === question.id;

                      return (
                        <button
                          key={q.id}
                          onClick={() => {
                            const questionIndex = exam.questions.findIndex(
                              (eq) => eq.id === q.id
                            );
                            if (questionIndex !== -1)
                              setCurrentQuestion(questionIndex);
                          }}
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-white font-medium text-sm transition-all hover:scale-105 ${bgColor} ${
                            isCurrentQuestion
                              ? "ring-2 ring-white ring-offset-2 ring-offset-gray-800"
                              : ""
                          }`}
                        >
                          {q.id}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {expandedPeriods[period.id] && period.questions.length === 0 && (
                <div className="ml-8 text-sm text-gray-400 py-2">
                  Aucune question
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Progress Indicator */}
        <div className="p-6 border-t border-gray-200">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-red-500 font-medium">fausses</span>
            <span className="text-green-500 font-medium">corrects</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div
              className="bg-red-500 h-2 rounded-full"
              style={{
                width: `${(exam.completed / exam.totalQuestions) * 100}%`,
              }}
            ></div>
          </div>
          <div className="text-sm text-gray-600">
            {Math.round((exam.completed / exam.totalQuestions) * 100)}% Complete
          </div>
          <div className="text-sm text-gray-500">
            {exam.completed}/{exam.totalQuestions}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col pt-16 min-h-screen overflow-y-scroll">
        {/* Top Navigation Bar */}
        <div className="bg-blue-500 text-white px-8 py-3 w-[55vw] mx-auto">
          <div className="flex items-center justify-between">
            <div className="text-sm">sous module name &gt; year session</div>
          </div>
        </div>

        {/* Question Content */}
        <div className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            {/* Question Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-gray-600 font-medium">
                    {question.period} Q{question.id}
                  </span>
                  <span className="text-gray-400">|</span>
                  <span className="bg-black text-white px-3 py-1 rounded-full text-sm">
                    collective
                  </span>
                </div>

                <div className="flex items-center space-x-3">
                  <button className="p-2 bg-gray-100 rounded hover:bg-gray-200 transition-colors">
                    <div className="w-4 h-4 border-2 border-gray-400 rounded flex items-center justify-center">
                      <span className="text-xs">✓</span>
                    </div>
                  </button>

                  {/* Font Size Selector */}
                  <div className="relative font-size-selector">
                    <button
                      onClick={() => setShowFontSizeMenu(!showFontSizeMenu)}
                      className="p-2 bg-gray-100 rounded hover:bg-gray-200 transition-colors flex items-center space-x-2"
                    >
                      <ImFontSize className="w-4 h-4 text-gray-600" />
                      <span className="text-xs font-bold">
                        <span className="text-red-500">A</span>
                        <span className="text-gray-500">a</span>
                      </span>
                      <span className="text-xs text-gray-600 ml-1">
                        {fontSize}px
                      </span>
                    </button>

                    {showFontSizeMenu && (
                      <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[120px]">
                        <div className="p-2 border-b border-gray-100">
                          <div className="text-xs text-gray-600 mb-2">
                            Font Size
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={decreaseFontSize}
                              className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center hover:bg-gray-200"
                            >
                              <span className="text-xs">-</span>
                            </button>
                            <span className="text-xs font-medium">
                              {fontSize}px
                            </span>
                            <button
                              onClick={increaseFontSize}
                              className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center hover:bg-gray-200"
                            >
                              <span className="text-xs">+</span>
                            </button>
                          </div>
                        </div>
                        <button
                          onClick={resetFontSize}
                          className="w-full text-left px-2 py-1 text-xs text-gray-600 hover:bg-gray-50"
                        >
                          Reset to Default
                        </button>
                      </div>
                    )}
                  </div>

                  <button className="p-2 bg-gray-100 rounded hover:bg-gray-200 transition-colors">
                    <PiImagesSquareFill className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>

            {/* Question Box */}
            <div className="bg-orange-100 rounded-xl p-6 mb-8 relative">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-xs text-gray-600">JPEG</span>
                </div>
                <div className="flex-1">
                  <p
                    className="text-gray-800"
                    style={{ fontSize: `${fontSize}px` }}
                  >
                    {question.question}
                  </p>
                </div>
              </div>
              <div className="absolute top-[-15px] right-[50%] bg-gray-300 text-gray-600 px-2 py-1 rounded-full text-sm">
                {currentQuestion + 1}/{exam.totalQuestions}
              </div>
            </div>

            {/* Answer Options */}
            <div className="space-y-4 mb-8">
              {question.options.map((option, index) => {
                const answerKey = String.fromCharCode(65 + index);
                const currentQuestionAnswers =
                  selectedAnswers[currentQuestion] || [];
                const isSelected = currentQuestionAnswers.includes(answerKey);
                const isCorrect = question.correctAnswers.includes(answerKey);

                return (
                  <button
                    key={index}
                    onClick={() =>
                      !showResults && handleAnswerSelect(answerKey)
                    }
                    disabled={showResults}
                    className={`w-full p-4 border-2 rounded-xl text-left transition-all ${
                      showResults
                        ? getAnswerOptionStyle(answerKey, index)
                        : isSelected
                        ? "bg-blue-500 text-white border-blue-500"
                        : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                          showResults
                            ? isCorrect
                              ? "bg-green-600 text-white"
                              : isSelected
                              ? "bg-red-600 text-white"
                              : "bg-gray-300 text-gray-600"
                            : isSelected
                            ? "bg-orange-500 text-white"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {answerKey}
                      </div>
                      <span
                        className="font-medium"
                        style={{ fontSize: `${fontSize}px` }}
                      >
                        {option}
                      </span>
                      {showResults && getAnswerIcon(answerKey)}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Feedback Section */}
            {showResults && (
              <div className="mb-8">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    {getFeedbackMessage().icon}
                    <h3 className="text-lg font-semibold text-gray-900">
                      Résultat de votre réponse
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Feedback Element B - Incorrect/Unselected Correct */}
                    <div className="flex items-center space-x-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">B</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-red-800">
                          C'est lorsque l'utilisateur n'a pas sélectionné la
                          réponse correcte
                        </p>
                      </div>
                    </div>

                    {/* Feedback Element C - Correct Selection */}
                    <div className="flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">C</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-green-800">
                          C'est lorsque l'utilisateur a sélectionné la réponse
                          correcte
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-blue-800 text-sm">
                      {getFeedbackMessage().message}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between">
              <div></div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() =>
                    currentQuestion > 0 &&
                    setCurrentQuestion(currentQuestion - 1)
                  }
                  disabled={currentQuestion === 0}
                  className="p-3 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <FaArrowLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleCheckAnswer}
                  disabled={
                    !selectedAnswers[currentQuestion]?.length || showResults
                  }
                  className="bg-blue-500 text-white px-8 py-3 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {showResults ? "Réponse Vérifiée" : "Vérifier la Réponse"}
                </button>
                <button
                  onClick={() =>
                    currentQuestion < exam.questions.length - 1 &&
                    setCurrentQuestion(currentQuestion + 1)
                  }
                  disabled={currentQuestion === exam.questions.length - 1}
                  className="p-3 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <FaArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Explanation */}
            {showResults && <ExplicationModel question={question} />}
          </div>
        </div>
      </div>
      {editModelShow && <ResumeModel />}
      {help && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          exit={{ opacity: 0, scale: 0.5 }}
          className="absolute top-20 left-[330px] h-[100px]   grid grid-cols-2 p-4 gap-5 rounded-2xl bg-gray-100 border border-gray-300"
        >
          <div className="flex items-center gap-2">
            <div className="bg-green-500 h-5 w-5 rounded-full " />
            <span className="text-green-400">Answerd</span>
          </div>{" "}
          <div className="flex items-center gap-2">
            <div className="bg-red-500 h-5 w-5 rounded-full " />
            <span className="text-red-400">UnAnswerd</span>
          </div>{" "}
          <div className="flex items-center gap-2">
            <div className="bg-gray-500 h-5 w-5 rounded-full " />
            <span className="text-gray-400">Not Visited</span>
          </div>{" "}
          <div className="flex items-center gap-2">
            <div className="bg-purple-400 h-5 w-5 rounded-full " />
            <span className="text-purple-400">Review</span>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ExamPage;
