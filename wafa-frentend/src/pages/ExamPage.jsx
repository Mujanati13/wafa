import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Clock,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Flag,
  BookOpen,
  AlertCircle,
  CheckCircle2,
  XCircle,
  NotebookPen,
  TriangleAlert,
  Lightbulb,
  Plus,
  Minus,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Trophy,
  Target,
  Zap,
  Star,
  Timer,
  ListChecks,
  Keyboard,
  Volume2,
  VolumeX,
  Sparkles,
  Award,
  TrendingUp,
  CircleDot,
  CheckCircle,
  Circle,
  ArrowRight,
  Home,
  RefreshCcw,
  Share2,
  Download,
  Eye,
  EyeOff,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { api } from "@/lib/utils";
import { cn } from "@/lib/utils";
import ExplicationModel from "@/components/ExamsPage/ExplicationModel";
import NoteModal from "@/components/ExamsPage/NoteModal";
import ReportModal from "@/components/ExamsPage/ReportModal";
import CommunityModal from "@/components/ExamsPage/CommunityModal";

// Confetti function (simple implementation without external library)
const triggerConfetti = () => {
  const colors = ['#3B82F6', '#6366F1', '#8B5CF6', '#EC4899', '#10B981'];
  const confettiCount = 100;
  
  for (let i = 0; i < confettiCount; i++) {
    const confetti = document.createElement('div');
    confetti.style.cssText = `
      position: fixed;
      width: 10px;
      height: 10px;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      left: ${Math.random() * 100}vw;
      top: -10px;
      border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
      pointer-events: none;
      z-index: 9999;
      animation: confetti-fall ${2 + Math.random() * 2}s linear forwards;
    `;
    document.body.appendChild(confetti);
    setTimeout(() => confetti.remove(), 4000);
  }
};

// Add confetti animation styles
const style = document.createElement('style');
style.textContent = `
  @keyframes confetti-fall {
    0% { transform: translateY(0) rotate(0deg); opacity: 1; }
    100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
  }
`;
document.head.appendChild(style);

