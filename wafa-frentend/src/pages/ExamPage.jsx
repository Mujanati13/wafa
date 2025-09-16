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
import { api } from "@/lib/utils";
import { LuAlignVerticalSpaceBetween } from "react-icons/lu";
import Spinner from "@/components/ui/Spinner";
import { Bookmark, LogOut, NotebookPen, TriangleAlert } from "lucide-react";
import ProfileMenu from "@/components/profile/ProfileMenu";
import IconWithTooltip from "@/components/ExamsPage/IconWithTooltip";

const ExamPage = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { examId } = useParams();
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [examCompleted, setExamCompleted] = useState(false);
  const [expandedPeriods, setExpandedPeriods] = useState({ janvier2024: true });
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [editModelShow, setEditModelShow] = useState(false);
  const [fontSize, setFontSize] = useState(16); // Default font size
  const [showFontSizeMenu, setShowFontSizeMenu] = useState(false);
  const [help, setHelp] = useState(false);
  const [examQuestionData, setExamQuestionData] = useState(null); // Backend exam data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);

  // Get current question from backend data
  const getCurrentQuestion = () => {
    if (!examQuestionData || !examQuestionData.questions) return null;

    // Flatten all questions from all sessions
    const allQuestions = [];
    Object.values(examQuestionData.questions).forEach((sessionQuestions) => {
      allQuestions.push(...sessionQuestions);
    });

    return allQuestions[currentQuestion] || null;
  };

  const question = getCurrentQuestion();

  // Generate exam periods from backend data
  const getExamPeriods = () => {
    if (!examQuestionData || !examQuestionData.questions) return [];

    return Object.entries(examQuestionData.questions).map(
      ([sessionLabel, questions]) => ({
        id: sessionLabel.toLowerCase().replace(/\s+/g, ""),
        label: sessionLabel,
        questions: questions.map((q, index) => ({
          id: q._id,
          status: "pending",
        })),
      })
    );
  };

  const examPeriods = getExamPeriods();

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
    const updatedAnswers = currentQuestionAnswers.includes(answerKey)
      ? currentQuestionAnswers.filter((key) => key !== answerKey)
      : [...currentQuestionAnswers, answerKey];

    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuestion]: updatedAnswers,
    });
  };

  const handleCheckAnswer = () => {
    setShowResults(true);
    setShowVerifyModal(true);
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
    setFontSize((prev) => Math.min(prev + 2, 20)); // Max 24px
  };

  const decreaseFontSize = () => {
    setFontSize((prev) => Math.max(prev - 2, 14)); // Min 12px
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
  // Fetch exam data from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get("exams/all/" + examId);
        setExamQuestionData(response.data.data);
      } catch (err) {
        setError("Failed to load exam data");
        console.error("Error fetching exam data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [examId]);

  // Check if answer is correct
  const isAnswerCorrect = () => {
    if (!question) return false;

    const userAnswers = selectedAnswers[currentQuestion] || [];
    const correctAnswers = question.options
      .map((option, index) =>
        option.isCorrect ? String.fromCharCode(65 + index) : null
      )
      .filter(Boolean);

    // Consider correct if every selected answer is correct and at least one was chosen
    if (userAnswers.length === 0) return false;
    const allSelectedAreCorrect = userAnswers.every((answer) =>
      correctAnswers.includes(answer)
    );
    const missedAnyCorrect = correctAnswers.some(
      (answer) => !userAnswers.includes(answer)
    );
    return allSelectedAreCorrect && !missedAnyCorrect;
  };

  // Get answer option styling based on correctness and selection
  const getAnswerOptionStyle = (answerKey, index) => {
    if (!question)
      return "bg-white text-gray-700 border-gray-200 hover:bg-gray-50";

    const currentQuestionAnswers = selectedAnswers[currentQuestion] || [];
    const isSelected = currentQuestionAnswers.includes(answerKey);
    const isCorrect = question.options[index]?.isCorrect || false;

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
  const getAnswerIcon = (answerKey, index) => {
    if (!question) return null;

    const currentQuestionAnswers = selectedAnswers[currentQuestion] || [];
    const isSelected = currentQuestionAnswers.includes(answerKey);
    const isCorrect = question.options[index]?.isCorrect || false;

    if (showResults) {
      if (isCorrect) {
        return <FaCheck className="w-3 h-3 text-white" />;
      } else if (isSelected) {
        return <FaTimes className="w-3 h-3 text-white" />;
      }
    }

    // Check if this is a multiple choice question (more than one correct answer)
    const correctAnswersCount = question.options.filter(
      (opt) => opt.isCorrect
    ).length;
    if (correctAnswersCount > 1) {
      return isSelected ? <FaCheck className="w-3 h-3" /> : null;
    }

    return null;
  };

  // Get feedback message based on user's answer
  const getFeedbackMessage = () => {
    if (!question) {
      return {
        type: "incorrect",
        message: "Question non disponible.",
        icon: <FaTimesCircle className="w-5 h-5 text-red-500" />,
      };
    }

    const userAnswers = selectedAnswers[currentQuestion] || [];
    const correctAnswers = question.options
      .map((option, index) =>
        option.isCorrect ? String.fromCharCode(65 + index) : null
      )
      .filter(Boolean);

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

  // Show loading state
  if (loading) {
    return (
      <div className="h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Spinner color="black" />
          <p className="text-gray-600">Chargement de l'examen...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="max-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <p className="text-red-600 text-lg mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  // Show no data state
  if (!examQuestionData || !question) {
    return (
      <div className="max-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-500 text-6xl mb-4">📝</div>
          <p className="text-gray-600 text-lg">
            Aucune question trouvée pour cet examen.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-h-screen bg-gray-50 flex relative overflow-hidden">
      {/* Top Header Bar */}
      <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
        <div className="flex items-center justify-between px-6 py-4">
          {/* Left - Logo and App Name */}
          <div className="flex items-center space-x-3">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-teal-500 to-blue-600 text-2xl font-bold tracking-wide drop-shadow-sm select-none">
              WAFA
            </span>
          </div>

          {/* Center - App Name */}
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-gray-900 text-[25px]">
              {examQuestionData?.moduleName || "Examen"}
            </span>
          </div>

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
              <LogOut />
            </span>
            <ProfileMenu isOpen={isOpen} setIsOpen={setIsOpen} />
          </div>
        </div>
      </div>

      {/* Left Sidebar */}
      <div
        className={`${
          isSidebarCollapsed ? "w-0" : "w-[255px]"
        } bg-white border-r border-gray-200 flex flex-col pt-16 max-h-screen relative transition-all duration-300 `}
      >
        {/* Collapse/Expand Handle */}
        <button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="absolute -right-3 top-24 z-50 w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center shadow hover:bg-blue-600 transition-colors"
          title={isSidebarCollapsed ? "Expand" : "Collapse"}
        >
          <FaChevronRight
            className={`w-3 h-3 transition-transform  ${
              !isSidebarCollapsed ? "rotate-180" : "rotate-0"
            }`}
          />
        </button>
        {/* Legend */}
        {!isSidebarCollapsed && (
          <div className="px-4 pt-4">
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-3 flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-gray-300"></span>
                <span className="text-gray-500 text-sm">not visited</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-orange-400"></span>
                <span className="text-orange-500 text-sm">unanswered</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-purple-500"></span>
                <span className="text-purple-500 text-sm">review</span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Items */}
        {!isSidebarCollapsed && (
          <div className="flex-1 overflow-y-auto  space-y-3">
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
                  <IoIosArrowForward
                    className={`w-4 h-4 transition-transform ${
                      expandedPeriods[period.id] ? "rotate-90" : "rotate-0"
                    } ${
                      period.id === "normal2022"
                        ? "text-blue-600"
                        : "text-gray-500"
                    }`}
                  />
                  <span className="font-medium">{period.label}</span>
                </button>

                {expandedPeriods[period.id] && period.questions.length > 0 && (
                  <div className="ml-8 mt-2">
                    <div className="grid grid-cols-3 gap-1">
                      {period.questions.map((q, index) => {
                        const isCurrentQuestion = q.id === question?._id;
                        const dotColor = isCurrentQuestion
                          ? "bg-blue-500"
                          : "bg-orange-300";

                        return (
                          <button
                            key={q.id}
                            onClick={() => {
                              const allQuestions = [];
                              Object.values(examQuestionData.questions).forEach(
                                (sessionQuestions) => {
                                  allQuestions.push(...sessionQuestions);
                                }
                              );
                              const questionIndex = allQuestions.findIndex(
                                (eq) => eq._id === q.id
                              );
                              if (questionIndex !== -1)
                                setCurrentQuestion(questionIndex);
                            }}
                            className={`flex items-center gap-2 text-[13px] ${
                              isCurrentQuestion
                                ? "text-blue-700 font-semibold"
                                : "text-gray-700 hover:text-gray-900"
                            }`}
                          >
                            <span
                              className={`w-5 h-5 rounded-full ${dotColor}`}
                            ></span>
                            <span>{index + 1}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {expandedPeriods[period.id] &&
                  period.questions.length === 0 && (
                    <div className="ml-8 text-sm text-gray-400 py-2">
                      Aucune question
                    </div>
                  )}
              </div>
            ))}
          </div>
        )}

        {/* Progress Indicator */}
        {!isSidebarCollapsed && (
          <div className="p-6 border-t border-gray-200">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-red-500 font-medium">fausses</span>
              <span className="text-green-500 font-medium">corrects</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div
                className="bg-red-500 h-2 rounded-full"
                style={{
                  width: `${
                    examQuestionData?.totalQuestions
                      ? (currentQuestion / examQuestionData.totalQuestions) *
                        100
                      : 0
                  }%`,
                }}
              ></div>
            </div>
            <div className="text-sm text-gray-600">
              {examQuestionData?.totalQuestions
                ? Math.round(
                    (currentQuestion / examQuestionData.totalQuestions) * 100
                  )
                : 0}
              % Complete
            </div>
            <div className="text-sm text-gray-500">
              {currentQuestion + 1}/{examQuestionData?.totalQuestions || 0}
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col pt-16 min-h-screen overflow-y-scroll w-[80vw]">
        {/* Top Navigation Bar */}
        <div className="text-white px-8 py-3 w-[1103px] mx-auto mt-[60px] bg-[#00a8f3] rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="text-sm">
              {examQuestionData?.moduleName || "Module"} &gt;{" "}
              {examQuestionData?.year || "Année"} -{" "}
              {examQuestionData?.name || "Session"}
            </div>
            <div className=" flex gap-2.5">
              <IconWithTooltip Icon={Bookmark} label={"ajouter a playlist"} />
              <IconWithTooltip Icon={NotebookPen} label={"ajouter une note"} />
              <IconWithTooltip Icon={TriangleAlert} label={"Signaler"} />
            </div>
          </div>
        </div>

        {/* Question Content */}
        <div className="flex-1 p-8 overflow-y-auto">
          <div className="w-[1103px] mx-auto">
            {/* Question Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-gray-600 font-medium">
                    {question?.sessionLabel || "Session"} Q{currentQuestion + 1}
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
            <div
              className="rounded-xl p-6 mb-8 relative"
              style={{ backgroundColor: "#f9ddad" }}
            >
              <div className="flex items-start space-x-4">
                {question?.images && question.images.length > 0 ? (
                  <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                    <span className="text-xs text-gray-600">IMG</span>
                  </div>
                ) : (
                  <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                    <span className="text-xs text-gray-600">TXT</span>
                  </div>
                )}
                <div className="flex-1">
                  <p
                    className="text-gray-800"
                    style={{ fontSize: `${fontSize}px` }}
                  >
                    {question?.text || "Question non disponible"}
                  </p>
                </div>
              </div>
              <div className="absolute top-[-15px] right-[50%] bg-white text-blue-600 px-2 py-1 rounded-full text-sm">
                {currentQuestion + 1}/{examQuestionData?.totalQuestions || 0}
              </div>
            </div>

            {/* Answer Options */}
            <div className="space-y-3 mb-8">
              {question?.options?.map((option, index) => {
                const answerKey = String.fromCharCode(65 + index);
                const currentQuestionAnswers =
                  selectedAnswers[currentQuestion] || [];
                const isSelected = currentQuestionAnswers.includes(answerKey);
                const isCorrect = option.isCorrect || false;

                return (
                  <button
                    key={index}
                    onClick={() =>
                      !showResults && handleAnswerSelect(answerKey)
                    }
                    disabled={showResults}
                    className={`w-full rounded-[10px] text-left transition-all border overflow-hidden ${
                      showResults
                        ? ""
                        : isSelected
                        ? "text-white"
                        : "text-gray-700"
                    }`}
                    style={
                      showResults
                        ? // Results styles
                          isCorrect && isSelected
                          ? {
                              backgroundColor: "#28a89b",
                              borderColor: "#28a89b",
                              color: "#ffffff",
                            }
                          : isCorrect && !isSelected
                          ? {
                              backgroundColor: "#ffffff",
                              borderColor: "#298e7e",
                              color: "#298e7e",
                            }
                          : !isCorrect && isSelected
                          ? {
                              backgroundColor: "#cf4d65",
                              borderColor: "#cf4d65",
                              color: "#ffffff",
                            }
                          : {
                              backgroundColor: "#f3f4f6",
                              borderColor: "#e5e7eb",
                              color: "#374151",
                            }
                        : // Pre-submit styles
                        isSelected
                        ? { backgroundColor: "#276fc9", borderColor: "#276fc9" }
                        : { backgroundColor: "#f3f4f6", borderColor: "#e5e7eb" }
                    }
                  >
                    <div
                      className="flex items-center gap-3 px-4"
                      style={{ minHeight: "55px" }}
                    >
                      <div
                        className="w-7 h-7 rounded-full border flex items-center justify-center text-xs font-semibold"
                        style={{
                          backgroundColor: showResults
                            ? isCorrect && isSelected
                              ? "#0c8381"
                              : !isCorrect && isSelected
                              ? "#ac1429"
                              : isCorrect && !isSelected
                              ? "#298e7e"
                              : "#ffffff"
                            : isSelected
                            ? "#f59e0b"
                            : "#ffffff",
                          color: showResults
                            ? isCorrect || isSelected
                              ? "#ffffff"
                              : "#374151"
                            : isSelected
                            ? "#ffffff"
                            : "#374151",
                          borderColor: showResults
                            ? isCorrect || isSelected
                              ? "transparent"
                              : "#d1d5db"
                            : isSelected
                            ? "transparent"
                            : "#d1d5db",
                          borderWidth: 1,
                        }}
                      >
                        {answerKey}
                      </div>

                      <span
                        className="font-medium"
                        style={{ fontSize: `${fontSize}px` }}
                      >
                        {option.text}
                      </span>
                      {showResults && (
                        <span className="ml-auto">
                          {getAnswerIcon(answerKey, index)}
                        </span>
                      )}
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
                  onClick={() => {
                    const allQuestions = [];
                    Object.values(examQuestionData.questions).forEach(
                      (sessionQuestions) => {
                        allQuestions.push(...sessionQuestions);
                      }
                    );
                    if (currentQuestion < allQuestions.length - 1) {
                      setCurrentQuestion(currentQuestion + 1);
                    }
                  }}
                  disabled={
                    currentQuestion >=
                    (examQuestionData?.totalQuestions || 0) - 1
                  }
                  className="p-3 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <FaArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Explanation */}
            {(showResults || showExplanation) && (
              <ExplicationModel question={question} />
            )}
          </div>
        </div>
      </div>
      {editModelShow && <ResumeModel />}
      {/* Verify Modal */}
      {showVerifyModal && (
        <div className="absolute   z-[60] bg-white h-[100px] ">
          <div
            className="absolute inset-0"
            onClick={() => setShowVerifyModal(false)}
          ></div>
          <div className="absolute left-0 right-0 bottom-4 flex items-center justify-center gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-red-600 shadow-lg shadow-red-300/40 flex items-center justify-center text-white text-2xl font-bold">
                ×
              </div>
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-green-600 shadow-lg shadow-green-300/40 flex items-center justify-center text-white text-2xl font-bold">
                ✓
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-4">
              <button
                className="w-9 h-9 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                onClick={() => {
                  const prevIndex = Math.max(0, currentQuestion - 1);
                  setCurrentQuestion(prevIndex);
                }}
              >
                ←
              </button>
              <button
                className="w-9 h-9 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                onClick={() => {
                  const allQuestions = [];
                  Object.values(examQuestionData.questions).forEach(
                    (sessionQuestions) => {
                      allQuestions.push(...sessionQuestions);
                    }
                  );
                  const nextIndex = Math.min(
                    allQuestions.length - 1,
                    currentQuestion + 1
                  );
                  setCurrentQuestion(nextIndex);
                }}
              >
                →
              </button>
              <button
                className="px-5 py-2 rounded-full border border-gray-400 text-gray-900 bg-white hover:bg-gray-50 shadow-sm"
                onClick={() => setShowVerifyModal(false)}
              >
                communité
              </button>
              <button
                className="px-5 py-2 rounded-full border border-blue-400 text-blue-700 bg-white hover:bg-blue-50 shadow-sm"
                onClick={() => {
                  setShowExplanation(true);
                  setShowVerifyModal(false);
                }}
              >
                Explication
              </button>
              <button
                className="px-5 py-2 rounded-full border border-gray-400 text-gray-900 bg-white hover:bg-gray-50 shadow-sm"
                onClick={() => {
                  setSelectedAnswers({
                    ...selectedAnswers,
                    [currentQuestion]: [],
                  });
                  setShowResults(false);
                  setShowVerifyModal(false);
                }}
              >
                Ressayer
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Help legend overlay removed; legend moved inside sidebar */}
    </div>
  );
};

export default ExamPage;
