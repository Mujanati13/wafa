import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { 
  BarChart3, 
  TrendingUp, 
  Award, 
  BookOpen,
  ChevronRight,
  Trophy,
  MessageCircle,
  Lightbulb,
  HelpCircle,
  Target,
  Filter
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
import { useNavigate } from "react-router-dom";

const StatisticsPage = () => {
  const { t } = useTranslation(['dashboard', 'common']);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [modules, setModules] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [activeTab, setActiveTab] = useState("modules");
  const [selectedSemester, setSelectedSemester] = useState("all");
  const [userSemesters, setUserSemesters] = useState([]);

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
        const userSems = user?.semesters || [];
        setUserProfile(user);
        setUserSemesters(userSems);
        setStats(statsData.data?.stats || statsData.data);
        
        // Process modules data - API returns { success, count, data: [...modules] }
        const modulesList = modulesData.data?.data || modulesData.data || [];
        const moduleProgress = statsData.data?.stats?.moduleProgress || [];
        
        // Ensure modulesList is an array
        const modulesArray = Array.isArray(modulesList) ? modulesList : [];
        
        // Get user's subscribed semesters
        const userSemesters = user?.semesters || [];
        const userPlan = user?.plan || 'Free';
        
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

  // Filter and group modules by semester
  const filteredAndGroupedModules = useMemo(() => {
    let filtered = modules;
    
    if (selectedSemester !== "all") {
      filtered = modules.filter(m => m.semester === selectedSemester);
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
  }, [modules, selectedSemester]);

  // Calculate overall statistics based on filtered modules
  const overallStats = useMemo(() => {
    const modulesToCount = selectedSemester === "all" ? modules : Object.values(filteredAndGroupedModules).flat();
    
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
  }, [modules, selectedSemester, filteredAndGroupedModules]);

  // Module Stats Card Component
  const ModuleStatsCard = ({ module, index, onClick }) => {
    const percentage = module.totalQuestions > 0 
      ? Math.round((module.questionsAnswered / module.totalQuestions) * 100) 
      : 0;
    
    const total = module.correctAnswers + module.incorrectAnswers;
    const correctPercent = total > 0 ? (module.correctAnswers / total) * 100 : 0;
    const incorrectPercent = total > 0 ? (module.incorrectAnswers / total) * 100 : 0;
    const color = module.color || getModuleColor(index);

    return (
      <motion.div
        variants={itemVariants}
        whileHover={{ scale: 1.02, y: -2 }}
        transition={{ duration: 0.2 }}
        onClick={onClick}
        className="bg-blue-50/80 rounded-xl p-4 cursor-pointer border border-blue-100 hover:border-blue-200 hover:shadow-md transition-all duration-200"
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

            {/* Progress Bar (Green/Red) */}
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden flex">
              {correctPercent > 0 && (
                <div 
                  className="h-full bg-emerald-500 transition-all duration-300"
                  style={{ width: `${correctPercent}%` }}
                />
              )}
              {incorrectPercent > 0 && (
                <div 
                  className="h-full bg-red-400 transition-all duration-300"
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
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            <motion.div variants={itemVariants}>
              <Card className="border-blue-100 bg-gradient-to-br from-blue-50 to-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Total Questions</p>
                      <p className="text-3xl font-bold text-blue-600">{overallStats.totalQuestions}</p>
                    </div>
                    <BookOpen className="h-12 w-12 text-blue-200" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="border-green-100 bg-gradient-to-br from-green-50 to-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Réponses Correctes</p>
                      <p className="text-3xl font-bold text-green-600">{overallStats.totalCorrect}</p>
                    </div>
                    <Award className="h-12 w-12 text-green-200" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="border-red-100 bg-gradient-to-br from-red-50 to-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Réponses Incorrectes</p>
                      <p className="text-3xl font-bold text-red-600">{overallStats.totalIncorrect}</p>
                    </div>
                    <TrendingUp className="h-12 w-12 text-red-200" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="border-purple-100 bg-gradient-to-br from-purple-50 to-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Taux de Réussite</p>
                      <p className="text-3xl font-bold text-purple-600">{overallStats.avgSuccess}%</p>
                    </div>
                    <Award className="h-12 w-12 text-purple-200" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}

        {/* Filter and Semester Selection */}
        <motion.div variants={itemVariants} className="flex items-center gap-4">
          <Filter className="h-5 w-5 text-slate-600" />
          <span className="text-sm font-medium text-slate-700">Filtrer par semestre:</span>
          <Select value={selectedSemester} onValueChange={setSelectedSemester}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Tous les semestres" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les semestres</SelectItem>
              {userSemesters.map((sem) => (
                <SelectItem key={sem} value={sem}>
                  {sem}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </motion.div>
        <motion.div variants={itemVariants}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-flex bg-white border shadow-sm">
              <TabsTrigger 
                value="modules" 
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
              >
                <BookOpen className="h-4 w-4 mr-2 hidden sm:block" />
                MODULES
              </TabsTrigger>
              <TabsTrigger 
                value="exam-years"
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
              >
                Exam years
              </TabsTrigger>
              <TabsTrigger 
                value="par-cours"
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
              >
                par cours
              </TabsTrigger>
              <TabsTrigger 
                value="qcm-banque"
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
              >
                qcm banque
              </TabsTrigger>
            </TabsList>

            {/* Modules Tab Content */}
            <TabsContent value="modules" className="mt-6">
              {Object.keys(filteredAndGroupedModules).length > 0 ? (
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
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                      >
                        {filteredAndGroupedModules[semester].map((module, index) => (
                          <ModuleStatsCard 
                            key={module._id || index}
                            module={module}
                            index={index}
                            onClick={() => navigate(`/dashboard/modules/${module._id}`)}
                          />
                        ))}
                      </motion.div>
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

            {/* Exam Years Tab */}
            <TabsContent value="exam-years" className="mt-6">
              <div className="text-center py-12 text-slate-500">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Statistiques par année d'examen</p>
                <p className="text-sm mt-2">Bientôt disponible</p>
              </div>
            </TabsContent>

            {/* Par Cours Tab */}
            <TabsContent value="par-cours" className="mt-6">
              <div className="text-center py-12 text-slate-500">
                <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Statistiques par cours</p>
                <p className="text-sm mt-2">Bientôt disponible</p>
              </div>
            </TabsContent>

            {/* QCM Banque Tab */}
            <TabsContent value="qcm-banque" className="mt-6">
              <div className="text-center py-12 text-slate-500">
                <HelpCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Statistiques QCM Banque</p>
                <p className="text-sm mt-2">Bientôt disponible</p>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>

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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Report Problem Points */}
                <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl border border-green-200">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg">
                    <MessageCircle className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">Report de problème</p>
                    <p className="text-sm text-green-600 font-medium">= 30 points</p>
                    <p className="text-xs text-slate-500">Ballon vert</p>
                  </div>
                </div>

                {/* Explanation Points */}
                <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center shadow-lg">
                    <Lightbulb className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">Explications</p>
                    <p className="text-sm text-blue-600 font-medium">= 40 points</p>
                    <p className="text-xs text-slate-500">Ballon bleu/gold</p>
                  </div>
                </div>

                {/* Points per Question */}
                <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-xl border border-purple-200">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center shadow-lg">
                    <Award className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">Questions correctes</p>
                    <p className="text-sm text-purple-600 font-medium">1 point = 1 question</p>
                    <p className="text-xs text-slate-500">Chaque bonne réponse</p>
                  </div>
                </div>

                {/* Level System */}
                <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-xl border border-amber-200">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
                    <TrendingUp className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">Système de niveau</p>
                    <p className="text-sm text-amber-600 font-medium">1% = 1 level</p>
                    <p className="text-xs text-slate-500">35% = Level 35</p>
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