const ExamPage = () => {
  const { t } = useTranslation(['dashboard', 'common']);
  const { examId } = useParams();
  const navigate = useNavigate();
  
  // Core state
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [examData, setExamData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [flaggedQuestions, setFlaggedQuestions] = useState(new Set());
  const [showSidebar, setShowSidebar] = useState(false);
  
  // Modal states
  const [showExplanation, setShowExplanation] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [showCommunityModal, setShowCommunityModal] = useState(false);
  
  // Verification state - per question
  const [verifiedQuestions, setVerifiedQuestions] = useState({});
  const [validationError, setValidationError] = useState(null);
  
  // UI preferences
  const [fontSize, setFontSize] = useState(() => {
    const saved = localStorage.getItem('examFontSize');
    return saved ? parseInt(saved) : 16;
  });
  const [collapsedSessions, setCollapsedSessions] = useState(new Set());
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  // Animation states
  const [answerAnimation, setAnswerAnimation] = useState(null);
  const [questionTransition, setQuestionTransition] = useState('next');

  // Sound effects placeholder
  const playSound = useCallback((type) => {
    if (!soundEnabled) return;
    // Sound implementation would go here
  }, [soundEnabled]);

  // Timer
  useEffect(() => {
    if (showResults) return;
    const timer = setInterval(() => {
      setTimeElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [showResults]);

  // Fetch exam data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await api.get(`exams/all/${examId}`);
        setExamData(response.data.data);
        
        // Restore progress
        const savedProgress = localStorage.getItem(`exam_progress_${examId}`);
        if (savedProgress) {
          const { answers, currentQ, timeSpent, flags } = JSON.parse(savedProgress);
          setSelectedAnswers(answers || {});
          setCurrentQuestion(currentQ || 0);
          setTimeElapsed(timeSpent || 0);
          setFlaggedQuestions(new Set(flags || []));
          toast.success(t('dashboard:progress_restored') || 'Progress restored', {
            icon: <CheckCircle2 className="h-4 w-4 text-green-500" />
          });
        }
      } catch (err) {
        setError(t('dashboard:failed_load_exam') || 'Failed to load exam');
        toast.error(t('dashboard:failed_load_exam') || 'Failed to load exam');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [examId, t]);

  // Auto-save progress
  useEffect(() => {
    if (!examData || showResults) return;
    
    const saveProgress = () => {
      const progress = {
        answers: selectedAnswers,
        currentQ: currentQuestion,
        timeSpent: timeElapsed,
        flags: Array.from(flaggedQuestions)
      };
      localStorage.setItem(`exam_progress_${examId}`, JSON.stringify(progress));
    };

    const saveTimer = setTimeout(saveProgress, 1000);
    return () => clearTimeout(saveTimer);
  }, [selectedAnswers, currentQuestion, timeElapsed, flaggedQuestions, examId, examData, showResults]);

  // Warn before leaving
  useEffect(() => {
    if (!examData || showResults) return;

    const handleBeforeUnload = (e) => {
      if (Object.keys(selectedAnswers).length > 0) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [selectedAnswers, showResults, examData]);

  // Get all questions
  const questions = useMemo(() => {
    if (!examData?.questions) return [];
    const allQuestions = [];
    Object.entries(examData.questions).forEach(([sessionName, sessionQuestions]) => {
      sessionQuestions.forEach(q => {
        allQuestions.push({ ...q, sessionLabel: sessionName });
      });
    });
    return allQuestions;
  }, [examData]);

  const currentQuestionData = questions[currentQuestion];

  // Format time with color states
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeColor = () => {
    if (timeElapsed > 3600) return 'text-red-600 bg-red-50 border-red-200';
    if (timeElapsed > 1800) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-emerald-600 bg-emerald-50 border-emerald-200';
  };

  // Handle answer selection
  const handleAnswerSelect = useCallback((questionIndex, optionIndex) => {
    const question = questions[questionIndex];
    if (!question || showResults) return;

    setAnswerAnimation({ questionIndex, optionIndex });
    setTimeout(() => setAnswerAnimation(null), 300);

    const correctCount = question.options.filter(opt => opt.isCorrect).length;
    const isMultipleChoice = correctCount > 1;

    if (isMultipleChoice) {
      const current = selectedAnswers[questionIndex] || [];
      const updated = current.includes(optionIndex)
        ? current.filter(i => i !== optionIndex)
        : [...current, optionIndex];
      setSelectedAnswers({ ...selectedAnswers, [questionIndex]: updated });
    } else {
      setSelectedAnswers({ ...selectedAnswers, [questionIndex]: [optionIndex] });
    }

    playSound('select');
  }, [questions, selectedAnswers, showResults, playSound]);

  // Toggle flag
  const toggleFlag = useCallback((index) => {
    const newFlags = new Set(flaggedQuestions);
    if (newFlags.has(index)) {
      newFlags.delete(index);
      toast.info(t('dashboard:flag_removed') || 'Flag removed');
    } else {
      newFlags.add(index);
      toast.warning(t('dashboard:question_flagged') || 'Question flagged for review');
    }
    setFlaggedQuestions(newFlags);
    playSound('flag');
  }, [flaggedQuestions, playSound, t]);

  // Verify current question - show answer without submitting full exam
  const handleVerifyQuestion = useCallback(() => {
    const hasAnswer = selectedAnswers[currentQuestion]?.length > 0;
    if (!hasAnswer) {
      setValidationError("At least select an option");
      setTimeout(() => setValidationError(null), 3000);
      return;
    }
    
    setVerifiedQuestions(prev => ({
      ...prev,
      [currentQuestion]: true
    }));
    playSound('select');
  }, [currentQuestion, selectedAnswers, playSound]);

  // Reset current question verification
  const handleResetQuestion = useCallback(() => {
    setSelectedAnswers(prev => {
      const newAnswers = { ...prev };
      delete newAnswers[currentQuestion];
      return newAnswers;
    });
    setVerifiedQuestions(prev => {
      const newVerified = { ...prev };
      delete newVerified[currentQuestion];
      return newVerified;
    });
  }, [currentQuestion]);

  // Check if current question is verified
  const isQuestionVerified = verifiedQuestions[currentQuestion] || false;

  // Font size controls
  const adjustFontSize = useCallback((delta) => {
    const newSize = Math.min(24, Math.max(12, fontSize + delta));
    setFontSize(newSize);
    localStorage.setItem('examFontSize', newSize.toString());
  }, [fontSize]);

  // Navigation
  const goToNext = useCallback(() => {
    if (currentQuestion < questions.length - 1) {
      setQuestionTransition('next');
      setCurrentQuestion(currentQuestion + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentQuestion, questions.length]);

  const goToPrevious = useCallback(() => {
    if (currentQuestion > 0) {
      setQuestionTransition('prev');
      setCurrentQuestion(currentQuestion - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentQuestion]);

  const goToQuestion = useCallback((index) => {
    setQuestionTransition(index > currentQuestion ? 'next' : 'prev');
    setCurrentQuestion(index);
    setShowSidebar(false);
  }, [currentQuestion]);

  // Calculate score
  const calculateScore = useCallback(() => {
    let correct = 0;
    questions.forEach((question, index) => {
      const userAnswers = selectedAnswers[index] || [];
      const correctAnswers = question.options
        .map((opt, i) => opt.isCorrect ? i : -1)
        .filter(i => i !== -1);
      
      const isCorrect = userAnswers.length === correctAnswers.length &&
        userAnswers.every(ans => correctAnswers.includes(ans));
      
      if (isCorrect) correct++;
    });
    return { correct, total: questions.length };
  }, [questions, selectedAnswers]);

  // Submit exam
  const handleSubmit = useCallback(() => {
    setShowResults(true);
    setShowConfirmSubmit(false);
    localStorage.removeItem(`exam_progress_${examId}`);
    
    const score = calculateScore();
    const percentage = Math.round((score.correct / score.total) * 100);
    
    // Trigger confetti for good scores
    if (percentage >= 70) {
      triggerConfetti();
    }
    
    playSound('complete');
    toast.success(t('dashboard:exam_completed') || 'Exam completed!', {
      icon: <Trophy className="h-4 w-4 text-yellow-500" />
    });
  }, [examId, playSound, t, calculateScore]);

  // Retry exam
  const handleRetry = useCallback(() => {
    setSelectedAnswers({});
    setCurrentQuestion(0);
    setTimeElapsed(0);
    setShowResults(false);
    setFlaggedQuestions(new Set());
    localStorage.removeItem(`exam_progress_${examId}`);
    toast.info(t('dashboard:new_attempt_started') || 'New attempt started');
  }, [examId, t]);

  const score = useMemo(() => calculateScore(), [calculateScore]);
  const progress = useMemo(() => 
    (Object.keys(selectedAnswers).length / Math.max(questions.length, 1)) * 100,
    [selectedAnswers, questions.length]
  );

  // Get question status
  const getQuestionStatus = useCallback((index) => {
    const hasAnswer = selectedAnswers[index]?.length > 0;
    const isFlagged = flaggedQuestions.has(index);
    
    if (showResults) {
      const question = questions[index];
      const userAnswers = selectedAnswers[index] || [];
      const correctAnswers = question.options
        .map((opt, i) => opt.isCorrect ? i : -1)
        .filter(i => i !== -1);
      
      const isCorrect = userAnswers.length === correctAnswers.length &&
        userAnswers.every(ans => correctAnswers.includes(ans));
      
      return { status: isCorrect ? 'correct' : 'incorrect', isFlagged };
    }
    return { status: hasAnswer ? 'answered' : 'unanswered', isFlagged };
  }, [selectedAnswers, flaggedQuestions, questions, showResults]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      
      switch(e.key) {
        case 'ArrowRight':
          if (!showResults) goToNext();
          break;
        case 'ArrowLeft':
          goToPrevious();
          break;
        case 'f':
        case 'F':
          toggleFlag(currentQuestion);
          break;
        case '1': case '2': case '3': case '4': case '5':
          if (!showResults && currentQuestionData?.options[parseInt(e.key) - 1]) {
            handleAnswerSelect(currentQuestion, parseInt(e.key) - 1);
          }
          break;
        case '?':
          setShowKeyboardShortcuts(true);
          break;
        case 'Escape':
          setShowKeyboardShortcuts(false);
          setShowSidebar(false);
          setShowConfirmSubmit(false);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentQuestion, goToNext, goToPrevious, toggleFlag, handleAnswerSelect, showResults, currentQuestionData]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-6"
        >
          <div className="relative">
            <div className="w-20 h-20 border-4 border-blue-200 rounded-full animate-pulse mx-auto" />
            <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-blue-600 rounded-full animate-spin mx-auto" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-gray-800">{t('dashboard:exam_loading') || 'Loading exam...'}</h3>
            <p className="text-gray-500">{t('dashboard:preparing_questions') || 'Preparing your questions'}</p>
          </div>
        </motion.div>
      </div>
    );
  }

  // Error state
  if (error || !currentQuestionData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="max-w-md w-full shadow-xl border-0">
            <CardContent className="pt-8 text-center space-y-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-gray-800">{t('dashboard:exam_error') || 'Exam Error'}</h3>
                <p className="text-gray-500">{error || t('dashboard:exam_not_found') || 'Exam not found'}</p>
              </div>
              <Button onClick={() => navigate('/dashboard/home')} className="w-full">
                <Home className="mr-2 h-4 w-4" />
                {t('dashboard:back_to_dashboard') || 'Back to Dashboard'}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  const isMultipleChoice = currentQuestionData.options.filter(opt => opt.isCorrect).length > 1;
  const answeredCount = Object.keys(selectedAnswers).length;
  const flaggedCount = flaggedQuestions.size;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      {/* Enhanced Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Left Section */}
            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => navigate('/dashboard/home')}
                className="shrink-0 hover:bg-gray-100"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="min-w-0">
                <h1 className="font-semibold text-sm sm:text-lg truncate text-gray-900">
                  {examData?.title || t('dashboard:exam')}
                </h1>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="hidden sm:inline">{t('dashboard:question') || 'Question'}</span>
                  <span className="font-medium text-gray-700">
                    {currentQuestion + 1} / {questions.length}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Timer Badge */}
              <Badge 
                variant="outline" 
                className={cn(
                  "gap-1.5 font-mono text-xs sm:text-sm px-2 sm:px-3 py-1 transition-colors",
                  getTimeColor()
                )}
              >
                <Timer className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{formatTime(timeElapsed)}</span>
                <span className="sm:hidden">{formatTime(timeElapsed).split(':').slice(-2).join(':')}</span>
              </Badge>

              {/* Font Size Controls - Desktop */}
              <div className="hidden lg:flex items-center gap-0.5 bg-gray-100 rounded-lg p-0.5">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 hover:bg-white"
                  onClick={() => adjustFontSize(-2)}
                  disabled={fontSize <= 12}
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="text-xs px-2 font-medium text-gray-600 min-w-[3rem] text-center">
                  {fontSize}px
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 hover:bg-white"
                  onClick={() => adjustFontSize(2)}
                  disabled={fontSize >= 24}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>

              {/* Overview Button - Desktop */}
              <Button 
                variant="outline" 
                size="sm" 
                className="hidden lg:flex gap-2"
                onClick={() => setShowSidebar(!showSidebar)}
              >
                <ListChecks className="h-4 w-4" />
                {t('dashboard:overview') || 'Overview'}
              </Button>

              {/* Keyboard Shortcuts */}
              <Button
                variant="ghost"
                size="icon"
                className="hidden md:flex"
                onClick={() => setShowKeyboardShortcuts(true)}
                title="Keyboard shortcuts"
              >
                <Keyboard className="h-4 w-4" />
              </Button>

              {/* Submit Button */}
              {!showResults && (
                <Button 
                  onClick={() => setShowConfirmSubmit(true)}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25"
                >
                  <CheckCircle className="mr-1.5 h-4 w-4" />
                  <span className="hidden sm:inline">{t('dashboard:finish_exam') || 'Finish'}</span>
                  <span className="sm:hidden">Done</span>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-1 bg-gray-100">
          <motion.div 
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="grid lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Main Question Area */}
          <div className="lg:col-span-3 space-y-4 sm:space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4">
              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg shadow-blue-500/20">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-xs sm:text-sm">{t('dashboard:answered') || 'Answered'}</p>
                      <p className="text-xl sm:text-2xl font-bold">{answeredCount}/{questions.length}</p>
                    </div>
                    <div className="h-10 w-10 sm:h-12 sm:w-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-amber-500 to-orange-500 text-white border-0 shadow-lg shadow-amber-500/20">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-amber-100 text-xs sm:text-sm">{t('dashboard:flagged') || 'Flagged'}</p>
                      <p className="text-xl sm:text-2xl font-bold">{flaggedCount}</p>
                    </div>
                    <div className="h-10 w-10 sm:h-12 sm:w-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <Flag className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-emerald-500 to-teal-500 text-white border-0 shadow-lg shadow-emerald-500/20">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-emerald-100 text-xs sm:text-sm">{t('dashboard:remaining') || 'Remaining'}</p>
                      <p className="text-xl sm:text-2xl font-bold">{questions.length - answeredCount}</p>
                    </div>
                    <div className="h-10 w-10 sm:h-12 sm:w-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <Circle className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Question Card */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestion}
                initial={{ opacity: 0, x: questionTransition === 'next' ? 50 : -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: questionTransition === 'next' ? -50 : 50 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                <Card className="shadow-xl border-0 overflow-hidden">
                  {/* Question Header */}
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100/50 border-b px-4 sm:px-6 py-3 sm:py-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 font-semibold">
                          Q{currentQuestion + 1}
                        </Badge>
                        {currentQuestionData.sessionLabel && (
                          <Badge variant="outline" className="text-gray-600">
                            {currentQuestionData.sessionLabel}
                          </Badge>
                        )}
                        {isMultipleChoice && (
                          <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            {t('dashboard:multiple_choice') || 'Multiple'}
                          </Badge>
                        )}
                        {flaggedQuestions.has(currentQuestion) && (
                          <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 gap-1">
                            <Flag className="h-3 w-3 fill-current" />
                            {t('dashboard:flagged') || 'Flagged'}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setShowNoteModal(true)}
                          className="shrink-0 text-gray-400 hover:text-blue-600 hover:bg-blue-50 h-8 w-8"
                          title="Note"
                        >
                          <NotebookPen className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setShowReportModal(true)}
                          className="shrink-0 text-gray-400 hover:text-red-600 hover:bg-red-50 h-8 w-8"
                          title="Signaler"
                        >
                          <TriangleAlert className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleFlag(currentQuestion)}
                          className={cn(
                            "shrink-0 transition-all h-8 w-8",
                            flaggedQuestions.has(currentQuestion) 
                              ? "text-amber-500 hover:text-amber-600 hover:bg-amber-50" 
                              : "text-gray-400 hover:text-gray-600"
                          )}
                          title="Surligner"
                        >
                          <Flag className={cn(
                            "h-4 w-4 transition-transform",
                            flaggedQuestions.has(currentQuestion) && "fill-current scale-110"
                          )} />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <CardContent className="p-4 sm:p-6 space-y-6">
                    {/* Question Text */}
                    <div 
                      className="text-gray-800 leading-relaxed font-medium"
                      style={{ fontSize: `${fontSize}px`, lineHeight: '1.7' }}
                    >
                      {currentQuestionData.question}
                    </div>

                    {/* Question Image */}
                    {currentQuestionData.image && (
                      <div className="relative rounded-xl overflow-hidden border bg-gray-50">
                        <img 
                          src={currentQuestionData.image} 
                          alt="Question illustration"
                          className="w-full max-h-80 object-contain"
                        />
                      </div>
                    )}

                    {/* Answer Options */}
                    <div className="space-y-3">
                      {currentQuestionData.options.map((option, index) => {
                        const isSelected = (selectedAnswers[currentQuestion] || []).includes(index);
                        const isCorrect = option.isCorrect;
                        const showCorrectness = showResults || isQuestionVerified;
                        const isAnimating = answerAnimation?.questionIndex === currentQuestion && 
                                           answerAnimation?.optionIndex === index;

                        return (
                          <motion.button
                            key={index}
                            whileHover={{ scale: showCorrectness ? 1 : 1.01 }}
                            whileTap={{ scale: showCorrectness ? 1 : 0.99 }}
                            animate={isAnimating ? { scale: [1, 1.02, 1] } : {}}
                            className={cn(
                              "w-full text-left rounded-xl border-2 transition-all duration-200",
                              "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                              !showCorrectness && "hover:shadow-md cursor-pointer",
                              showCorrectness && "cursor-default",
                              // Default state
                              !isSelected && !showCorrectness && "border-gray-200 bg-white hover:border-gray-300",
                              // Selected state (before results)
                              isSelected && !showCorrectness && "border-blue-500 bg-blue-50 shadow-md shadow-blue-100",
                              // Correct answer (results)
                              showCorrectness && isCorrect && "border-emerald-500 bg-emerald-50",
                              // Wrong answer selected (results)
                              showCorrectness && !isCorrect && isSelected && "border-red-500 bg-red-50"
                            )}
                            onClick={() => !showCorrectness && handleAnswerSelect(currentQuestion, index)}
                            disabled={showCorrectness}
                          >
                            <div className="p-3 sm:p-4 flex items-start gap-3 sm:gap-4">
                              {/* Option Letter/Icon */}
                              <div className={cn(
                                "shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-semibold text-sm sm:text-base transition-all",
                                !isSelected && !showCorrectness && "bg-gray-100 text-gray-600",
                                isSelected && !showCorrectness && "bg-blue-500 text-white",
                                showCorrectness && isCorrect && "bg-emerald-500 text-white",
                                showCorrectness && !isCorrect && isSelected && "bg-red-500 text-white"
                              )}>
                                {showCorrectness ? (
                                  isCorrect ? (
                                    <Check className="h-4 w-4 sm:h-5 sm:w-5" />
                                  ) : isSelected ? (
                                    <X className="h-4 w-4 sm:h-5 sm:w-5" />
                                  ) : (
                                    String.fromCharCode(65 + index)
                                  )
                                ) : (
                                  isSelected ? (
                                    isMultipleChoice ? (
                                      <Check className="h-4 w-4 sm:h-5 sm:w-5" />
                                    ) : (
                                      <CircleDot className="h-4 w-4 sm:h-5 sm:w-5" />
                                    )
                                  ) : (
                                    String.fromCharCode(65 + index)
                                  )
                                )}
                              </div>

                              {/* Option Text */}
                              <span 
                                className="flex-1 pt-1"
                                style={{ fontSize: `${fontSize - 1}px` }}
                              >
                                {option.text}
                              </span>

                              {/* Result Icon */}
                              {showCorrectness && (
                                <div className="shrink-0">
                                  {isCorrect ? (
                                    <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-500" />
                                  ) : isSelected ? (
                                    <XCircle className="h-5 w-5 sm:h-6 sm:w-6 text-red-500" />
                                  ) : null}
                                </div>
                              )}
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  </CardContent>

                  {/* Bottom Action Toolbar */}
                  <div className="bg-white border-t">
                    <div className="flex items-center justify-center">
                      {/* Correct/Verifier Button */}
                      <button
                        onClick={handleVerifyQuestion}
                        disabled={isQuestionVerified || showResults}
                        className={cn(
                          "flex-1 flex flex-col items-center justify-center py-3 px-2 transition-all",
                          "border-r border-gray-100",
                          isQuestionVerified || showResults
                            ? "bg-emerald-50 text-emerald-600"
                            : "hover:bg-emerald-50 text-emerald-600"
                        )}
                      >
                        <div className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center mb-1",
                          isQuestionVerified || showResults ? "bg-emerald-500" : "bg-emerald-100"
                        )}>
                          <Check className={cn("h-5 w-5", isQuestionVerified || showResults ? "text-white" : "text-emerald-600")} />
                        </div>
                        <span className="text-xs font-medium">
                          {isQuestionVerified || showResults ? 'Correct' : 'Verifier'}
                        </span>
                      </button>

                      {/* Community Button */}
                      <button
                        onClick={() => setShowCommunityModal(true)}
                        className="flex-1 flex flex-col items-center justify-center py-3 px-2 transition-all hover:bg-teal-50 text-teal-600 border-r border-gray-100"
                      >
                        <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center mb-1">
                          <Users className="h-5 w-5 text-teal-600" />
                        </div>
                        <span className="text-xs font-medium">A Community</span>
                      </button>

                      {/* Ressayer Button */}
                      <button
                        onClick={handleResetQuestion}
                        disabled={!isQuestionVerified && !showResults}
                        className={cn(
                          "flex-1 flex flex-col items-center justify-center py-3 px-2 transition-all border-r border-gray-100",
                          (!isQuestionVerified && !showResults)
                            ? "opacity-50 cursor-not-allowed text-gray-400"
                            : "hover:bg-orange-50 text-orange-500"
                        )}
                      >
                        <div className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center mb-1",
                          (!isQuestionVerified && !showResults) ? "bg-gray-100" : "bg-orange-100"
                        )}>
                          <RefreshCcw className={cn("h-5 w-5", (!isQuestionVerified && !showResults) ? "text-gray-400" : "text-orange-500")} />
                        </div>
                        <span className="text-xs font-medium">Ressayer</span>
                      </button>

                      {/* Explication Button */}
                      <button
                        onClick={() => setShowExplanation(true)}
                        disabled={!isQuestionVerified && !showResults}
                        className={cn(
                          "flex-1 flex flex-col items-center justify-center py-3 px-2 transition-all",
                          (!isQuestionVerified && !showResults)
                            ? "opacity-50 cursor-not-allowed text-gray-400"
                            : "hover:bg-blue-50 text-blue-600"
                        )}
                      >
                        <div className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center mb-1",
                          (!isQuestionVerified && !showResults) ? "bg-gray-100" : "bg-blue-100"
                        )}>
                          <Lightbulb className={cn("h-5 w-5", (!isQuestionVerified && !showResults) ? "text-gray-400" : "text-blue-600")} />
                        </div>
                        <span className="text-xs font-medium">Explication</span>
                      </button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex items-center justify-between gap-4">
              <Button
                variant="outline"
                onClick={goToPrevious}
                disabled={currentQuestion === 0}
                className="gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline">{t('dashboard:previous') || 'Previous'}</span>
              </Button>

              <div className="flex items-center gap-1.5">
                {questions.slice(
                  Math.max(0, currentQuestion - 2),
                  Math.min(questions.length, currentQuestion + 3)
                ).map((_, i) => {
                  const actualIndex = Math.max(0, currentQuestion - 2) + i;
                  return (
                    <button
                      key={actualIndex}
                      onClick={() => goToQuestion(actualIndex)}
                      className={cn(
                        "w-2 h-2 rounded-full transition-all",
                        actualIndex === currentQuestion 
                          ? "w-6 bg-blue-500" 
                          : "bg-gray-300 hover:bg-gray-400"
                      )}
                    />
                  );
                })}
              </div>

              <Button
                onClick={goToNext}
                disabled={currentQuestion === questions.length - 1}
                className="gap-2"
              >
                <span className="hidden sm:inline">{t('dashboard:next') || 'Next'}</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Sidebar - Desktop */}
          <div className="hidden lg:block lg:col-span-1">
            <Card className="sticky top-24 shadow-xl border-0 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100/50 border-b py-3">
                <CardTitle className="text-base flex items-center justify-between">
                  <span>{t('dashboard:questions_by_session') || 'Questions'}</span>
                  <Badge className="bg-blue-100 text-blue-700">{questions.length}</Badge>
                </CardTitle>
                {/* Legend */}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-[10px]">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-gray-100 border border-gray-300"></div>
                    <span className="text-gray-500">Non visité</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-blue-100 border border-blue-300"></div>
                    <span className="text-gray-500">Répondu</span>
                  </div>
                  {showResults && (
                    <>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded bg-emerald-100 border border-emerald-300"></div>
                        <span className="text-gray-500">Correct</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded bg-red-100 border border-red-300"></div>
                        <span className="text-gray-500">Incorrect</span>
                      </div>
                    </>
                  )}
                  <div className="flex items-center gap-1">
                    <Flag className="w-3 h-3 fill-amber-500 text-amber-500" />
                    <span className="text-gray-500">Surligné</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[450px]">
                  <div className="p-4 space-y-4">
                    {Object.entries(examData.questions || {}).map(([sessionName, sessionQuestions]) => {
                      const isCollapsed = collapsedSessions.has(sessionName);
                      const startIndex = questions.findIndex(q => q.sessionLabel === sessionName);
                      
                      return (
                        <div key={sessionName} className="space-y-2">
                          <button
                            className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors"
                            onClick={() => {
                              const newCollapsed = new Set(collapsedSessions);
                              if (newCollapsed.has(sessionName)) {
                                newCollapsed.delete(sessionName);
                              } else {
                                newCollapsed.add(sessionName);
                              }
                              setCollapsedSessions(newCollapsed);
                            }}
                          >
                            <span className="text-sm font-medium text-gray-700 truncate">
                              {sessionName}
                            </span>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {sessionQuestions.length}
                              </Badge>
                              {isCollapsed ? (
                                <ChevronDown className="h-4 w-4 text-gray-400" />
                              ) : (
                                <ChevronUp className="h-4 w-4 text-gray-400" />
                              )}
                            </div>
                          </button>
                          
                          <AnimatePresence>
                            {!isCollapsed && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                              >
                                <div className="grid grid-cols-5 gap-1.5 pl-2">
                                  {sessionQuestions.map((_, qIndex) => {
                                    const globalIndex = startIndex + qIndex;
                                    const { status, isFlagged } = getQuestionStatus(globalIndex);
                                    const isCurrent = globalIndex === currentQuestion;
                                    
                                    return (
                                      <button
                                        key={globalIndex}
                                        className={cn(
                                          "relative h-8 rounded-lg text-xs font-medium transition-all",
                                          "focus:outline-none focus:ring-2 focus:ring-blue-500",
                                          isCurrent && "ring-2 ring-blue-500 ring-offset-1",
                                          status === 'correct' && "bg-emerald-100 text-emerald-700 hover:bg-emerald-200",
                                          status === 'incorrect' && "bg-red-100 text-red-700 hover:bg-red-200",
                                          status === 'answered' && !isCurrent && "bg-blue-100 text-blue-700 hover:bg-blue-200",
                                          status === 'unanswered' && "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                        )}
                                        onClick={() => goToQuestion(globalIndex)}
                                      >
                                        {qIndex + 1}
                                        {isFlagged && (
                                          <Flag className="h-2 w-2 absolute -top-0.5 -right-0.5 fill-amber-500 text-amber-500" />
                                        )}
                                      </button>
                                    );
                                  })}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>

                {/* Results Summary */}
                {showResults && (
                  <div className="border-t p-4 space-y-4 bg-gradient-to-br from-gray-50 to-white">
                    <div className="text-center space-y-2">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                        <Trophy className="h-8 w-8" />
                      </div>
                      <div>
                        <p className="text-3xl font-bold text-gray-900">
                          {Math.round((score.correct / score.total) * 100)}%
                        </p>
                        <p className="text-sm text-gray-500">
                          {score.correct}/{score.total} {t('dashboard:correct') || 'correct'}
                        </p>
                      </div>
                    </div>
                    <Progress 
                      value={(score.correct / score.total) * 100} 
                      className="h-2"
                    />
                    <Button
                      variant="outline"
                      className="w-full gap-2"
                      onClick={handleRetry}
                    >
                      <RefreshCcw className="h-4 w-4" />
                      {t('dashboard:retry') || 'Try Again'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Mobile FAB - positioned higher to avoid overlapping with bottom toolbar */}
      <div className="lg:hidden fixed bottom-24 right-4 z-30">
        <Button
          size="lg"
          className="h-12 w-12 rounded-full shadow-xl bg-gradient-to-br from-blue-600 to-indigo-600"
          onClick={() => setShowSidebar(true)}
        >
          <ListChecks className="h-5 w-5" />
        </Button>
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {showSidebar && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={() => setShowSidebar(false)}
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute right-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b bg-gray-50">
                <h3 className="font-semibold text-gray-900">{t('dashboard:questions') || 'Questions'}</h3>
                <Button variant="ghost" size="icon" onClick={() => setShowSidebar(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
              
              <ScrollArea className="h-[calc(100vh-130px)]">
                <div className="p-4 space-y-4">
                  {Object.entries(examData.questions || {}).map(([sessionName, sessionQuestions]) => {
                    const isCollapsed = collapsedSessions.has(sessionName);
                    const startIndex = questions.findIndex(q => q.sessionLabel === sessionName);
                    
                    return (
                      <div key={sessionName} className="space-y-2">
                        <button
                          className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-gray-50"
                          onClick={() => {
                            const newCollapsed = new Set(collapsedSessions);
                            if (newCollapsed.has(sessionName)) {
                              newCollapsed.delete(sessionName);
                            } else {
                              newCollapsed.add(sessionName);
                            }
                            setCollapsedSessions(newCollapsed);
                          }}
                        >
                          <span className="text-sm font-medium truncate">{sessionName}</span>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{sessionQuestions.length}</Badge>
                            {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                          </div>
                        </button>
                        
                        {!isCollapsed && (
                          <div className="grid grid-cols-5 gap-1.5">
                            {sessionQuestions.map((_, qIndex) => {
                              const globalIndex = startIndex + qIndex;
                              const { status, isFlagged } = getQuestionStatus(globalIndex);
                              
                              return (
                                <button
                                  key={globalIndex}
                                  className={cn(
                                    "relative h-9 rounded-lg text-xs font-medium transition-all",
                                    globalIndex === currentQuestion && "ring-2 ring-blue-500",
                                    status === 'correct' && "bg-emerald-100 text-emerald-700",
                                    status === 'incorrect' && "bg-red-100 text-red-700",
                                    status === 'answered' && "bg-blue-100 text-blue-700",
                                    status === 'unanswered' && "bg-gray-100 text-gray-600"
                                  )}
                                  onClick={() => {
                                    goToQuestion(globalIndex);
                                    setShowSidebar(false);
                                  }}
                                >
                                  {qIndex + 1}
                                  {isFlagged && (
                                    <Flag className="h-2 w-2 absolute -top-0.5 -right-0.5 fill-amber-500 text-amber-500" />
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>

              {/* Mobile Results */}
              {showResults && (
                <div className="border-t p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium">{t('dashboard:your_score') || 'Your Score'}</span>
                    <span className="text-2xl font-bold text-blue-600">
                      {Math.round((score.correct / score.total) * 100)}%
                    </span>
                  </div>
                  <Button className="w-full gap-2" onClick={handleRetry}>
                    <RefreshCcw className="h-4 w-4" />
                    {t('dashboard:retry') || 'Try Again'}
                  </Button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirm Submit Modal */}
      <AnimatePresence>
        {showConfirmSubmit && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowConfirmSubmit(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600">
                  <CheckCircle className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  {t('dashboard:confirm_submit') || 'Submit Exam?'}
                </h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>
                    {t('dashboard:answered_questions') || 'You have answered'}{' '}
                    <strong>{answeredCount}</strong> {t('common:of') || 'of'}{' '}
                    <strong>{questions.length}</strong> {t('dashboard:questions') || 'questions'}.
                  </p>
                  {flaggedCount > 0 && (
                    <p className="text-amber-600">
                      <Flag className="inline h-4 w-4 mr-1" />
                      {flaggedCount} {t('dashboard:questions_flagged') || 'questions flagged for review'}
                    </p>
                  )}
                  {questions.length - answeredCount > 0 && (
                    <p className="text-red-600">
                      <AlertCircle className="inline h-4 w-4 mr-1" />
                      {questions.length - answeredCount} {t('dashboard:questions_unanswered') || 'questions unanswered'}
                    </p>
                  )}
                </div>
                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowConfirmSubmit(false)}
                  >
                    {t('common:cancel') || 'Cancel'}
                  </Button>
                  <Button
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600"
                    onClick={handleSubmit}
                  >
                    {t('dashboard:submit') || 'Submit'}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Keyboard Shortcuts Modal */}
      <AnimatePresence>
        {showKeyboardShortcuts && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowKeyboardShortcuts(false)}
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
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Keyboard className="h-5 w-5 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {t('dashboard:keyboard_shortcuts') || 'Keyboard Shortcuts'}
                  </h3>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setShowKeyboardShortcuts(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
              
              <div className="space-y-3">
                {[
                  { keys: ['←', '→'], action: t('dashboard:navigate_questions') || 'Navigate questions' },
                  { keys: ['1', '2', '3', '4', '5'], action: t('dashboard:select_answer') || 'Select answer' },
                  { keys: ['F'], action: t('dashboard:flag_question') || 'Flag question' },
                  { keys: ['?'], action: t('dashboard:show_shortcuts') || 'Show shortcuts' },
                  { keys: ['Esc'], action: t('dashboard:close_modal') || 'Close modal' },
                ].map(({ keys, action }) => (
                  <div key={action} className="flex items-center justify-between py-2">
                    <span className="text-gray-600">{action}</span>
                    <div className="flex gap-1">
                      {keys.map((key) => (
                        <kbd
                          key={key}
                          className="px-2 py-1 bg-gray-100 border rounded text-sm font-mono"
                        >
                          {key}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      {showExplanation && currentQuestionData && (
        <ExplicationModel
          question={currentQuestionData}
          setShowExplanation={setShowExplanation}
        />
      )}

      {showNoteModal && currentQuestionData && (
        <NoteModal
          isOpen={showNoteModal}
          onClose={() => setShowNoteModal(false)}
          questionId={currentQuestionData._id}
        />
      )}

      {showReportModal && currentQuestionData && (
        <ReportModal
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
          questionId={currentQuestionData._id}
        />
      )}

      {showCommunityModal && currentQuestionData && (
        <CommunityModal
          isOpen={showCommunityModal}
          onClose={() => setShowCommunityModal(false)}
          questionId={currentQuestionData._id}
          questionOptions={currentQuestionData.options}
          correctAnswer={currentQuestionData.options
            .map((opt, i) => opt.isCorrect ? String.fromCharCode(65 + i) : null)
            .filter(Boolean)}
          userLevel={20} // TODO: Pass actual user level from module stats
          requiredLevel={20}
        />
      )}
    </div>
  );
};

export default ExamPage;
