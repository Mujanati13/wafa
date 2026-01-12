import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { 
  BarChart3, 
  TrendingUp, 
  Award, 
  BookOpen,
  ChevronRight,
  ChevronLeft,
  Trophy,
  MessageCircle,
  Lightbulb,
  HelpCircle,
  Target,
  Filter,
  Calendar,
  FileText,
  Database,
  X,
  Play
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CircularProgress } from "@/components/ui/circular-progress";
import { dashboardService } from "@/services/dashboardService";
import { moduleService } from "@/services/moduleService";
import { api } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useSemester } from "@/context/SemesterContext";

const StatisticsPage = () => {
  const { t } = useTranslation(['dashboard', 'common']);
  const navigate = useNavigate();
  const { selectedSemester: contextSemester } = useSemester();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [modules, setModules] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [activeTab, setActiveTab] = useState("modules");
  const [showIncorrectPopup, setShowIncorrectPopup] = useState(false);
  
  // Selected module state for showing exams
  const [selectedModule, setSelectedModule] = useState(null);
  const [moduleExamTab, setModuleExamTab] = useState("exam-years");
  const [moduleExams, setModuleExams] = useState({
    examYears: [],
    parCours: [],
    qcmBanque: []
  });
  const [loadingExams, setLoadingExams] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch all data in parallel
        const [profileData, statsData, modulesData] = await Promise.all([
          dashboardService.getUserProfile(),
          dashboardService.getUserStats(),
          moduleService.getAllmodules()
        ]);

        const user = profileData.data?.user || profileData.data;
        setUserProfile(user);
        
        // Check if user has premium access - redirect free users
        const userPlan = user?.plan || 'Free';
        if (userPlan === 'Free') {
          toast.error('Cette fonctionnalité est réservée aux abonnés Premium', {
            description: 'Mettez à niveau votre plan pour accéder aux statistiques détaillées.',
            action: {
              label: 'Voir les plans',
              onClick: () => navigate('/dashboard/subscription')
            },
            duration: 5000,
          });
          navigate('/dashboard/subscription');
          return;
        }
        
        setStats(statsData.data?.stats || statsData.data);
        
        // Process modules data - API returns { success, count, data: [...modules] }
        const modulesList = modulesData.data?.data || modulesData.data || [];
        const moduleProgress = statsData.data?.stats?.moduleProgress || [];
        
        // Ensure modulesList is an array
        const modulesArray = Array.isArray(modulesList) ? modulesList : [];
        
        // Get user's subscribed semesters
        const userSemesters = user?.semesters || [];
        
        // Filter modules based on user's subscription
        const filteredModules = modulesArray.filter(module => {
          // If user has no subscription (Free plan with no semesters), show nothing or limited
          if (userPlan === 'Free' && userSemesters.length === 0) {
            return false; // Or return true for first module only, etc.
          }
          
          // Check if module's semester is in user's subscribed semesters
          if (userSemesters.length > 0) {
            return userSemesters.includes(module.semester);
          }
          
          return false;
        });
        
        // Merge module data with progress
        const modulesWithProgress = filteredModules.map(module => {
          const progress = moduleProgress.find(
            mp => mp.moduleId?.toString() === module._id?.toString()
          ) || {};
          
          return {
            ...module,
            questionsAnswered: progress.questionsAttempted || 0,
            correctAnswers: progress.correctAnswers || 0,
            incorrectAnswers: progress.incorrectAnswers || 0,
            totalQuestions: module.totalQuestions || 0
          };
        });
        
        setModules(modulesWithProgress);

      } catch (error) {
        console.error("Error fetching statistics:", error);
        toast.error("Impossible de charger les statistiques");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fetch exams when a module is selected
  const fetchModuleExams = async (moduleId) => {
    setLoadingExams(true);
    try {
      // Fetch all exam types for this module
      const [examYearsRes, examCoursesRes, qcmBanqueRes] = await Promise.all([
        api.get(`/exams/module/${moduleId}`).catch(() => ({ data: { data: [] } })),
        api.get(`/exam-courses/module/${moduleId}`).catch(() => ({ data: { data: [] } })),
        api.get(`/qcm-banque/module/${moduleId}`).catch(() => ({ data: { data: [] } }))
      ]);

      setModuleExams({
        examYears: examYearsRes.data?.data || [],
        parCours: examCoursesRes.data?.data || [],
        qcmBanque: qcmBanqueRes.data?.data || []
      });
    } catch (error) {
      console.error("Error fetching module exams:", error);
      toast.error("Impossible de charger les examens");
    } finally {
      setLoadingExams(false);
    }
  };

  // Handle module selection
  const handleModuleClick = (module) => {
    setSelectedModule(module);
    setModuleExamTab("exam-years");
    fetchModuleExams(module._id);
  };

  // Close module detail
  const handleCloseModuleDetail = () => {
    setSelectedModule(null);
    setModuleExams({ examYears: [], parCours: [], qcmBanque: [] });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  // Module color palette
  const moduleColors = [
    "#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", 
    "#ec4899", "#06b6d4", "#6366f1", "#84cc16"
  ];

  const getModuleColor = (index) => moduleColors[index % moduleColors.length];

  // Filter and group modules by semester from context
  const filteredAndGroupedModules = useMemo(() => {
    let filtered = modules;
    
    // Filter by selected semester from context (not "all")
    if (contextSemester) {
      filtered = modules.filter(m => m.semester === contextSemester);
    }
    
    // Group by semester
    const grouped = {};
    filtered.forEach(module => {
      if (!grouped[module.semester]) {
        grouped[module.semester] = [];
      }
      grouped[module.semester].push(module);
    });
    
    return grouped;
  }, [modules, contextSemester]);

  // Calculate overall statistics based on filtered modules
  const overallStats = useMemo(() => {
    const modulesToCount = Object.values(filteredAndGroupedModules).flat();
    
    const totalQuestions = modulesToCount.reduce((sum, m) => sum + (m.questionsAnswered || 0), 0);
    const totalCorrect = modulesToCount.reduce((sum, m) => sum + (m.correctAnswers || 0), 0);
    const totalIncorrect = modulesToCount.reduce((sum, m) => sum + (m.incorrectAnswers || 0), 0);
    const totalModules = modulesToCount.length;
    const avgSuccess = totalQuestions > 0 ? (totalCorrect / totalQuestions * 100) : 0;
    
    return {
      totalQuestions,
      totalCorrect,
      totalIncorrect,
      totalModules,
      avgSuccess: Math.round(avgSuccess)
    };
  }, [filteredAndGroupedModules]);

  // Module Stats Card Component
  const ModuleStatsCard = ({ module, index, onClick, isSelected }) => {
    const percentage = module.totalQuestions > 0 
      ? Math.round((module.questionsAnswered / module.totalQuestions) * 100) 
      : 0;
    
    // Calculate percentages based on TOTAL questions, not just answered ones
    const correctPercent = module.totalQuestions > 0 
      ? (module.correctAnswers / module.totalQuestions) * 100 
      : 0;
    const incorrectPercent = module.totalQuestions > 0 
      ? (module.incorrectAnswers / module.totalQuestions) * 100 
      : 0;
    const color = module.color || getModuleColor(index);

    return (
      <motion.div
        variants={itemVariants}
        whileHover={{ scale: 1.02, y: -2 }}
        transition={{ duration: 0.2 }}
        onClick={onClick}
        className={`bg-blue-50/80 rounded-xl p-4 cursor-pointer border-2 transition-all duration-200 ${
          isSelected 
            ? "border-blue-500 shadow-lg ring-2 ring-blue-200" 
            : "border-blue-100 hover:border-blue-200 hover:shadow-md"
        }`}
      >
        <div className="flex items-center gap-4">
          {/* Circular Progress */}
          <CircularProgress 
            value={percentage} 
            size={50} 
            strokeWidth={5}
            color={color}
            trackColor="#e0e7ff"
          />

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Module Name */}
            <h3 className="font-semibold text-slate-800 text-sm mb-1 truncate">
              {module.name}
            </h3>

            {/* Question Count */}
            <p className="text-xs text-slate-500 mb-2">
              {module.questionsAnswered} sur {module.totalQuestions}
            </p>

            {/* Progress Bar (Green for correct, Red for incorrect, gray for remaining) */}
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden flex">
              {correctPercent > 0 && (
                <div 
                  className="h-full bg-emerald-500 transition-all duration-300"
                  style={{ width: `${correctPercent}%` }}
                />
              )}
              {incorrectPercent > 0 && (
                <div 
                  className="h-full bg-red-500 transition-all duration-300"
                  style={{ width: `${incorrectPercent}%` }}
                />
              )}
            </div>
          </div>

          {/* Arrow */}
          <ChevronRight className="h-5 w-5 text-blue-500 flex-shrink-0" />
        </div>
      </motion.div>
    );
  };

  // Exam Card Component for displaying individual exams
  const ExamCard = ({ exam, type, moduleId }) => {
    const questionCount = exam.questions?.length || exam.questionCount || exam.linkedQuestions?.length || 0;
    
    // Calculate progress percentages
    const questionsAnswered = exam.questionsAnswered || 0;
    const correctAnswers = exam.correctAnswers || 0;
    const incorrectAnswers = exam.incorrectAnswers || 0;
    
    const correctPercent = questionCount > 0 ? (correctAnswers / questionCount) * 100 : 0;
    const incorrectPercent = questionCount > 0 ? (incorrectAnswers / questionCount) * 100 : 0;
    const percentage = questionCount > 0 ? Math.round((questionsAnswered / questionCount) * 100) : 0;
    
    // Get the appropriate route based on exam type
    const getExamRoute = () => {
      switch (type) {
        case "exam-years":
          return `/exam/${exam._id}`;
        case "par-cours":
          return `/exam/${exam._id}?type=course`;
        case "qcm-banque":
          return `/exam/${exam._id}?type=qcm`;
        default:
          return "#";
      }
    };

    const getExamTitle = () => {
      if (type === "exam-years") {
        return exam.year || exam.name || "Exam";
      }
      return exam.title || exam.name || "Exam";
    };

    return (
      <motion.div
        whileHover={{ scale: 1.01, x: 4 }}
        className="bg-white rounded-xl p-3 md:p-4 border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
        onClick={() => navigate(getExamRoute())}
      >
        {/* Mobile Layout */}
        <div className="flex flex-col sm:hidden gap-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                {type === "exam-years" && <Calendar className="h-4 w-4 text-blue-600" />}
                {type === "par-cours" && <FileText className="h-4 w-4 text-blue-600" />}
                {type === "qcm-banque" && <Database className="h-4 w-4 text-blue-600" />}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-slate-800 text-sm truncate">{getExamTitle()}</h4>
                <p className="text-xs text-slate-500">
                  {questionCount} question{questionCount !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <button
              className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs flex-shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                navigate(getExamRoute());
              }}
            >
              <Play className="h-3 w-3" />
              <span>Start</span>
            </button>
          </div>

          {/* Progress */}
          {questionsAnswered > 0 && (
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-600">Progression: {percentage}%</span>
                <span className="text-slate-500">{questionsAnswered}/{questionCount}</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden flex">
                {correctPercent > 0 && (
                  <div 
                    className="h-full bg-emerald-500 transition-all duration-300"
                    style={{ width: `${correctPercent}%` }}
                  />
                )}
                {incorrectPercent > 0 && (
                  <div 
                    className="h-full bg-red-500 transition-all duration-300"
                    style={{ width: `${incorrectPercent}%` }}
                  />
                )}
              </div>
              {(correctAnswers > 0 || incorrectAnswers > 0) && (
                <div className="flex items-center justify-between mt-1 text-xs">
                  <span className="text-emerald-600 flex items-center gap-1">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                    {correctAnswers} correct
                  </span>
                  <span className="text-red-600 flex items-center gap-1">
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    {incorrectAnswers} incorrect
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Desktop Layout */}
        <div className="hidden sm:flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
              {type === "exam-years" && <Calendar className="h-5 w-5 text-blue-600" />}
              {type === "par-cours" && <FileText className="h-5 w-5 text-blue-600" />}
              {type === "qcm-banque" && <Database className="h-5 w-5 text-blue-600" />}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-slate-800">{getExamTitle()}</h4>
              <p className="text-sm text-slate-500">
                {questionCount} question{questionCount !== 1 ? 's' : ''}
              </p>
              
              {/* Progress for Desktop */}
              {questionsAnswered > 0 && (
                <div className="mt-2 max-w-xs">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-600">Progression: {percentage}%</span>
                    <span className="text-slate-500">{questionsAnswered}/{questionCount}</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden flex">
                    {correctPercent > 0 && (
                      <div 
                        className="h-full bg-emerald-500 transition-all duration-300"
                        style={{ width: `${correctPercent}%` }}
                      />
                    )}
                    {incorrectPercent > 0 && (
                      <div 
                        className="h-full bg-red-500 transition-all duration-300"
                        style={{ width: `${incorrectPercent}%` }}
                      />
                    )}
                  </div>
                  {(correctAnswers > 0 || incorrectAnswers > 0) && (
                    <div className="flex items-center gap-4 mt-1 text-xs">
                      <span className="text-emerald-600 flex items-center gap-1">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                        {correctAnswers} correct
                      </span>
                      <span className="text-red-600 flex items-center gap-1">
                        <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                        {incorrectAnswers} incorrect
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          <button
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex-shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              navigate(getExamRoute());
            }}
          >
            <Play className="h-4 w-4" />
            <span>Commencer</span>
          </button>
        </div>
      </motion.div>
    );
  };

  // Empty State Component for when no exams exist
  const EmptyExamState = ({ type }) => {
    const getEmptyMessage = () => {
      switch (type) {
        case "exam-years":
          return "Aucun examen par année disponible pour ce module";
        case "par-cours":
          return "Aucun cours disponible pour ce module";
        case "qcm-banque":
          return "Aucun QCM banque disponible pour ce module";
        default:
          return "Aucun contenu disponible";
      }
    };

    return (
      <div className="text-center py-8 text-slate-500">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
          {type === "exam-years" && <Calendar className="h-8 w-8 text-slate-400" />}
          {type === "par-cours" && <FileText className="h-8 w-8 text-slate-400" />}
          {type === "qcm-banque" && <Database className="h-8 w-8 text-slate-400" />}
        </div>
        <p className="font-medium">{getEmptyMessage()}</p>
        <p className="text-sm mt-1 text-slate-400">Revenez bientôt pour du nouveau contenu</p>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-12 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(9)].map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 p-4 md:p-6">
      <motion.div 
        className="max-w-7xl mx-auto space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div variants={itemVariants}>
          <Card className="border-blue-100 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                    <BarChart3 className="h-8 w-8" />
                    Statistiques
                  </h1>
                  <p className="text-blue-100">
                    Suivez votre progression par module
                  </p>
                </div>
                <div className="hidden md:flex items-center gap-2">
                  <Badge className="bg-white/20 text-white border-white/30">
                    {userProfile?.plan || 'Gratuit'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Overall Statistics Cards */}
        {activeTab === "modules" && (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4"
          >
            <motion.div variants={itemVariants}>
              <Card className="border-blue-100 bg-gradient-to-br from-blue-50 to-white">
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs md:text-sm text-slate-600 mb-1">Total Questions</p>
                      <p className="text-xl md:text-3xl font-bold text-blue-600">{overallStats.totalQuestions}</p>
                    </div>
                    <BookOpen className="h-8 w-8 md:h-12 md:w-12 text-blue-200" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="border-green-100 bg-gradient-to-br from-green-50 to-white">
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs md:text-sm text-slate-600 mb-1">Correctes</p>
                      <p className="text-xl md:text-3xl font-bold text-green-600">{overallStats.totalCorrect}</p>
                    </div>
                    <Award className="h-8 w-8 md:h-12 md:w-12 text-green-200" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card 
                className="border-red-100 bg-gradient-to-br from-red-50 to-white cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setShowIncorrectPopup(true)}
              >
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs md:text-sm text-slate-600 mb-1">Incorrectes</p>
                      <p className="text-xl md:text-3xl font-bold text-red-600">{overallStats.totalIncorrect}</p>
                    </div>
                    <TrendingUp className="h-8 w-8 md:h-12 md:w-12 text-red-200" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="border-purple-100 bg-gradient-to-br from-purple-50 to-white">
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs md:text-sm text-slate-600 mb-1">Taux Réussite</p>
                      <p className="text-xl md:text-3xl font-bold text-purple-600">{overallStats.avgSuccess}%</p>
                    </div>
                    <Award className="h-8 w-8 md:h-12 md:w-12 text-purple-200" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}

        {/* Module Statistics - No additional filters needed, uses context semester */}
        <motion.div variants={itemVariants}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0 pb-2 md:pb-0">
              <TabsList className="inline-flex w-auto min-w-full sm:min-w-0 sm:w-auto lg:inline-flex bg-white border shadow-sm">
                <TabsTrigger 
                  value="modules" 
                  className="flex-1 sm:flex-initial text-xs sm:text-sm px-3 sm:px-4 data-[state=active]:bg-blue-600 data-[state=active]:text-white whitespace-nowrap"
                >
                  <BookOpen className="h-4 w-4 mr-1 sm:mr-2 hidden xs:block" />
                  MODULES
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Modules Tab Content */}
            <TabsContent value="modules" className="mt-6">
              {!contextSemester ? (
                <div className="text-center py-12 text-slate-500">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="font-medium">Aucun semestre sélectionné</p>
                  <p className="text-sm mt-2">
                    Sélectionnez un semestre dans le menu principal pour voir les statistiques
                  </p>
                </div>
              ) : Object.keys(filteredAndGroupedModules).length > 0 ? (
                Object.keys(filteredAndGroupedModules)
                  .sort()
                  .map((semester) => (
                    <div key={semester} className="mb-12">
                      {/* Semester Header */}
                      <motion.div 
                        variants={itemVariants}
                        className="flex items-center gap-3 mb-6"
                      >
                        <Badge className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-base py-2 px-4">
                          {semester}
                        </Badge>
                        <p className="text-slate-600">
                          {filteredAndGroupedModules[semester].length} module{filteredAndGroupedModules[semester].length !== 1 ? 's' : ''}
                        </p>
                      </motion.div>

                      {/* Modules Grid */}
                      <motion.div 
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                      >
                        {filteredAndGroupedModules[semester].map((module, index) => (
                          <React.Fragment key={module._id || index}>
                            <ModuleStatsCard 
                              module={module}
                              index={index}
                              onClick={() => handleModuleClick(module)}
                              isSelected={selectedModule?._id === module._id}
                            />
                          </React.Fragment>
                        ))}
                      </motion.div>

                      {/* Module Detail Section - Shows inline below selected module */}
                      <AnimatePresence>
                        {selectedModule && selectedModule.semester === semester && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-6"
                          >
                            <Card className="border-blue-200 shadow-lg">
                              <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <button
                                      onClick={handleCloseModuleDetail}
                                      className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                                    >
                                      <ChevronLeft className="h-5 w-5" />
                                    </button>
                                    <div>
                                      <CardTitle className="text-lg">{selectedModule.name}</CardTitle>
                                      <CardDescription className="text-blue-100">
                                        {selectedModule.semester} • {selectedModule.totalQuestions || 0} questions
                                      </CardDescription>
                                    </div>
                                  </div>
                                  <button
                                    onClick={handleCloseModuleDetail}
                                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                                  >
                                    <X className="h-5 w-5" />
                                  </button>
                                </div>
                              </CardHeader>
                              <CardContent className="p-4">
                                {/* Exam Type Tabs */}
                                <Tabs value={moduleExamTab} onValueChange={setModuleExamTab} className="w-full">
                                  <TabsList className="w-full grid grid-cols-3 bg-slate-100">
                                    <TabsTrigger 
                                      value="exam-years"
                                      className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white text-xs sm:text-sm"
                                    >
                                      <Calendar className="h-4 w-4" />
                                      <span className="hidden sm:inline">Exam par année</span>
                                      <span className="sm:hidden">Année</span>
                                    </TabsTrigger>
                                    <TabsTrigger 
                                      value="par-cours"
                                      className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white text-xs sm:text-sm"
                                    >
                                      <FileText className="h-4 w-4" />
                                      <span className="hidden sm:inline">Par cours</span>
                                      <span className="sm:hidden">Cours</span>
                                    </TabsTrigger>
                                    <TabsTrigger 
                                      value="qcm-banque"
                                      className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white text-xs sm:text-sm"
                                    >
                                      <Database className="h-4 w-4" />
                                      <span className="hidden sm:inline">QCM banque</span>
                                      <span className="sm:hidden">QCM</span>
                                    </TabsTrigger>
                                  </TabsList>

                                  {/* Loading State */}
                                  {loadingExams ? (
                                    <div className="mt-6 space-y-3">
                                      {[1, 2, 3].map((i) => (
                                        <Skeleton key={i} className="h-20 w-full rounded-xl" />
                                      ))}
                                    </div>
                                  ) : (
                                    <>
                                      {/* Exam Years Content */}
                                      <TabsContent value="exam-years" className="mt-4">
                                        {moduleExams.examYears.length > 0 ? (
                                          <div className="space-y-3">
                                            {moduleExams.examYears.map((exam) => (
                                              <ExamCard 
                                                key={exam._id} 
                                                exam={exam} 
                                                type="exam-years"
                                                moduleId={selectedModule._id}
                                              />
                                            ))}
                                          </div>
                                        ) : (
                                          <EmptyExamState type="exam-years" />
                                        )}
                                      </TabsContent>

                                      {/* Par Cours Content */}
                                      <TabsContent value="par-cours" className="mt-4">
                                        {moduleExams.parCours.length > 0 ? (
                                          <div className="space-y-3">
                                            {moduleExams.parCours.map((exam) => (
                                              <ExamCard 
                                                key={exam._id} 
                                                exam={exam} 
                                                type="par-cours"
                                                moduleId={selectedModule._id}
                                              />
                                            ))}
                                          </div>
                                        ) : (
                                          <EmptyExamState type="par-cours" />
                                        )}
                                      </TabsContent>

                                      {/* QCM Banque Content */}
                                      <TabsContent value="qcm-banque" className="mt-4">
                                        {moduleExams.qcmBanque.length > 0 ? (
                                          <div className="space-y-3">
                                            {moduleExams.qcmBanque.map((exam) => (
                                              <ExamCard 
                                                key={exam._id} 
                                                exam={exam} 
                                                type="qcm-banque"
                                                moduleId={selectedModule._id}
                                              />
                                            ))}
                                          </div>
                                        ) : (
                                          <EmptyExamState type="qcm-banque" />
                                        )}
                                      </TabsContent>
                                    </>
                                  )}
                                </Tabs>
                              </CardContent>
                            </Card>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))
              ) : (
                <div className="text-center py-12 text-slate-500">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="font-medium">Aucun module disponible</p>
                  <p className="text-sm mt-2">
                    {userProfile?.plan === 'Free' 
                      ? "Abonnez-vous pour accéder aux modules et voir vos statistiques"
                      : "Sélectionnez des semestres dans votre abonnement pour voir les modules"
                    }
                  </p>
                  <button 
                    onClick={() => navigate('/dashboard/subscription')}
                    className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Voir les abonnements
                  </button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Incorrect Answers Popup */}
        <AnimatePresence>
          {showIncorrectPopup && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                onClick={() => setShowIncorrectPopup(false)}
              >
                {/* Modal */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
                >
                  <div className="sticky top-0 bg-gradient-to-r from-red-600 to-rose-600 text-white p-6 rounded-t-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-bold flex items-center gap-3">
                          <TrendingUp className="h-6 w-6" />
                          Réponses Incorrectes
                        </h2>
                        <p className="text-red-100 mt-1">
                          Détails de vos erreurs par module
                        </p>
                      </div>
                      <button
                        onClick={() => setShowIncorrectPopup(false)}
                        className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                      >
                        <X className="h-6 w-6" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    {/* Summary */}
                    <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-slate-600">Total d'erreurs</p>
                          <p className="text-3xl font-bold text-red-600">{overallStats.totalIncorrect}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-slate-600">Taux d'erreur</p>
                          <p className="text-2xl font-bold text-red-600">
                            {overallStats.totalQuestions > 0 
                              ? Math.round((overallStats.totalIncorrect / overallStats.totalQuestions) * 100)
                              : 0}%
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Modules with incorrect answers */}
                    <div className="space-y-3">
                      {Object.values(filteredAndGroupedModules)
                        .flat()
                        .filter(m => m.incorrectAnswers > 0)
                        .sort((a, b) => b.incorrectAnswers - a.incorrectAnswers)
                        .map((module, index) => {
                          const errorRate = module.questionsAnswered > 0
                            ? Math.round((module.incorrectAnswers / module.questionsAnswered) * 100)
                            : 0;
                          
                          return (
                            <div 
                              key={module._id || index}
                              className="p-4 bg-white border border-slate-200 rounded-lg hover:shadow-md transition-shadow"
                            >
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex-1">
                                  <h3 className="font-semibold text-slate-800">{module.name}</h3>
                                  <p className="text-xs text-slate-500 mt-1">{module.semester}</p>
                                </div>
                                <Badge className="bg-red-100 text-red-700 border-red-200">
                                  {module.incorrectAnswers} erreurs
                                </Badge>
                              </div>
                              
                              {/* Progress bar */}
                              <div className="space-y-2">
                                <div className="flex justify-between text-xs text-slate-600">
                                  <span>{module.correctAnswers} correctes</span>
                                  <span>{errorRate}% d'erreurs</span>
                                </div>
                                <div className="h-2 bg-gray-200 rounded-full overflow-hidden flex">
                                  <div 
                                    className="h-full bg-emerald-500"
                                    style={{ 
                                      width: `${module.questionsAnswered > 0 
                                        ? (module.correctAnswers / module.questionsAnswered) * 100 
                                        : 0}%` 
                                    }}
                                  />
                                  <div 
                                    className="h-full bg-red-500"
                                    style={{ 
                                      width: `${module.questionsAnswered > 0 
                                        ? (module.incorrectAnswers / module.questionsAnswered) * 100 
                                        : 0}%` 
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      
                      {Object.values(filteredAndGroupedModules).flat().filter(m => m.incorrectAnswers > 0).length === 0 && (
                        <div className="text-center py-8 text-slate-500">
                          <Award className="h-12 w-12 mx-auto mb-4 text-emerald-400" />
                          <p className="font-medium">Aucune erreur trouvée!</p>
                          <p className="text-sm mt-2">Vous n'avez pas encore de réponses incorrectes</p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Classement / Points System Info */}
        <motion.div variants={itemVariants}>
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-600">
                <Trophy className="h-5 w-5" />
                Classement - Système de Points
              </CardTitle>
              <CardDescription>
                Comment gagner des points et monter dans le classement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                {/* Correct Answer Points */}
                <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg">
                    <Award className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">Réponse correcte</p>
                    <p className="text-sm text-emerald-600 font-medium">+2 points</p>
                    <p className="text-xs text-slate-500">Chaque bonne réponse</p>
                  </div>
                </div>

                {/* Report Problem Points */}
                <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl border border-green-200">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg">
                    <MessageCircle className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">Report approuvé</p>
                    <p className="text-sm text-green-600 font-medium">+1 point vert = 30 pts</p>
                    <p className="text-xs text-slate-500">Ballon vert</p>
                  </div>
                </div>

                {/* Explanation Points */}
                <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center shadow-lg">
                    <Lightbulb className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">Explication approuvée</p>
                    <p className="text-sm text-blue-600 font-medium">+1 point bleu = 40 pts</p>
                    <p className="text-xs text-slate-500">Ballon bleu/gold</p>
                  </div>
                </div>

                {/* Level System */}
                <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-xl border border-amber-200">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
                    <TrendingUp className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">Système de niveau</p>
                    <p className="text-sm text-amber-600 font-medium">1 niveau = 50 pts</p>
                    <p className="text-xs text-slate-500">1% = 1% des questions</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default StatisticsPage;
