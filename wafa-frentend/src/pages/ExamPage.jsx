import React, { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Flag,
  MessageSquare,
  BookOpen,
  Eye,
  EyeOff,
  Bookmark,
  AlertCircle,
  CheckCircle2,
  XCircle,
  NotebookPen,
  AlbumIcon,
  TriangleAlert,
  Lightbulb,
  Plus,
  Minus,
  RotateCcw,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { api } from "@/lib/utils";
import { cn } from "@/lib/utils";
import ExplicationModel from "@/components/ExamsPage/ExplicationModel";
import NoteModal from "@/components/ExamsPage/NoteModal";
import ReportModal from "@/components/ExamsPage/ReportModal";

const ExamPage = () => {
  const { t } = useTranslation(['dashboard', 'common']);
  const { examId } = useParams();
  const navigate = useNavigate();
  
  // State management
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
  
  // Font size state
  const [fontSize, setFontSize] = useState(() => {
    const saved = localStorage.getItem('examFontSize');
    return saved ? parseInt(saved) : 16;
  });
  
  // Session grouping state
  const [collapsedSessions, setCollapsedSessions] = useState(new Set());
  
  // Feedback visibility state
  const [showFeedback, setShowFeedback] = useState(true);

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch exam data and restore progress
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await api.get(`exams/all/${examId}`);
        setExamData(response.data.data);
        
        // Restore progress from localStorage
        const savedProgress = localStorage.getItem(`exam_progress_${examId}`);
        if (savedProgress) {
          const { answers, currentQ, timeSpent, flags } = JSON.parse(savedProgress);
          setSelectedAnswers(answers || {});
          setCurrentQuestion(currentQ || 0);
          setTimeElapsed(timeSpent || 0);
          setFlaggedQuestions(new Set(flags || []));
          toast.success(t('dashboard:progress_restored'));
        }
      } catch (err) {
        setError(t('dashboard:failed_load_exam'));
        toast.error(t('dashboard:failed_load_exam'));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [examId]);

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

  // Get all questions flattened
  const getAllQuestions = () => {
    if (!examData?.questions) return [];
    const allQuestions = [];
    Object.values(examData.questions).forEach((sessionQuestions) => {
      allQuestions.push(...sessionQuestions);
    });
    return allQuestions;
  };

  const questions = getAllQuestions();
  const currentQuestionData = questions[currentQuestion];

  // Format time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle answer selection
  const handleAnswerSelect = (questionIndex, optionIndex) => {
    const question = questions[questionIndex];
    if (!question) return;

    const correctCount = question.options.filter(opt => opt.isCorrect).length;
    const isMultipleChoice = correctCount > 1;

    if (isMultipleChoice) {
      // Checkbox behavior
      const current = selectedAnswers[questionIndex] || [];
      const updated = current.includes(optionIndex)
        ? current.filter(i => i !== optionIndex)
        : [...current, optionIndex];
      setSelectedAnswers({ ...selectedAnswers, [questionIndex]: updated });
    } else {
      // Radio behavior
      setSelectedAnswers({ ...selectedAnswers, [questionIndex]: [optionIndex] });
    }
  };

  // Toggle flag
  const toggleFlag = (index) => {
    const newFlags = new Set(flaggedQuestions);
    if (newFlags.has(index)) {
      newFlags.delete(index);
    } else {
      newFlags.add(index);
    }
    setFlaggedQuestions(newFlags);
  };

  // Font size controls
  const increaseFontSize = () => {
    if (fontSize < 20) {
      const newSize = fontSize + 2;
      setFontSize(newSize);
      localStorage.setItem('examFontSize', newSize.toString());
    }
  };

  const decreaseFontSize = () => {
    if (fontSize > 14) {
      const newSize = fontSize - 2;
      setFontSize(newSize);
      localStorage.setItem('examFontSize', newSize.toString());
    }
  };

  const resetFontSize = () => {
    setFontSize(16);
    localStorage.setItem('examFontSize', '16');
  };

  // Toggle session collapse
  const toggleSession = (sessionName) => {
    const newCollapsed = new Set(collapsedSessions);
    if (newCollapsed.has(sessionName)) {
      newCollapsed.delete(sessionName);
    } else {
      newCollapsed.add(sessionName);
    }
    setCollapsedSessions(newCollapsed);
  };

  // Get questions grouped by session
  const getQuestionsBySession = () => {
    if (!examData?.questions) return {};
    return examData.questions;
  };

  // Navigation
  const goToNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setShowFeedback(true);
    }
  };

  const goToPrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setShowFeedback(true);
    }
  };

  const goToQuestion = (index) => {
    setCurrentQuestion(index);
    setShowSidebar(false);
  };

  // Submit exam
  const handleSubmit = () => {
    setShowResults(true);
    localStorage.removeItem(`exam_progress_${examId}`);
    toast.success(t('dashboard:exam_completed'));
  };

  // Retry exam
  const handleRetry = () => {
    setSelectedAnswers({});
    setCurrentQuestion(0);
    setTimeElapsed(0);
    setShowResults(false);
    setFlaggedQuestions(new Set());
    localStorage.removeItem(`exam_progress_${examId}`);
    toast.info(t('dashboard:new_attempt_started'));
  };

  // Calculate score
  const calculateScore = () => {
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
  };

  const score = calculateScore();
  const progress = (Object.keys(selectedAnswers).length / questions.length) * 100;

  // Get question status
  const getQuestionStatus = (index) => {
    const hasAnswer = selectedAnswers[index] && selectedAnswers[index].length > 0;
    if (showResults) {
      const question = questions[index];
      const userAnswers = selectedAnswers[index] || [];
      const correctAnswers = question.options
        .map((opt, i) => opt.isCorrect ? i : -1)
        .filter(i => i !== -1);
      
      const isCorrect = userAnswers.length === correctAnswers.length &&
        userAnswers.every(ans => correctAnswers.includes(ans));
      
      return isCorrect ? 'correct' : 'incorrect';
    }
    return hasAnswer ? 'answered' : 'unanswered';
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Font size controls
      if ((e.ctrlKey || e.metaKey) && e.key === '+') {
        e.preventDefault();
        increaseFontSize();
      } else if ((e.ctrlKey || e.metaKey) && e.key === '-') {
        e.preventDefault();
        decreaseFontSize();
      } else if ((e.ctrlKey || e.metaKey) && e.key === '0') {
        e.preventDefault();
        resetFontSize();
      }
      // Navigation
      else if (e.key === 'ArrowRight' && !showResults) {
        e.preventDefault();
        goToNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goToPrevious();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentQuestion, questions.length, showResults, fontSize]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">{t('dashboard:exam_loading')}</p>
        </div>
      </div>
    );
  }

  if (error || !currentQuestionData) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">{t('dashboard:exam_error')}</h3>
            <p className="text-muted-foreground mb-4">{error || t('dashboard:exam_not_found')}</p>
            <Button onClick={() => navigate('/dashboard/home')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('dashboard:back_to_dashboard')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isMultipleChoice = currentQuestionData.options.filter(opt => opt.isCorrect).length > 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard/home')}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="font-semibold text-lg">{examData?.title || t('dashboard:exam')}</h1>
                <p className="text-xs text-muted-foreground">
                  {t('dashboard:question')} {currentQuestion + 1} {t('common:of')} {questions.length}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Font Size Controls */}
              <div className="hidden md:flex items-center gap-1 border rounded-lg p-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={decreaseFontSize}
                  disabled={fontSize <= 14}
                  title={`${t('dashboard:decrease')} (Ctrl -)`}
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="text-xs px-2 font-medium">{fontSize}px</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={increaseFontSize}
                  disabled={fontSize >= 20}
                  title={`${t('dashboard:increase')} (Ctrl +)`}
                >
                  <Plus className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={resetFontSize}
                  title={`${t('dashboard:reset')} (Ctrl 0)`}
                >
                  <RotateCcw className="h-3 w-3" />
                </Button>
              </div>

              <Badge variant="outline" className="gap-2">
                <Clock className="h-3 w-3" />
                {formatTime(timeElapsed)}
              </Badge>
              <Button variant="outline" size="sm" className="hidden lg:flex" onClick={() => setShowSidebar(!showSidebar)}>
                {t('dashboard:overview')}
              </Button>
              {!showResults && (
                <Button onClick={handleSubmit}>
                  {t('dashboard:finish_exam')}
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Question Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Progress */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{t('dashboard:progression')}</span>
                    <span className="font-medium">{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} />
                </div>
              </CardContent>
            </Card>

            {/* Question Card */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        {t('dashboard:question')} {currentQuestion + 1}
                      </Badge>
                      {isMultipleChoice && (
                        <Badge variant="outline">{t('dashboard:multiple_choice')}</Badge>
                      )}
                      {flaggedQuestions.has(currentQuestion) && (
                        <Badge variant="destructive" className="gap-1">
                          <Flag className="h-3 w-3" />
                          {t('dashboard:flagged')}
                        </Badge>
                      )}
                    </div>
                    <CardDescription
                      className="font-medium text-foreground mt-4"
                      style={{ fontSize: `${fontSize}px`, lineHeight: '1.6' }}
                    >
                      {currentQuestionData.question}
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleFlag(currentQuestion)}
                  >
                    <Flag className={cn(
                      "h-4 w-4",
                      flaggedQuestions.has(currentQuestion) && "fill-destructive text-destructive"
                    )} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {currentQuestionData.options.map((option, index) => {
                  const isSelected = (selectedAnswers[currentQuestion] || []).includes(index);
                  const isCorrect = option.isCorrect;
                  const showCorrectness = showResults;

                  return (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <Card
                        className={cn(
                          "cursor-pointer transition-all",
                          isSelected && !showCorrectness && "border-primary bg-primary/5",
                          showCorrectness && isCorrect && isSelected && "border-green-500 bg-green-50",
                          showCorrectness && isCorrect && !isSelected && "border-green-300 bg-green-50/50",
                          showCorrectness && !isCorrect && isSelected && "border-destructive bg-destructive/5"
                        )}
                        onClick={() => !showResults && handleAnswerSelect(currentQuestion, index)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "h-6 w-6 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                              isSelected && !showCorrectness && "border-primary bg-primary text-primary-foreground",
                              showCorrectness && isCorrect && "border-green-500 bg-green-500 text-white",
                              showCorrectness && !isCorrect && isSelected && "border-destructive bg-destructive text-destructive-foreground"
                            )}>
                              {showCorrectness ? (
                                isCorrect ? <Check className="h-3 w-3" /> : isSelected ? <X className="h-3 w-3" /> : String.fromCharCode(65 + index)
                              ) : (
                                isSelected ? (
                                  isMultipleChoice ? <Check className="h-3 w-3" /> : <div className="h-2 w-2 rounded-full bg-current" />
                                ) : (
                                  String.fromCharCode(65 + index)
                                )
                              )}
                            </div>
                            <span className="flex-1" style={{ fontSize: `${fontSize}px` }}>{option.text}</span>
                            {showCorrectness && isCorrect && (
                              <CheckCircle2 className="h-5 w-5 text-green-500" />
                            )}
                            {showCorrectness && !isCorrect && isSelected && (
                              <XCircle className="h-5 w-5 text-destructive" />
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Action Bar */}
            {/* {showFeedback && (
              <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
                <CardContent className="py-4">
                  <div className="flex items-center justify-center gap-2 flex-wrap">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => setShowExplanation(true)}
                      disabled={!showResults}
                    >
                      <Lightbulb className="h-4 w-4" />
                      <span className="hidden sm:inline">Explication</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => setShowNoteModal(true)}
                    >
                      <NotebookPen className="h-4 w-4" />
                      <span className="hidden sm:inline">Note</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => toast.info("Fonctionnalité à venir")}
                    >
                      <Bookmark className="h-4 w-4" />
                      <span className="hidden sm:inline">Playlist</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => toast.info("Fonctionnalité à venir")}
                    >
                      <AlbumIcon className="h-4 w-4" />
                      <span className="hidden sm:inline">Collection</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 text-destructive hover:text-destructive"
                      onClick={() => setShowReportModal(true)}
                    >
                      <TriangleAlert className="h-4 w-4" />
                      <span className="hidden sm:inline">Signaler</span>
                    </Button>
                  </div>
                  <p className="text-xs text-center text-muted-foreground mt-2">
                    {showResults ? "Cliquez sur Explication pour voir les réponses détaillées" : "Terminez l'examen pour voir les explications"}
                  </p>
                </CardContent>
              </Card>
            )} */}

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={goToPrevious}
                disabled={currentQuestion === 0}
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                {t('dashboard:previous')}
              </Button>

              <span className="text-sm text-muted-foreground">
                {currentQuestion + 1} / {questions.length}
              </span>

              <Button
                onClick={goToNext}
                disabled={currentQuestion === questions.length - 1}
              >
                {t('dashboard:next')}
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Sidebar - Questions Overview */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-base flex items-center justify-between">
                  <span>{t('dashboard:questions_by_session')}</span>
                  <Badge variant="secondary">{questions.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px] pr-4">
                  {Object.entries(getQuestionsBySession()).map(([sessionName, sessionQuestions], sessionIndex) => {
                    const isCollapsed = collapsedSessions.has(sessionName);
                    const startIndex = questions.findIndex(q => q.sessionLabel === sessionName);
                    
                    return (
                      <div key={sessionName} className="mb-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-between mb-2 font-semibold"
                          onClick={() => toggleSession(sessionName)}
                        >
                          <span className="text-sm truncate">{sessionName}</span>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {sessionQuestions.length}
                            </Badge>
                            {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                          </div>
                        </Button>
                        
                        {!isCollapsed && (
                          <div className="grid grid-cols-5 gap-2 pl-2">
                            {sessionQuestions.map((_, qIndex) => {
                              const globalIndex = startIndex + qIndex;
                              const status = getQuestionStatus(globalIndex);
                              return (
                                <Button
                                  key={globalIndex}
                                  variant={globalIndex === currentQuestion ? "default" : "outline"}
                                  size="sm"
                                  className={cn(
                                    "relative",
                                    status === 'correct' && "border-green-500 bg-green-50 hover:bg-green-100",
                                    status === 'incorrect' && "border-destructive bg-destructive/10 hover:bg-destructive/20",
                                    status === 'answered' && globalIndex !== currentQuestion && "border-blue-500 bg-blue-50"
                                  )}
                                  onClick={() => goToQuestion(globalIndex)}
                                >
                                  {qIndex + 1}
                                  {flaggedQuestions.has(globalIndex) && (
                                    <Flag className="h-2 w-2 absolute -top-1 -right-1 fill-destructive text-destructive" />
                                  )}
                                </Button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </ScrollArea>

                {showResults && (
                  <div className="mt-6 space-y-4">
                    <Separator />
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{t('dashboard:score')}</span>
                        <span className="font-bold text-lg">
                          {score.correct}/{score.total}
                        </span>
                      </div>
                      <Progress value={(score.correct / score.total) * 100} />
                      <p className="text-xs text-center text-muted-foreground">
                        {Math.round((score.correct / score.total) * 100)}% {t('dashboard:success_rate')}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full gap-2"
                      onClick={handleRetry}
                    >
                      <RotateCcw className="h-4 w-4" />
                      {t('dashboard:retry')}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Mobile Floating Action Button */}
      <div className="lg:hidden fixed bottom-6 right-6 flex flex-col gap-2 z-30">
        <Button
          size="icon"
          className="h-14 w-14 rounded-full shadow-lg"
          onClick={() => setShowSidebar(!showSidebar)}
        >
          <BookOpen className="h-6 w-6" />
        </Button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {showSidebar && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => setShowSidebar(false)}
        >
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="absolute right-0 top-0 bottom-0 w-80 max-w-[90vw] bg-white shadow-xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">{t('dashboard:questions')}</h3>
                <Button variant="ghost" size="icon" onClick={() => setShowSidebar(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <ScrollArea className="h-[calc(100vh-100px)]">
                {Object.entries(getQuestionsBySession()).map(([sessionName, sessionQuestions]) => {
                  const isCollapsed = collapsedSessions.has(sessionName);
                  const startIndex = questions.findIndex(q => q.sessionLabel === sessionName);
                  
                  return (
                    <div key={sessionName} className="mb-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-between mb-2"
                        onClick={() => toggleSession(sessionName)}
                      >
                        <span className="text-sm truncate">{sessionName}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{sessionQuestions.length}</Badge>
                          {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                        </div>
                      </Button>
                      
                      {!isCollapsed && (
                        <div className="grid grid-cols-5 gap-2">
                          {sessionQuestions.map((_, qIndex) => {
                            const globalIndex = startIndex + qIndex;
                            const status = getQuestionStatus(globalIndex);
                            return (
                              <Button
                                key={globalIndex}
                                variant={globalIndex === currentQuestion ? "default" : "outline"}
                                size="sm"
                                className={cn(
                                  "relative",
                                  status === 'correct' && "border-green-500 bg-green-50",
                                  status === 'incorrect' && "border-destructive bg-destructive/10",
                                  status === 'answered' && globalIndex !== currentQuestion && "border-blue-500 bg-blue-50"
                                )}
                                onClick={() => goToQuestion(globalIndex)}
                              >
                                {qIndex + 1}
                                {flaggedQuestions.has(globalIndex) && (
                                  <Flag className="h-2 w-2 absolute -top-1 -right-1 fill-destructive text-destructive" />
                                )}
                              </Button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </ScrollArea>
            </div>
          </motion.div>
        </div>
      )}

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
    </div>
  );
};

export default ExamPage;
