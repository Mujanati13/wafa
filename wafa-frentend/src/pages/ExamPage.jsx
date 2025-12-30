import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
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
  Users,
  LayoutGrid,
  ListMusic,
  Image,
  Menu,
  Grid3X3,
  MoreVertical,
  Send,
  FileText,
  LogOut,
  User,
  Settings,
  CreditCard,
  Highlighter
} from "lucide-react";
import { userService } from "@/services/userService";
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
import ResumesModal from "@/components/ExamsPage/ResumesModal";

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
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Get exam type from query params (default: exam-years)
  const examType = searchParams.get('type') || 'exam'; // 'exam', 'course', 'qcm'

  // Helper function to darken/lighten color
  const adjustColor = (color, amount) => {
    if (!color) return null;
    const hex = color.replace('#', '');
    const num = parseInt(hex, 16);
    const r = Math.max(0, Math.min(255, (num >> 16) + amount));
    const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amount));
    const b = Math.max(0, Math.min(255, (num & 0x0000FF) + amount));
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
  };

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
  const [showResumesModal, setShowResumesModal] = useState(false);
  const [showOverview, setShowOverview] = useState(false);
  const [showVueEnsemble, setShowVueEnsemble] = useState(false);
  const [showImageGallery, setShowImageGallery] = useState(false);

  // Extract module color from exam data
  const moduleColor = examData?.moduleColor || '#6366f1'; // Default indigo

  // Track visited questions (for orange color)
  const [visitedQuestions, setVisitedQuestions] = useState(new Set([0]));

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

  // Mobile-specific states
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showMobileQuestionNav, setShowMobileQuestionNav] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const questionCardRef = useRef(null);

  // User profile state for header
  const [userProfile, setUserProfile] = useState(null);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showFontPopup, setShowFontPopup] = useState(false);

  // Swipe detection threshold
  const minSwipeDistance = 50;

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

  // Fetch user profile for header
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const profile = await userService.getUserProfile();
        setUserProfile(profile);
      } catch (error) {
        console.error('Error fetching user profile:', error);
        // Try to get from localStorage
        const cached = localStorage.getItem('user');
        if (cached) {
          setUserProfile(JSON.parse(cached));
        }
      }
    };
    fetchUserProfile();
  }, []);

  // Calculate user level from points
  const calculateLevel = (totalPoints) => {
    if (totalPoints >= 10000) return { level: 10, name: "Maître", nextLevel: null, progress: 100 };
    if (totalPoints >= 7500) return { level: 9, name: "Expert", nextLevel: 10000, progress: ((totalPoints - 7500) / 2500) * 100 };
    if (totalPoints >= 5000) return { level: 8, name: "Avancé", nextLevel: 7500, progress: ((totalPoints - 5000) / 2500) * 100 };
    if (totalPoints >= 3500) return { level: 7, name: "Confirmé", nextLevel: 5000, progress: ((totalPoints - 3500) / 1500) * 100 };
    if (totalPoints >= 2500) return { level: 6, name: "Intermédiaire", nextLevel: 3500, progress: ((totalPoints - 2500) / 1000) * 100 };
    if (totalPoints >= 1500) return { level: 5, name: "Apprenti", nextLevel: 2500, progress: ((totalPoints - 1500) / 1000) * 100 };
    if (totalPoints >= 1000) return { level: 4, name: "Initié", nextLevel: 1500, progress: ((totalPoints - 1000) / 500) * 100 };
    if (totalPoints >= 500) return { level: 3, name: "Novice", nextLevel: 1000, progress: ((totalPoints - 500) / 500) * 100 };
    if (totalPoints >= 200) return { level: 2, name: "Débutant", nextLevel: 500, progress: ((totalPoints - 200) / 300) * 100 };
    return { level: 1, name: "Nouveau", nextLevel: 200, progress: (totalPoints / 200) * 100 };
  };

  const userLevelInfo = userProfile ? calculateLevel(userProfile.points || 0) : null;

  // Get the API endpoint based on exam type
  const getExamEndpoint = useCallback(() => {
    switch (examType) {
      case 'course':
        return `/exam-courses/${examId}`;
      case 'qcm':
        return `/qcm-banque/${examId}`;
      default:
        return `/exams/all/${examId}`;
    }
  }, [examId, examType]);

  // Transform data to unified format
  const transformExamData = useCallback((data, type) => {
    if (type === 'course') {
      // ExamCourse has linkedQuestions populated
      const questions = data.linkedQuestions || [];
      return {
        ...data,
        name: data.name,
        moduleId: data.moduleId?._id || data.moduleId,
        moduleName: data.moduleId?.name || data.moduleName,
        moduleColor: data.moduleId?.color || data.color || '#6366f1',
        totalQuestions: questions.length,
        questions: {
          "Session principale": questions
        }
      };
    } else if (type === 'qcm') {
      // QCMBanque has questions array
      const questions = data.questions || [];
      return {
        ...data,
        name: data.name,
        moduleId: data.moduleId?._id || data.moduleId,
        moduleName: data.moduleId?.name || data.moduleName,
        moduleColor: data.moduleId?.color || '#6366f1',
        totalQuestions: questions.length,
        questions: {
          "Session principale": questions
        }
      };
    }
    // Default exam-years format - already in correct format
    return data;
  }, []);

  // Fetch exam data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const endpoint = getExamEndpoint();
        const response = await api.get(endpoint);
        const transformedData = transformExamData(response.data.data, examType);
        setExamData(transformedData);

        // Restore progress from localStorage
        const savedProgress = localStorage.getItem(`exam_progress_${examType}_${examId}`);
        if (savedProgress) {
          const { answers, currentQ, timeSpent, flags, verified } = JSON.parse(savedProgress);
          setSelectedAnswers(answers || {});
          setCurrentQuestion(currentQ || 0);
          setTimeElapsed(timeSpent || 0);
          setFlaggedQuestions(new Set(flags || []));
          if (verified) {
            setVerifiedQuestions(verified);
          }
          toast.success(t('dashboard:progress_restored') || 'Progress restored', {
            icon: <CheckCircle2 className="h-4 w-4 text-green-500" />
          });
        }

        // Also try to restore from server
        try {
          const serverAnswers = await api.get(`/questions/user-answers/${examId}`);
          if (serverAnswers.data?.data && Object.keys(serverAnswers.data.data).length > 0) {
            const answersData = serverAnswers.data.data;
            const restoredAnswers = {};
            const restoredVerified = {};

            // Map question IDs to indices and restore answers
            Object.entries(answersData).forEach(([qId, answerData]) => {
              // Find question index by ID
              const allQuestions = [];
              Object.values(transformedData.questions || {}).forEach(sessionQuestions => {
                sessionQuestions.forEach(q => allQuestions.push(q));
              });
              const qIndex = allQuestions.findIndex(q => q._id === qId);
              if (qIndex !== -1) {
                restoredAnswers[qIndex] = answerData.selectedAnswers;
                if (answerData.isVerified) {
                  restoredVerified[qIndex] = true;
                }
              }
            });

            // Only update if we got server data and no local data
            if (Object.keys(restoredAnswers).length > 0 && !savedProgress) {
              setSelectedAnswers(restoredAnswers);
              setVerifiedQuestions(restoredVerified);
              toast.info("Réponses restaurées depuis le serveur", {
                icon: <CheckCircle2 className="h-4 w-4 text-blue-500" />
              });
            }
          }
        } catch (serverErr) {
          console.log('Could not fetch server answers:', serverErr);
        }
      } catch (err) {
        setError(t('dashboard:failed_load_exam') || 'Failed to load exam');
        toast.error(t('dashboard:failed_load_exam') || 'Failed to load exam');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [examId, examType, t, getExamEndpoint, transformExamData]);

  // Auto-save progress (including verified state)
  useEffect(() => {
    if (!examData || showResults) return;

    const saveProgress = () => {
      const progress = {
        answers: selectedAnswers,
        currentQ: currentQuestion,
        timeSpent: timeElapsed,
        flags: Array.from(flaggedQuestions),
        verified: verifiedQuestions
      };
      localStorage.setItem(`exam_progress_${examType}_${examId}`, JSON.stringify(progress));
    };

    const saveTimer = setTimeout(saveProgress, 1000);
    return () => clearTimeout(saveTimer);
  }, [selectedAnswers, currentQuestion, timeElapsed, flaggedQuestions, verifiedQuestions, examId, examData, showResults]);

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

  // Handle answer selection - always allow multi-select
  const handleAnswerSelect = useCallback((questionIndex, optionIndex) => {
    const question = questions[questionIndex];
    if (!question || showResults) return;

    // Check if question is already verified - don't allow changes
    if (verifiedQuestions[questionIndex]) return;

    setAnswerAnimation({ questionIndex, optionIndex });
    setTimeout(() => setAnswerAnimation(null), 300);

    // Always allow multiple selection (toggle behavior)
    const current = selectedAnswers[questionIndex] || [];
    const updated = current.includes(optionIndex)
      ? current.filter(i => i !== optionIndex)
      : [...current, optionIndex];
    setSelectedAnswers({ ...selectedAnswers, [questionIndex]: updated });

    playSound('select');
  }, [questions, selectedAnswers, showResults, verifiedQuestions, playSound]);

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

  // Verify current question - show answer and award points
  const handleVerifyQuestion = useCallback(async () => {
    const hasAnswer = selectedAnswers[currentQuestion]?.length > 0;
    if (!hasAnswer) {
      setValidationError("Sélectionnez une réponse");
      toast.error("Sélectionnez une réponse", {
        icon: <AlertCircle className="h-4 w-4 text-red-500" />
      });
      setTimeout(() => setValidationError(null), 3000);
      return;
    }

    const questionData = questions[currentQuestion];
    
    // Call backend to verify answer and award points
    try {
      const response = await api.post('/questions/verify-answer', {
        questionId: questionData._id,
        selectedAnswers: selectedAnswers[currentQuestion],
        examId: examId,
        moduleId: examData?.moduleId,
        isRetry: false
      });

      const { isCorrect, pointsAwarded, totalPoints } = response.data.data;

      // Update verified state
      setVerifiedQuestions(prev => ({
        ...prev,
        [currentQuestion]: true
      }));

      // Update user profile points in state
      if (userProfile && pointsAwarded !== 0) {
        setUserProfile(prev => ({
          ...prev,
          points: totalPoints
        }));
      }

      // Show toast based on result
      if (isCorrect) {
        toast.success(`Correct! +${pointsAwarded} point`, {
          icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />
        });
      } else {
        toast.error("Incorrect", {
          icon: <XCircle className="h-4 w-4 text-red-500" />
        });
      }

      // Save answer for persistence
      await api.post('/questions/save-answer', {
        questionId: questionData._id,
        selectedAnswers: selectedAnswers[currentQuestion],
        isVerified: true,
        isCorrect,
        examId: examId,
        moduleId: examData?.moduleId
      });

    } catch (error) {
      console.error('Error verifying answer:', error);
      // Still mark as verified locally even if API fails
      setVerifiedQuestions(prev => ({
        ...prev,
        [currentQuestion]: true
      }));
    }

    playSound('select');
  }, [currentQuestion, selectedAnswers, questions, examId, examData, userProfile, playSound]);

  // Reset current question verification (Ressayer) - costs 1 point
  const handleResetQuestion = useCallback(async () => {
    const questionData = questions[currentQuestion];

    // Call backend to deduct point for retry
    try {
      const response = await api.post('/questions/verify-answer', {
        questionId: questionData._id,
        selectedAnswers: [],
        examId: examId,
        moduleId: examData?.moduleId,
        isRetry: true
      });

      const { totalPoints } = response.data.data;

      // Update user profile points
      if (userProfile) {
        setUserProfile(prev => ({
          ...prev,
          points: totalPoints
        }));
      }

      toast.info("-1 point (ressayer)", {
        icon: <RefreshCcw className="h-4 w-4 text-gray-500" />
      });

    } catch (error) {
      console.error('Error recording retry:', error);
    }

    // Reset local state
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
  }, [currentQuestion, questions, examId, examData, userProfile]);

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
      const nextQ = currentQuestion + 1;
      setCurrentQuestion(nextQ);
      setVisitedQuestions(prev => new Set([...prev, nextQ]));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentQuestion, questions.length]);

  const goToPrevious = useCallback(() => {
    if (currentQuestion > 0) {
      setQuestionTransition('prev');
      const prevQ = currentQuestion - 1;
      setCurrentQuestion(prevQ);
      setVisitedQuestions(prev => new Set([...prev, prevQ]));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentQuestion]);

  const goToQuestion = useCallback((index) => {
    setQuestionTransition(index > currentQuestion ? 'next' : 'prev');
    setCurrentQuestion(index);
    setVisitedQuestions(prev => new Set([...prev, index]));
    setShowSidebar(false);
    setShowMobileQuestionNav(false);
  }, [currentQuestion]);

  // Touch/Swipe handlers for mobile navigation
  const onTouchStart = useCallback((e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  }, []);

  const onTouchMove = useCallback((e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  }, []);

  const onTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && currentQuestion < questions.length - 1) {
      goToNext();
    }
    if (isRightSwipe && currentQuestion > 0) {
      goToPrevious();
    }
  }, [touchStart, touchEnd, currentQuestion, questions.length, goToNext, goToPrevious]);

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
    localStorage.removeItem(`exam_progress_${examType}_${examId}`);

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
  }, [examId, examType, playSound, t, calculateScore]);

  // Retry exam
  const handleRetry = useCallback(() => {
    setSelectedAnswers({});
    setCurrentQuestion(0);
    setTimeElapsed(0);
    setShowResults(false);
    setFlaggedQuestions(new Set());
    localStorage.removeItem(`exam_progress_${examType}_${examId}`);
    toast.info(t('dashboard:new_attempt_started') || 'New attempt started');
  }, [examId, examType, t]);

  const score = useMemo(() => calculateScore(), [calculateScore]);
  const progress = useMemo(() =>
    (Object.keys(selectedAnswers).length / Math.max(questions.length, 1)) * 100,
    [selectedAnswers, questions.length]
  );

  // Get question status with enhanced colors
  const getQuestionStatus = useCallback((index) => {
    const hasAnswer = selectedAnswers[index]?.length > 0;
    const isVerified = verifiedQuestions[index];
    const isFlagged = flaggedQuestions.has(index);
    const isVisited = visitedQuestions.has(index);

    if (showResults || isVerified) {
      const question = questions[index];
      const userAnswers = selectedAnswers[index] || [];
      const correctAnswers = question.options
        .map((opt, i) => opt.isCorrect ? i : -1)
        .filter(i => i !== -1);

      const isCorrect = userAnswers.length === correctAnswers.length &&
        userAnswers.every(ans => correctAnswers.includes(ans));

      return { status: isCorrect ? 'correct' : 'incorrect', isFlagged, isVisited };
    }

    // Flagged takes priority (purple)
    if (isFlagged) {
      return { status: 'flagged', isFlagged: true, isVisited };
    }

    // Answered (blue)
    if (hasAnswer) {
      return { status: 'answered', isFlagged, isVisited };
    }

    // Visited but not answered (orange)
    if (isVisited) {
      return { status: 'visited', isFlagged, isVisited: true };
    }

    return { status: 'unanswered', isFlagged, isVisited: false };
  }, [selectedAnswers, flaggedQuestions, questions, showResults, verifiedQuestions, visitedQuestions]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      switch (e.key) {
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
        case 'Enter':
          if (!showResults && !verifiedQuestions[currentQuestion]) {
            handleVerifyQuestion();
          }
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
  }, [currentQuestion, goToNext, goToPrevious, toggleFlag, handleAnswerSelect, showResults, currentQuestionData, verifiedQuestions, handleVerifyQuestion]);

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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-lg"
        >
          <Card className="shadow-2xl border-0 overflow-hidden">
            <div 
              className="p-6 text-white"
              style={{
                background: `linear-gradient(to right, ${moduleColor}, ${adjustColor(moduleColor, -30)})`
              }}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <AlertCircle className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">{t('dashboard:oops') || 'Oups !'}</h3>
                  <p className="text-white/80 text-sm">{t('dashboard:exam_unavailable') || 'Examen non disponible'}</p>
                </div>
              </div>
            </div>

            <CardContent className="p-6 space-y-6">
              <div className="space-y-3">
                <p className="text-gray-700 leading-relaxed">
                  {t('dashboard:exam_not_available_msg') || "Désolé, cet examen n'est pas disponible pour le moment. Cela peut arriver pour plusieurs raisons :"}
                </p>
                <ul className="space-y-2 text-sm text-gray-600 ml-4">
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5" style={{ color: moduleColor }}>•</span>
                    <span>{t('dashboard:exam_removed') || "L'examen a peut-être été supprimé ou déplacé"}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5" style={{ color: moduleColor }}>•</span>
                    <span>{t('dashboard:exam_temp_unavailable') || "Le contenu est temporairement indisponible"}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5" style={{ color: moduleColor }}>•</span>
                    <span>{t('dashboard:exam_access_issue') || "Vous n'avez peut-être pas accès à ce contenu"}</span>
                  </li>
                </ul>
              </div>

              <div 
                className="border rounded-lg p-4"
                style={{ 
                  backgroundColor: `${moduleColor}10`, 
                  borderColor: `${moduleColor}30` 
                }}
              >
                <p className="text-sm flex items-start gap-2" style={{ color: adjustColor(moduleColor, -60) }}>
                  <Lightbulb className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>{t('dashboard:try_refresh') || "Essayez de rafraîchir la page ou retournez au tableau de bord pour explorer d'autres contenus."}</span>
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                  className="flex-1 gap-2"
                >
                  <RefreshCcw className="h-4 w-4" />
                  {t('dashboard:refresh_page') || 'Actualiser'}
                </Button>
                <Button
                  onClick={() => navigate('/dashboard/home')}
                  className="flex-1 gap-2 text-white"
                  style={{
                    background: `linear-gradient(to right, ${moduleColor}, ${adjustColor(moduleColor, -30)})`
                  }}
                >
                  <Home className="h-4 w-4" />
                  {t('dashboard:back_to_dashboard') || 'Tableau de bord'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  const isMultipleChoice = currentQuestionData.options.filter(opt => opt.isCorrect).length > 1;
  const answeredCount = Object.keys(selectedAnswers).length;
  const flaggedCount = flaggedQuestions.size;

  // Calculate verified stats for mobile header
  const verifiedCount = Object.keys(verifiedQuestions).length;
  const correctCount = questions.filter((_, i) => {
    if (!verifiedQuestions[i]) return false;
    const selected = selectedAnswers[i] || [];
    const correctIndices = questions[i].options
      .map((opt, idx) => opt.isCorrect ? idx : null)
      .filter(idx => idx !== null);
    return selected.length === correctIndices.length &&
      selected.every(s => correctIndices.includes(s));
  }).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 pb-20 lg:pb-0">
      {/* ============== MOBILE RESULTS BANNER ============== */}
      {showResults && (
        <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-indigo-600 to-purple-600 text-white safe-area-pt">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                  <Trophy className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs text-white/70">Examen terminé</p>
                  <p className="text-2xl font-bold">
                    {Math.round((score.correct / score.total) * 100)}%
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">{score.correct}/{score.total}</p>
                <p className="text-xs text-white/70">réponses correctes</p>
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <button
                onClick={handleRetry}
                className="flex-1 py-2 px-3 rounded-lg bg-white/20 text-white text-sm font-medium flex items-center justify-center gap-2"
              >
                <RefreshCcw className="h-4 w-4" />
                Recommencer
              </button>
              <button
                onClick={() => navigate('/dashboard/home')}
                className="flex-1 py-2 px-3 rounded-lg bg-white text-indigo-600 text-sm font-medium flex items-center justify-center gap-2"
              >
                <Home className="h-4 w-4" />
                Accueil
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============== MOBILE HEADER ============== */}
      <header className={cn(
        "lg:hidden bg-white/95 backdrop-blur-lg border-b border-gray-200/50 sticky top-0 z-40 shadow-sm",
        showResults && "mt-32" // Add margin when results banner is showing
      )}>
        {/* Top row */}
        <div className="flex items-center justify-between px-3 py-2">
          {/* Menu button (far left) */}
          <button
            onClick={() => setShowSidebar(true)}
            className="p-2 -ml-1 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors"
          >
            <Menu className="h-5 w-5 text-gray-700" />
          </button>

          {/* Exit button + Title */}
          <div className="flex items-center gap-2 min-w-0 flex-1 justify-center">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 active:bg-gray-300 transition-colors text-gray-700"
            >
              <LogOut className="h-4 w-4" />
              <span className="text-sm font-medium">Exit</span>
            </button>
          </div>
          
          {/* Timer + Font + Profile */}
          <div className="flex items-center gap-1.5">
            <div className={cn(
              "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-mono font-medium",
              getTimeColor()
            )}>
              <Timer className="h-3 w-3" />
              {formatTime(timeElapsed)}
            </div>

            {/* Font Controls Popup Button */}
            <div className="relative">
              <button
                onClick={() => setShowFontPopup(!showFontPopup)}
                className="p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 transition-colors"
              >
                <span className="text-xs font-bold">YA</span>
              </button>
              
              {/* Font Popup */}
              <AnimatePresence>
                {showFontPopup && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-xl border p-3 z-50 min-w-[140px]"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <button
                        onClick={() => adjustFontSize(-2)}
                        disabled={fontSize <= 12}
                        className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-30 transition-colors"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="text-sm font-semibold min-w-[40px] text-center">{fontSize}px</span>
                      <button
                        onClick={() => adjustFontSize(2)}
                        disabled={fontSize >= 24}
                        className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-30 transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Progress bar with question indicator */}
        <div className="px-3 pb-2">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
            <span className="font-medium" style={{ color: moduleColor }}>
              Question {currentQuestion + 1} / {questions.length}
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              {verifiedCount} vérifiées
            </span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{
                background: `linear-gradient(to right, ${moduleColor}, ${adjustColor(moduleColor, -20)})`
              }}
              initial={{ width: 0 }}
              animate={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </header>

      {/* ============== DESKTOP HEADER ============== */}
      <header className="hidden lg:block bg-white/80 backdrop-blur-lg border-b border-gray-200/50 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <div className="flex items-center justify-between h-12 sm:h-14 md:h-16">
            {/* Left Section - Menu button far left */}
            <div className="flex items-center gap-1.5 sm:gap-3 min-w-0 flex-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSidebar(!showSidebar)}
                className="shrink-0 hover:bg-gray-100 h-8 w-8 sm:h-9 sm:w-9"
              >
                <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>

              {/* Exit Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(-1)}
                className="gap-1.5 text-gray-700 hover:bg-gray-100"
              >
                <LogOut className="h-4 w-4" />
                <span>Exit</span>
              </Button>

              {/* Timer Badge */}
              <Badge
                variant="outline"
                className={cn(
                  "gap-1 font-mono text-[10px] sm:text-xs md:text-sm px-1.5 sm:px-2 md:px-3 py-0.5 sm:py-1 transition-colors",
                  getTimeColor()
                )}
              >
                <Timer className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                <span>{formatTime(timeElapsed)}</span>
              </Badge>
            </div>

            {/* Right Section - Font controls + Profile */}
            <div className="flex items-center gap-2 md:gap-3">
              {/* Font Size Controls Popup */}
              <div className="relative">
                <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 hover:bg-white"
                    onClick={() => adjustFontSize(-2)}
                    disabled={fontSize <= 12}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="text-xs px-2 font-medium text-gray-600 min-w-[40px] text-center">
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
              </div>

              {/* YA Button (Font icon) */}
              <button
                className="h-9 w-9 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors flex items-center justify-center text-sm font-bold"
              >
                YA
              </button>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-semibold">
                    {userProfile?.name?.charAt(0) || userProfile?.firstName?.charAt(0) || 'U'}
                  </div>
                </button>

                {/* Profile Dropdown Menu */}
                <AnimatePresence>
                  {showProfileDropdown && (
                    <>
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setShowProfileDropdown(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-xl border overflow-hidden z-50"
                      >
                        {/* User info header */}
                        <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b">
                          <p className="font-semibold text-gray-900">
                            {userProfile?.name || `${userProfile?.firstName || ''} ${userProfile?.lastName || ''}`.trim() || 'Utilisateur'}
                          </p>
                          <p className="text-sm text-gray-500 truncate">{userProfile?.email || ''}</p>
                          
                          {/* Level Bar */}
                          {userLevelInfo && (
                            <div className="mt-3">
                              <div className="flex items-center justify-between text-xs mb-1">
                                <span className="font-medium text-purple-600">Level {userLevelInfo.level}</span>
                                <span className="text-gray-500">{userLevelInfo.name}</span>
                              </div>
                              <div className="h-2 bg-purple-100 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all"
                                  style={{ width: `${userLevelInfo.progress}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Stats */}
                        <div className="p-3 border-b">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="flex items-center gap-1 text-sm">
                                <Zap className="h-4 w-4 text-yellow-500" />
                                <span className="font-semibold">{userProfile?.points || 0}</span>
                              </span>
                              <span className="flex items-center gap-1 text-sm">
                                <Star className="h-4 w-4 text-amber-500" />
                                <span className="font-semibold">{userProfile?.stars || 0}</span>
                              </span>
                            </div>
                            <Badge className="bg-blue-100 text-blue-700 text-xs">
                              {userProfile?.points || 0} pts
                            </Badge>
                          </div>
                        </div>

                        {/* Menu Items */}
                        <div className="p-2">
                          <button
                            onClick={() => {
                              setShowProfileDropdown(false);
                              navigate('/dashboard/profile');
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors text-left"
                          >
                            <User className="h-4 w-4 text-gray-500" />
                            <span className="text-sm">Profile</span>
                          </button>
                          <button
                            onClick={() => {
                              setShowProfileDropdown(false);
                              navigate('/dashboard/settings');
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors text-left"
                          >
                            <Settings className="h-4 w-4 text-gray-500" />
                            <span className="text-sm">Settings</span>
                          </button>
                          <button
                            onClick={() => {
                              setShowProfileDropdown(false);
                              navigate('/dashboard/subscription');
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors text-left"
                          >
                            <CreditCard className="h-4 w-4 text-gray-500" />
                            <span className="text-sm">Subscription</span>
                          </button>
                          <hr className="my-2" />
                          <button
                            onClick={() => {
                              setShowProfileDropdown(false);
                              // Logout logic would go here
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors text-left text-red-600"
                          >
                            <LogOut className="h-4 w-4" />
                            <span className="text-sm">Se déconnecter</span>
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-1 bg-gray-100">
          <motion.div
            className="h-full"
            style={{
              background: `linear-gradient(to right, ${moduleColor}, ${adjustColor(moduleColor, -20)})`
            }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-3 sm:py-4 md:py-6 lg:py-8">
        <div className="grid lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
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
                    <div className="w-3 h-3 rounded bg-orange-100 border border-orange-300"></div>
                    <span className="text-gray-500">Visité</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-blue-100 border border-blue-300"></div>
                    <span className="text-gray-500">Répondu</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-purple-100 border border-purple-300"></div>
                    <span className="text-gray-500">Surligné</span>
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
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[450px]">
                  <div className="p-4 space-y-4">
                    {Object.entries(examData.questions || {}).map(([sessionName, sessionQuestions]) => {
                      const isCollapsed = collapsedSessions.has(sessionName);
                      return (
                        <div key={sessionName} className="space-y-2">
                          <button
                            onClick={() => {
                              const newCollapsed = new Set(collapsedSessions);
                              if (isCollapsed) {
                                newCollapsed.delete(sessionName);
                              } else {
                                newCollapsed.add(sessionName);
                              }
                              setCollapsedSessions(newCollapsed);
                            }}
                            className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <BookOpen className="h-4 w-4 text-gray-500" />
                              <span className="font-medium text-sm text-gray-700">{sessionName}</span>
                            </div>
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
                          {!isCollapsed && (
                            <div className="grid grid-cols-5 gap-1.5 pl-2">
                              {sessionQuestions.map((q, idx) => {
                                const globalIndex = questions.findIndex(question => question._id === q._id);
                                const { status, isFlagged } = getQuestionStatus(globalIndex);
                                const isCurrent = globalIndex === currentQuestion;
                                return (
                                  <button
                                    key={q._id}
                                    onClick={() => goToQuestion(globalIndex)}
                                    className={cn(
                                      "relative aspect-square rounded-md text-xs font-medium transition-all border-2",
                                      isCurrent && "ring-2 ring-blue-500 ring-offset-1 scale-110",
                                      status === 'correct' && "bg-emerald-100 border-emerald-400 text-emerald-700",
                                      status === 'incorrect' && "bg-red-100 border-red-400 text-red-700",
                                      status === 'answered' && !isFlagged && "bg-blue-100 border-blue-300 text-blue-700",
                                      status === 'visited' && !isFlagged && "bg-orange-100 border-orange-300 text-orange-700",
                                      status === 'unanswered' && !isFlagged && "bg-gray-100 border-gray-300 text-gray-600",
                                      isFlagged && !showResults && "bg-purple-100 border-purple-400 text-purple-700",
                                      "hover:scale-105"
                                    )}
                                  >
                                    {globalIndex + 1}
                                    {isFlagged && !showResults && (
                                      <Flag className="absolute -top-1 -right-1 h-3 w-3 fill-purple-500 text-purple-500" />
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

                {/* Progression Section */}
                {!showResults && (
                  <div className="border-t p-3 bg-gradient-to-br from-gray-50 to-white">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="font-medium text-gray-700">Progression</span>
                      <span className="text-gray-500">
                        {Object.keys(verifiedQuestions).length} / {questions.length} vérifiées
                      </span>
                    </div>
                    <div className="flex h-2 rounded-full overflow-hidden bg-gray-100">
                      {(() => {
                        const correctCount = questions.filter((_, i) => {
                          if (!verifiedQuestions[i]) return false;
                          const selected = selectedAnswers[i] || [];
                          const correctIndices = questions[i].options
                            .map((opt, idx) => opt.isCorrect ? idx : null)
                            .filter(idx => idx !== null);
                          return selected.length === correctIndices.length &&
                            selected.every(s => correctIndices.includes(s));
                        }).length;

                        const incorrectCount = Object.keys(verifiedQuestions).length - correctCount;
                        const unansweredCount = questions.length - Object.keys(verifiedQuestions).length;

                        const correctPct = (correctCount / questions.length) * 100;
                        const incorrectPct = (incorrectCount / questions.length) * 100;

                        return (
                          <>
                            <div
                              className="bg-emerald-500 transition-all"
                              style={{ width: `${correctPct}%` }}
                            />
                            <div
                              className="bg-red-500 transition-all"
                              style={{ width: `${incorrectPct}%` }}
                            />
                          </>
                        );
                      })()}
                    </div>
                    <div className="flex items-center justify-center gap-4 mt-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                        Correctes
                      </span>
                      <span className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                        Incorrectes
                      </span>
                      <span className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-gray-200"></div>
                        Non vérifiées
                      </span>
                    </div>
                  </div>
                )}

                {/* Score Summary */}
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

          {/* Main Question Area */}
          <div className="lg:col-span-3 space-y-4 sm:space-y-6">

            {/* Question Card - with swipe support on mobile */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestion}
                ref={questionCardRef}
                initial={{ opacity: 0, x: questionTransition === 'next' ? 50 : -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: questionTransition === 'next' ? -50 : 50 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
                className="touch-pan-y"
              >
                <Card className="shadow-xl border-0 overflow-hidden">
                  {/* Mobile Swipe Hint */}
                  <div className="lg:hidden flex items-center justify-center gap-2 py-1.5 bg-gradient-to-r from-gray-50 to-gray-100/50 text-xs text-gray-400">
                    <ChevronLeft className="h-3 w-3" />
                    <span>Glissez pour naviguer</span>
                    <ChevronRight className="h-3 w-3" />
                  </div>

                  {/* Question Header */}
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100/50 border-b px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 md:py-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                        <Badge 
                          className="font-semibold text-[10px] sm:text-xs"
                          style={{
                            backgroundColor: `${moduleColor}20`,
                            color: adjustColor(moduleColor, -60)
                          }}
                        >
                          Q{currentQuestion + 1}
                        </Badge>
                        {currentQuestionData.sessionLabel && (
                          <Badge variant="outline" className="text-gray-600 text-[10px] sm:text-xs hidden xs:inline-flex">
                            {currentQuestionData.sessionLabel}
                          </Badge>
                        )}
                        {isMultipleChoice && (
                          <Badge 
                            className="gap-1 text-[10px] sm:text-xs"
                            style={{
                              backgroundColor: `${moduleColor}15`,
                              color: adjustColor(moduleColor, -40)
                            }}
                          >
                            <CheckCircle2 className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                            <span className="hidden xs:inline">{t('dashboard:multiple_choice') || 'Multiple'}</span>
                            <span className="xs:hidden">Multi</span>
                          </Badge>
                        )}
                        {flaggedQuestions.has(currentQuestion) && (
                          <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 gap-1 text-[10px] sm:text-xs">
                            <Flag className="h-2.5 w-2.5 sm:h-3 sm:w-3 fill-current" />
                            <span className="hidden sm:inline">{t('dashboard:flagged') || 'Flagged'}</span>
                          </Badge>
                        )}
                      </div>
                      {/* Desktop action buttons - hidden on mobile since we have bottom bar */}
                      <div className="hidden lg:flex items-center gap-0.5 sm:gap-1">
                        {/* Image Gallery Button */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setShowImageGallery(true)}
                          className="shrink-0 text-gray-400 h-7 w-7 sm:h-8 sm:w-8"
                          style={{
                            '--hover-color': moduleColor,
                            '--hover-bg': `${moduleColor}10`
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = moduleColor;
                            e.currentTarget.style.backgroundColor = `${moduleColor}10`;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = '';
                            e.currentTarget.style.backgroundColor = '';
                          }}
                          title="Images"
                        >
                          <Image className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setShowNoteModal(true)}
                          className="shrink-0 text-gray-400 h-7 w-7 sm:h-8 sm:w-8"
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = moduleColor;
                            e.currentTarget.style.backgroundColor = `${moduleColor}10`;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = '';
                            e.currentTarget.style.backgroundColor = '';
                          }}
                          title="Note"
                        >
                          <NotebookPen className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setShowReportModal(true)}
                          className="shrink-0 text-gray-400 hover:text-red-600 hover:bg-red-50 h-7 w-7 sm:h-8 sm:w-8"
                          title="Signaler"
                        >
                          <TriangleAlert className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleFlag(currentQuestion)}
                          className={cn(
                            "shrink-0 transition-all h-7 w-7 sm:h-8 sm:w-8",
                            flaggedQuestions.has(currentQuestion)
                              ? "text-amber-500 hover:text-amber-600 hover:bg-amber-50"
                              : "text-gray-400 hover:text-gray-600"
                          )}
                          title="Surligner"
                        >
                          <Flag className={cn(
                            "h-3.5 w-3.5 sm:h-4 sm:w-4 transition-transform",
                            flaggedQuestions.has(currentQuestion) && "fill-current scale-110"
                          )} />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <CardContent className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-5 md:space-y-6">
                    {/* Question Number and Reference - positioned below question number */}
                    <div className="space-y-2">
                      {/* Question Number Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge 
                            className="font-semibold text-sm px-3 py-1"
                            style={{
                              backgroundColor: `${moduleColor}20`,
                              color: adjustColor(moduleColor, -60)
                            }}
                          >
                            {currentQuestion + 1} / {questions.length}
                          </Badge>
                          {currentQuestionData.image && (
                            <button
                              onClick={() => setShowImageGallery(true)}
                              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors text-xs text-gray-600"
                            >
                              <Image className="h-3.5 w-3.5" />
                              Image
                            </button>
                          )}
                        </div>
                        {isMultipleChoice && (
                          <Badge 
                            variant="outline"
                            className="gap-1 text-xs"
                          >
                            <CheckCircle2 className="h-3 w-3" />
                            Choix multiple
                          </Badge>
                        )}
                      </div>

                      {/* Dynamic Reference based on entry type */}
                      <div className="flex items-center gap-2 text-[10px] sm:text-xs text-gray-500 bg-gray-50 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg">
                        <BookOpen className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
                        <span className="truncate">
                          {(() => {
                            // Determine the entry type and build reference accordingly
                            const moduleName = examData?.moduleName || 'Module';
                            const examYear = examData?.year ? `${examData.year}` : '';
                            const examType = examData?.examType || examData?.category || '';
                            const courseName = currentQuestionData?.sessionLabel || examData?.courseName || '';
                            const qcmName = examData?.title || examData?.name || '';

                            // QCM Banque format: moduleName > qcmName
                            if (examType === 'QCM banque' || examData?.isQcmBanque) {
                              return `${moduleName} > ${qcmName}`;
                            }
                            
                            // Par Cours format: moduleName > courseName > examYear
                            if (examType === 'Exam par courses' || examData?.isParCours) {
                              return `${moduleName}${courseName ? ` > ${courseName}` : ''}${examYear ? ` > ${examYear}` : ''}`;
                            }
                            
                            // Par Année format (default): moduleName > examYear > courseName
                            return `${moduleName}${examYear ? ` > ${examYear}` : ''}${courseName ? ` > ${courseName}` : ''} > Q${currentQuestion + 1}`;
                          })()}
                        </span>
                      </div>
                    </div>

                    {/* Question Text */}
                    <div
                      className="text-gray-800 leading-relaxed font-medium text-sm sm:text-base"
                      style={{ fontSize: `${Math.max(14, fontSize - 2)}px`, lineHeight: '1.6' }}
                    >
                      {currentQuestionData.question}
                    </div>

                    {/* Question Image */}
                    {currentQuestionData.image && (
                      <div className="relative rounded-lg sm:rounded-xl overflow-hidden border bg-gray-50">
                        <img
                          src={currentQuestionData.image}
                          alt="Question illustration"
                          className="w-full max-h-48 sm:max-h-64 md:max-h-80 object-contain"
                        />
                      </div>
                    )}

                    {/* Answer Options */}
                    <div className="space-y-2 sm:space-y-3">
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
                              "w-full text-left rounded-xl border-2 transition-all duration-200 bg-white",
                              "focus:outline-none",
                              !showCorrectness && "hover:shadow-md cursor-pointer active:scale-[0.98]",
                              showCorrectness && "cursor-default",
                              // Default state (not selected, not showing correctness)
                              !isSelected && !showCorrectness && "border-gray-200 hover:border-gray-300",
                              // Selected but not verified yet
                              isSelected && !showCorrectness && "border-2",
                              // After verification - correct answer (green border)
                              showCorrectness && isCorrect && "border-emerald-500",
                              // After verification - wrong answer selected (red border)
                              showCorrectness && !isCorrect && isSelected && "border-red-500",
                              // After verification - not selected and not correct (gray)
                              showCorrectness && !isCorrect && !isSelected && "border-gray-200 opacity-60"
                            )}
                            style={
                              isSelected && !showCorrectness
                                ? {
                                    borderColor: moduleColor,
                                    boxShadow: `0 2px 8px -2px ${moduleColor}30`
                                  }
                                : {}
                            }
                            onClick={() => !showCorrectness && handleAnswerSelect(currentQuestion, index)}
                            disabled={showCorrectness}
                          >
                            <div className="p-3 sm:p-4 flex items-center gap-3">
                              {/* Option Letter */}
                              <div 
                                className={cn(
                                  "shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm transition-all",
                                  !isSelected && !showCorrectness && "bg-gray-100 text-gray-600",
                                  isSelected && !showCorrectness && "text-white",
                                  showCorrectness && isCorrect && "bg-emerald-500 text-white",
                                  showCorrectness && !isCorrect && isSelected && "bg-red-500 text-white",
                                  showCorrectness && !isCorrect && !isSelected && "bg-gray-100 text-gray-400"
                                )}
                                style={
                                  isSelected && !showCorrectness
                                    ? { backgroundColor: moduleColor }
                                    : {}
                                }
                              >
                                {String.fromCharCode(65 + index)}
                              </div>

                              {/* Option Text */}
                              <span
                                className={cn(
                                  "flex-1 text-sm sm:text-base",
                                  showCorrectness && isCorrect && "text-emerald-700 font-medium",
                                  showCorrectness && !isCorrect && isSelected && "text-red-700",
                                  showCorrectness && !isCorrect && !isSelected && "text-gray-400"
                                )}
                                style={{ fontSize: `${Math.max(13, fontSize - 2)}px` }}
                              >
                                {option.text}
                              </span>

                              {/* Small indicator icon on right */}
                              {showCorrectness && (isCorrect || isSelected) && (
                                <div className="shrink-0">
                                  {isCorrect ? (
                                    <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
                                      <Check className="h-4 w-4 text-emerald-600" />
                                    </div>
                                  ) : isSelected ? (
                                    <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
                                      <X className="h-4 w-4 text-red-600" />
                                    </div>
                                  ) : null}
                                </div>
                              )}
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  </CardContent>

                  {/* Bottom Action Toolbar - Desktop Only */}
                  <div className="hidden lg:block border-t">
                    {/* Blue action bar on right side */}
                    <div className="flex items-center justify-between p-3">
                      {/* Left side - Verify/Result indicator */}
                      <div className="flex items-center gap-3">
                        {/* Verification Status */}
                        {isQuestionVerified || showResults ? (
                          <div className="flex items-center gap-2">
                            {(() => {
                              const selected = selectedAnswers[currentQuestion] || [];
                              const correctIndices = currentQuestionData.options
                                .map((opt, idx) => opt.isCorrect ? idx : null)
                                .filter(idx => idx !== null);
                              const isCorrect = selected.length === correctIndices.length &&
                                selected.every(s => correctIndices.includes(s));
                              
                              return isCorrect ? (
                                <div className="flex items-center gap-2">
                                  <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center">
                                    <Check className="h-6 w-6 text-white" />
                                  </div>
                                  <span className="font-semibold text-emerald-600">Correct</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center">
                                    <X className="h-6 w-6 text-white" />
                                  </div>
                                  <span className="font-semibold text-red-600">Incorrect</span>
                                </div>
                              );
                            })()}
                          </div>
                        ) : (
                          <Button
                            onClick={handleVerifyQuestion}
                            className="gap-2 text-white px-6"
                            style={{
                              background: `linear-gradient(135deg, ${moduleColor}, ${adjustColor(moduleColor, -30)})`
                            }}
                          >
                            <Check className="h-5 w-5" />
                            Vérifier
                          </Button>
                        )}

                        {/* Ressayer button - only show after verification */}
                        {(isQuestionVerified || showResults) && (
                          <Button
                            variant="outline"
                            onClick={handleResetQuestion}
                            className="gap-2"
                          >
                            <RefreshCcw className="h-4 w-4" />
                            Ressayer
                          </Button>
                        )}

                        {/* Explication button - only show after verification */}
                        {(isQuestionVerified || showResults) && (
                          <Button
                            variant="outline"
                            onClick={() => setShowExplanation(true)}
                            className="gap-2 text-amber-600 border-amber-300 hover:bg-amber-50"
                          >
                            <Lightbulb className="h-4 w-4" />
                            Explication
                          </Button>
                        )}
                      </div>

                      {/* Right side - Blue action bar with white icons */}
                      <div className="flex items-center gap-1 bg-blue-600 rounded-xl p-1.5">
                        <button
                          onClick={() => setShowResumesModal(true)}
                          className="p-2.5 rounded-lg hover:bg-blue-500 transition-colors"
                          title="Playlist"
                        >
                          <ListMusic className="h-5 w-5 text-white" />
                        </button>
                        <button
                          onClick={() => setShowResumesModal(true)}
                          className="p-2.5 rounded-lg hover:bg-blue-500 transition-colors"
                          title="Résumés"
                        >
                          <FileText className="h-5 w-5 text-white" />
                        </button>
                        <button
                          onClick={() => setShowImageGallery(true)}
                          className="p-2.5 rounded-lg hover:bg-blue-500 transition-colors"
                          title="Images"
                        >
                          <Image className="h-5 w-5 text-white" />
                        </button>
                        <button
                          onClick={() => setShowNoteModal(true)}
                          className="p-2.5 rounded-lg hover:bg-blue-500 transition-colors"
                          title="Note"
                        >
                          <NotebookPen className="h-5 w-5 text-white" />
                        </button>
                        <button
                          onClick={() => setShowReportModal(true)}
                          className="p-2.5 rounded-lg hover:bg-red-500 transition-colors"
                          title="Signaler"
                        >
                          <TriangleAlert className="h-5 w-5 text-white" />
                        </button>
                        <button
                          onClick={() => toggleFlag(currentQuestion)}
                          className={cn(
                            "p-2.5 rounded-lg transition-colors",
                            flaggedQuestions.has(currentQuestion) 
                              ? "bg-amber-500 hover:bg-amber-600" 
                              : "hover:bg-blue-500"
                          )}
                          title="Surligner"
                        >
                          <Highlighter className={cn(
                            "h-5 w-5 text-white",
                            flaggedQuestions.has(currentQuestion) && "fill-white"
                          )} />
                        </button>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </AnimatePresence>

            {/* Navigation - Desktop Only */}
            <div className="hidden lg:flex items-center justify-between gap-4">
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
                          ? "w-6"
                          : "bg-gray-300 hover:bg-gray-400"
                      )}
                      style={
                        actualIndex === currentQuestion
                          ? { backgroundColor: moduleColor }
                          : {}
                      }
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
        </div>
      </div>

      {/* ============== MOBILE BOTTOM FIXED FOOTER ============== */}
      {!showResults ? (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 safe-area-pb">
          {/* Blue action bar - Fixed at bottom */}
          <div className="bg-blue-600 px-2 py-2">
            <div className="flex items-center justify-between">
              {/* Left: Playlist & Resume */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setShowResumesModal(true)}
                  className="p-2.5 rounded-lg hover:bg-blue-500 active:bg-blue-700 transition-colors"
                  title="Playlist"
                >
                  <ListMusic className="h-5 w-5 text-white" />
                </button>
                <button
                  onClick={() => setShowResumesModal(true)}
                  className="p-2.5 rounded-lg hover:bg-blue-500 active:bg-blue-700 transition-colors"
                  title="Résumés"
                >
                  <FileText className="h-5 w-5 text-white" />
                </button>
              </div>

              {/* Center: Images & Note */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setShowImageGallery(true)}
                  className="p-2.5 rounded-lg hover:bg-blue-500 active:bg-blue-700 transition-colors"
                  title="Images"
                >
                  <Image className="h-5 w-5 text-white" />
                </button>
                <button
                  onClick={() => setShowNoteModal(true)}
                  className="p-2.5 rounded-lg hover:bg-blue-500 active:bg-blue-700 transition-colors"
                  title="Note"
                >
                  <NotebookPen className="h-5 w-5 text-white" />
                </button>
              </div>

              {/* Right: Report & Highlight */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setShowReportModal(true)}
                  className="p-2.5 rounded-lg hover:bg-red-500 active:bg-red-700 transition-colors"
                  title="Signaler"
                >
                  <TriangleAlert className="h-5 w-5 text-white" />
                </button>
                <button
                  onClick={() => toggleFlag(currentQuestion)}
                  className={cn(
                    "p-2.5 rounded-lg transition-colors",
                    flaggedQuestions.has(currentQuestion) 
                      ? "bg-amber-500 hover:bg-amber-600" 
                      : "hover:bg-blue-500 active:bg-blue-700"
                  )}
                  title="Surligner"
                >
                  <Highlighter className={cn(
                    "h-5 w-5 text-white",
                    flaggedQuestions.has(currentQuestion) && "fill-white"
                  )} />
                </button>
              </div>
            </div>
          </div>

          {/* Navigation row - White background */}
          <div className="bg-white border-t border-gray-200 shadow-lg px-3 py-2">
            <div className="flex items-center gap-2">
              {/* Previous button */}
              <button
                onClick={goToPrevious}
                disabled={currentQuestion === 0}
                className={cn(
                  "p-3 rounded-xl transition-all active:scale-95",
                  currentQuestion === 0
                    ? "bg-gray-100 text-gray-300"
                    : "bg-gray-100 text-gray-700"
                )}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              {/* Verify / Check button - Main CTA */}
              {!isQuestionVerified && !showResults ? (
                <button
                  onClick={handleVerifyQuestion}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-white transition-all active:scale-98"
                  style={{
                    background: `linear-gradient(135deg, ${moduleColor}, ${adjustColor(moduleColor, -30)})`,
                    boxShadow: `0 4px 15px ${moduleColor}40`
                  }}
                >
                  <Check className="h-5 w-5" />
                  Vérifier
                </button>
              ) : (
                <div className="flex-1 flex items-center gap-2">
                  {/* Explanation button */}
                  <button
                    onClick={() => setShowExplanation(true)}
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-3 rounded-xl font-medium text-amber-700 bg-amber-100 transition-all active:scale-98"
                  >
                    <Lightbulb className="h-5 w-5" />
                    Explication
                  </button>
                  
                  {/* Reset button */}
                  <button
                    onClick={handleResetQuestion}
                    className="p-3 rounded-xl bg-gray-100 text-gray-600 transition-all active:scale-95"
                  >
                    <RefreshCcw className="h-5 w-5" />
                  </button>
                </div>
              )}

              {/* Question nav button */}
              <button
                onClick={() => setShowMobileQuestionNav(true)}
                className="p-3 rounded-xl transition-all active:scale-95"
                style={{ backgroundColor: `${moduleColor}15`, color: moduleColor }}
              >
                <Grid3X3 className="h-5 w-5" />
              </button>

              {/* Next button */}
              <button
                onClick={goToNext}
                disabled={currentQuestion === questions.length - 1}
                className={cn(
                  "p-3 rounded-xl transition-all active:scale-95",
                  currentQuestion === questions.length - 1
                    ? "bg-gray-100 text-gray-300"
                    : "text-white"
                )}
                style={
                  currentQuestion !== questions.length - 1
                    ? {
                        background: `linear-gradient(135deg, ${moduleColor}, ${adjustColor(moduleColor, -30)})`
                      }
                    : {}
                }
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Mobile Results Bottom Bar */
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-lg safe-area-pb">
          <div className="flex items-center gap-3 px-4 py-3">
            {/* Previous */}
            <button
              onClick={goToPrevious}
              disabled={currentQuestion === 0}
              className={cn(
                "p-3 rounded-xl transition-all active:scale-95",
                currentQuestion === 0 ? "bg-gray-100 text-gray-300" : "bg-gray-100 text-gray-700"
              )}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            {/* Question Nav Button */}
            <button
              onClick={() => setShowMobileQuestionNav(true)}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-white transition-all active:scale-98"
              style={{
                background: `linear-gradient(135deg, ${moduleColor}, ${adjustColor(moduleColor, -30)})`
              }}
            >
              <Grid3X3 className="h-5 w-5" />
              Voir toutes les questions
            </button>

            {/* Next */}
            <button
              onClick={goToNext}
              disabled={currentQuestion === questions.length - 1}
              className={cn(
                "p-3 rounded-xl transition-all active:scale-95",
                currentQuestion === questions.length - 1 ? "bg-gray-100 text-gray-300" : "bg-gray-100 text-gray-700"
              )}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* ============== MOBILE QUESTION NAVIGATION DRAWER ============== */}
      <AnimatePresence>
        {showMobileQuestionNav && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={() => setShowMobileQuestionNav(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl max-h-[75vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-10 h-1 bg-gray-300 rounded-full" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-4 pb-3 border-b">
                <div>
                  <h3 className="font-bold text-lg text-gray-900">Questions</h3>
                  <p className="text-sm text-gray-500">
                    {verifiedCount} vérifiées • {correctCount} correctes
                  </p>
                </div>
                <button
                  onClick={() => setShowMobileQuestionNav(false)}
                  className="p-2 rounded-full bg-gray-100"
                >
                  <X className="h-5 w-5 text-gray-600" />
                </button>
              </div>

              {/* Legend */}
              <div className="flex items-center justify-center gap-3 py-2 px-4 bg-gray-50 text-[10px]">
                <span className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-gray-200 border border-gray-300" />
                  Non visité
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-blue-200 border border-blue-400" />
                  Répondu
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-emerald-200 border border-emerald-400" />
                  Correct
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-red-200 border border-red-400" />
                  Incorrect
                </span>
              </div>

              {/* Questions grid */}
              <ScrollArea className="flex-1 p-4">
                <div className="grid grid-cols-6 gap-2">
                  {questions.map((q, index) => {
                    const { status, isFlagged } = getQuestionStatus(index);
                    const isCurrent = index === currentQuestion;

                    return (
                      <button
                        key={index}
                        onClick={() => {
                          goToQuestion(index);
                          setShowMobileQuestionNav(false);
                        }}
                        className={cn(
                          "relative aspect-square rounded-xl text-sm font-semibold transition-all active:scale-95 border-2",
                          isCurrent && "ring-2 ring-offset-2",
                          status === 'correct' && "bg-emerald-100 border-emerald-400 text-emerald-700",
                          status === 'incorrect' && "bg-red-100 border-red-400 text-red-700",
                          status === 'answered' && "bg-blue-100 border-blue-300 text-blue-700",
                          status === 'visited' && "bg-orange-100 border-orange-300 text-orange-700",
                          status === 'flagged' && "bg-purple-100 border-purple-400 text-purple-700",
                          status === 'unanswered' && "bg-gray-50 border-gray-200 text-gray-500"
                        )}
                        style={
                          isCurrent
                            ? { '--tw-ring-color': moduleColor }
                            : {}
                        }
                      >
                        {index + 1}
                        {isFlagged && (
                          <Flag className="absolute -top-1 -right-1 h-3 w-3 text-purple-500 fill-purple-500" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </ScrollArea>

              {/* Submit button */}
              {!showResults && (
                <div className="p-4 border-t bg-white">
                  <button
                    onClick={() => {
                      setShowMobileQuestionNav(false);
                      setShowConfirmSubmit(true);
                    }}
                    className="w-full py-3 rounded-xl font-semibold text-white transition-all active:scale-98"
                    style={{
                      background: `linear-gradient(135deg, ${moduleColor}, ${adjustColor(moduleColor, -30)})`
                    }}
                  >
                    <span className="flex items-center justify-center gap-2">
                      <Send className="h-5 w-5" />
                      Terminer l'examen
                    </span>
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============== MOBILE MENU DRAWER ============== */}
      <AnimatePresence>
        {showMobileMenu && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={() => setShowMobileMenu(false)}
          >
            <motion.div
              initial={{ y: '-100%' }}
              animate={{ y: 0 }}
              exit={{ y: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute top-0 left-0 right-0 bg-white rounded-b-3xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="font-bold text-lg">Options</h3>
                <button
                  onClick={() => setShowMobileMenu(false)}
                  className="p-2 rounded-full bg-gray-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Menu items */}
              <div className="p-4 space-y-2">
                <button
                  onClick={() => {
                    setShowMobileMenu(false);
                    setShowResumesModal(true);
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900">Résumés & Cours</p>
                    <p className="text-xs text-gray-500">Consultez les ressources</p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setShowMobileMenu(false);
                    setShowCommunityModal(true);
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                    <Users className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900">Communauté</p>
                    <p className="text-xs text-gray-500">Discussions et aide</p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setShowMobileMenu(false);
                    setShowImageGallery(true);
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center">
                    <Image className="h-5 w-5 text-pink-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900">Galerie d'images</p>
                    <p className="text-xs text-gray-500">Toutes les images de l'examen</p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setShowMobileMenu(false);
                    setShowVueEnsemble(true);
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                    <LayoutGrid className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900">Vue d'ensemble</p>
                    <p className="text-xs text-gray-500">Toutes les questions et réponses</p>
                  </div>
                </button>

                {/* Font size control */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-600 font-bold text-sm">Aa</span>
                    </div>
                    <span className="font-medium text-gray-900">Taille du texte</span>
                  </div>
                  <div className="flex items-center gap-1 bg-white rounded-lg border p-1">
                    <button
                      onClick={() => adjustFontSize(-2)}
                      disabled={fontSize <= 12}
                      className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="px-2 text-sm font-medium">{fontSize}</span>
                    <button
                      onClick={() => adjustFontSize(2)}
                      disabled={fontSize >= 24}
                      className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Submit button */}
              {!showResults && (
                <div className="p-4 border-t">
                  <button
                    onClick={() => {
                      setShowMobileMenu(false);
                      setShowConfirmSubmit(true);
                    }}
                    className="w-full py-3 rounded-xl font-semibold text-white"
                    style={{
                      background: `linear-gradient(135deg, ${moduleColor}, ${adjustColor(moduleColor, -30)})`
                    }}
                  >
                    <span className="flex items-center justify-center gap-2">
                      <CheckCircle className="h-5 w-5" />
                      Terminer l'examen
                    </span>
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile FAB - positioned higher to avoid overlapping with bottom toolbar */}
      <div className="hidden fixed bottom-24 left-4 z-30">
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
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white shadow-2xl"
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
                                    status === 'verified' && "bg-blue-100 text-blue-700",
                                    status === 'flagged' && "bg-purple-100 text-purple-700",
                                    status === 'answered' && "bg-blue-100 text-blue-700",
                                    status === 'visited' && "bg-orange-100 text-orange-700",
                                    status === 'unanswered' && "bg-gray-100 text-gray-600"
                                  )}
                                  onClick={() => {
                                    goToQuestion(globalIndex);
                                    setShowSidebar(false);
                                  }}
                                >
                                  {qIndex + 1}
                                  {isFlagged && (
                                    <Flag className="h-2 w-2 absolute -top-0.5 -right-0.5 fill-purple-500 text-purple-500" />
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
                  { keys: ['Enter'], action: 'Vérifier' },
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
          questionText={currentQuestionData.question || currentQuestionData.text}
          questionOptions={currentQuestionData.options}
          userLevel={20} // TODO: Get actual user level in this module
          requiredLevel={20}
          moduleColor={moduleColor}
          onOpenExplanation={() => setShowExplanation(true)}
        />
      )}

      {showResumesModal && (
        <ResumesModal
          isOpen={showResumesModal}
          onClose={() => setShowResumesModal(false)}
          examData={examData}
        />
      )}

      {/* Vue d'ensemble Modal - Shows all questions with their choices */}
      <AnimatePresence>
        {showVueEnsemble && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-2 sm:p-4"
            onClick={() => setShowVueEnsemble(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-3 sm:p-4 border-b bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-t-xl shrink-0">
                <div className="flex items-center gap-2 sm:gap-3">
                  <LayoutGrid className="h-5 w-5 sm:h-6 sm:w-6" />
                  <h2 className="text-base sm:text-xl font-bold">Vue d'ensemble</h2>
                  <Badge className="bg-white/20 text-white text-[10px] sm:text-xs">{questions.length} questions</Badge>
                </div>
                <button
                  onClick={() => setShowVueEnsemble(false)}
                  className="p-1.5 sm:p-2 rounded-full hover:bg-white/20 transition-colors"
                >
                  <X className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              </div>

              {/* Questions Grid - Scrollable */}
              <div className="flex-1 overflow-y-auto p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {questions.map((q, index) => {
                    const { status } = getQuestionStatus(index);
                    const selectedOpts = selectedAnswers[index] || [];
                    const isVerified = verifiedQuestions[index] || showResults;

                    return (
                      <div
                        key={index}
                        className={cn(
                          "p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-lg",
                          status === 'correct' && "border-emerald-400 bg-emerald-50",
                          status === 'incorrect' && "border-red-400 bg-red-50",
                          status === 'answered' && "border-blue-300 bg-blue-50/50",
                          status === 'visited' && "border-orange-300 bg-orange-50/50",
                          status === 'flagged' && "border-purple-300 bg-purple-50",
                          status === 'unanswered' && "border-gray-200 bg-gray-50",
                          index === currentQuestion && "ring-2 ring-indigo-500"
                        )}
                        onClick={() => {
                          goToQuestion(index);
                          setShowVueEnsemble(false);
                        }}
                      >
                        {/* Question Header */}
                        <div className="flex items-start justify-between mb-3">
                          <span className="font-semibold text-gray-700 text-sm">
                            {index + 1}.) {q.question?.substring(0, 80)}{q.question?.length > 80 ? '...' : ''}
                          </span>
                        </div>

                        {/* Answer Options */}
                        <div className="space-y-2">
                          {q.options?.map((option, optIdx) => {
                            const isSelected = selectedOpts.includes(optIdx);
                            const isCorrect = option.isCorrect;
                            const showResult = isVerified;

                            return (
                              <div
                                key={optIdx}
                                className={cn(
                                  "flex items-center gap-2 p-2 rounded-lg border text-sm transition-colors",
                                  !showResult && !isSelected && "border-gray-200 bg-white",
                                  !showResult && isSelected && "border-blue-400 bg-blue-50",
                                  showResult && isCorrect && "border-emerald-400 bg-emerald-50",
                                  showResult && isSelected && !isCorrect && "border-red-400 bg-red-50"
                                )}
                              >
                                {/* Checkbox */}
                                <div className={cn(
                                  "w-5 h-5 rounded border-2 flex items-center justify-center shrink-0",
                                  !showResult && !isSelected && "border-gray-300 bg-white",
                                  !showResult && isSelected && "border-blue-500 bg-blue-500",
                                  showResult && isCorrect && "border-emerald-500 bg-emerald-500",
                                  showResult && isSelected && !isCorrect && "border-red-500 bg-red-500"
                                )}>
                                  {(isSelected || (showResult && isCorrect)) && (
                                    <Check className="h-3 w-3 text-white" />
                                  )}
                                </div>

                                {/* Option Label */}
                                <span className={cn(
                                  "font-medium",
                                  showResult && isCorrect && "text-emerald-700",
                                  showResult && isSelected && !isCorrect && "text-red-700"
                                )}>
                                  {String.fromCharCode(65 + optIdx)}-
                                </span>

                                {/* Option Text */}
                                <span className={cn(
                                  "flex-1 truncate",
                                  showResult && isCorrect && "text-emerald-700",
                                  showResult && isSelected && !isCorrect && "text-red-700 line-through"
                                )}>
                                  {option.text}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-3 sm:p-4 border-t bg-gray-50 rounded-b-xl shrink-0">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center flex-wrap gap-3 sm:gap-4 text-xs sm:text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <div className="w-4 h-4 rounded bg-emerald-100 border-2 border-emerald-400 flex items-center justify-center">
                        <Check className="h-2.5 w-2.5 text-emerald-600" />
                      </div>
                      Correct
                    </span>
                    <span className="flex items-center gap-1">
                      <div className="w-4 h-4 rounded bg-red-100 border-2 border-red-400 flex items-center justify-center">
                        <X className="h-2.5 w-2.5 text-red-600" />
                      </div>
                      Incorrect
                    </span>
                    <span className="flex items-center gap-1">
                      <div className="w-4 h-4 rounded bg-blue-100 border-2 border-blue-400"></div>
                      Sélectionné
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setShowVueEnsemble(false)}
                    className="w-full sm:w-auto"
                  >
                    Fermer
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Gallery Modal */}
      <AnimatePresence>
        {showImageGallery && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-2 sm:p-4"
            onClick={() => setShowImageGallery(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] sm:max-h-[85vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-3 sm:p-4 border-b bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-t-xl">
                <div className="flex items-center gap-2 sm:gap-3">
                  <Image className="h-5 w-5 sm:h-6 sm:w-6" />
                  <h2 className="text-base sm:text-xl font-bold">Images de l'examen</h2>
                </div>
                <button
                  onClick={() => setShowImageGallery(false)}
                  className="p-1.5 sm:p-2 rounded-full hover:bg-white/20 transition-colors"
                >
                  <X className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              </div>

              {/* Images Grid */}
              <ScrollArea className="flex-1 p-3 sm:p-4">
                {(() => {
                  const allImages = questions.reduce((acc, q, idx) => {
                    if (q.image) {
                      acc.push({
                        src: q.image,
                        questionIndex: idx,
                        questionText: q.question?.substring(0, 50) + '...'
                      });
                    }
                    return acc;
                  }, []);

                  if (allImages.length === 0) {
                    return (
                      <div className="text-center py-8 sm:py-12">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                          <Image className="h-8 w-8 sm:h-10 sm:w-10 text-gray-400" />
                        </div>
                        <h4 className="text-base sm:text-lg font-medium text-gray-700 mb-2">
                          Aucune image dans cet examen
                        </h4>
                        <p className="text-gray-500 text-xs sm:text-sm">
                          Cet examen ne contient pas d'images.
                        </p>
                      </div>
                    );
                  }

                  return (
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                      {allImages.map((img, idx) => (
                        <div
                          key={idx}
                          className="relative group cursor-pointer rounded-lg overflow-hidden border border-gray-200 hover:shadow-lg transition-all"
                          onClick={() => {
                            goToQuestion(img.questionIndex);
                            setShowImageGallery(false);
                          }}
                        >
                          <img
                            src={img.src}
                            alt={`Question ${img.questionIndex + 1}`}
                            className="w-full h-24 sm:h-32 object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                            <span className="text-white text-xs font-medium">
                              Q{img.questionIndex + 1}
                            </span>
                          </div>
                          <Badge className="absolute top-1 sm:top-2 left-1 sm:left-2 bg-purple-600 text-[10px] sm:text-xs">
                            Q{img.questionIndex + 1}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </ScrollArea>

              {/* Footer */}
              <div className="p-3 sm:p-4 border-t bg-gray-50 rounded-b-xl">
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setShowImageGallery(false)}
                    className="w-full sm:w-auto"
                  >
                    Fermer
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ExamPage;
