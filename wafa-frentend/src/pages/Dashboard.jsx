import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { moduleService } from "@/services/moduleService";
import { dashboardService } from "@/services/dashboardService";
import { userService } from "@/services/userService";
import { useSemester } from "@/context/SemesterContext";
import { Lock, Sparkles, TrendingUp, Award, Clock, HelpCircle, ChevronDown, ChevronLeft, ChevronRight, GraduationCap, UserPlus, BarChart3, Shield, RefreshCcw, Settings2, LineChart as LineChartIcon, Activity, BookOpen, FileText, Image as ImageIcon, Download, Book } from "lucide-react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import ModuleCard from "@/components/Dashboard/ModuleCard";
import ModulePreviewModal from "@/components/Dashboard/ModulePreviewModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader, StatCard } from "@/components/shared";
import { toast } from "sonner";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

const Dashboard = () => {
  const { t } = useTranslation(['dashboard', 'common']);
  const navigate = useNavigate();
  const contactRef = useRef(null);

  // Use shared semester context instead of local state
  const { selectedSemester: semester, setSelectedSemester: setSemester, userSemesters } = useSemester();

  const [coursesData, setCoursesData] = useState(null);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [contactFilter, setContactFilter] = useState("all");
  const [selectedModule, setSelectedModule] = useState(null);
  const [showModuleDialog, setShowModuleDialog] = useState(false);
  const [stats, setStats] = useState({
    examsCompleted: 0,
    averageScore: 0,
    studyHours: 0,
    rank: 0,
  });
  const [moduleProgress, setModuleProgress] = useState([]);
  const [weeklyActivity, setWeeklyActivity] = useState([]);
  const [performanceTrend, setPerformanceTrend] = useState([]);
  const [completionData, setCompletionData] = useState([]);
  const [semesterPage, setSemesterPage] = useState(0); // For paginating semesters (2 at a time)

  // Only show subscribed semesters instead of all semesters
  const semestersPerPage = 2;
  const totalSemesterPages = Math.max(1, Math.ceil(userSemesters.length / semestersPerPage));
  const visibleSemesters = userSemesters.slice(semesterPage * semestersPerPage, (semesterPage + 1) * semestersPerPage);

  // Check if user needs to select free semester on first load
  useEffect(() => {
    const checkFreeSemester = async () => {
      try {
        const response = await userService.checkFreeSemesterStatus();
        if (response.data?.needsToSelectSemester) {
          navigate('/select-semester');
        }
      } catch (error) {
        console.error('Error checking free semester status:', error);
      }
    };
    checkFreeSemester();
  }, [navigate]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Try to show cached data immediately for instant display
        const cachedModules = localStorage.getItem("modules");
        const cachedUser = localStorage.getItem("userProfile");
        
        if (cachedModules) {
          setCoursesData(JSON.parse(cachedModules));
        }
        if (cachedUser) {
          setUser(JSON.parse(cachedUser));
        }

        // Fetch modules and user profile in parallel
        // Force refresh user profile to get latest data from server
        const [modulesResponse, profileData] = await Promise.all([
          moduleService.getAllmodules(),
          dashboardService.getUserProfile(true)  // Force refresh
        ]);

        const modulesData = modulesResponse.data;
        setCoursesData(modulesData.data);

        const userData = profileData.data?.user || profileData.data;
        setUser(userData);
        
        // Update localStorage with fresh data
        localStorage.setItem("userProfile", JSON.stringify(userData));

        // Note: userSemesters and semester are now managed by SemesterContext
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast.error(t('dashboard:error_loading_dashboard'));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Fetch semester-specific stats when semester changes
  useEffect(() => {
    const fetchSemesterData = async () => {
      if (!semester) return;

      try {
        // Fetch stats and leaderboard in parallel for faster loading
        const [statsData, leaderboardData] = await Promise.all([
          dashboardService.getUserStats(semester),
          dashboardService.getLeaderboardRank(semester)
        ]);

        const { rank } = leaderboardData;

        // Transform module progress data from backend
        if (statsData.data.moduleProgress && statsData.data.moduleProgress.length > 0) {
          const progressByModule = statsData.data.moduleProgress.slice(0, 6).map(mp => ({
            name: mp.moduleName.substring(0, 12),
            completed: mp.correctAnswers || 0,
            pending: (mp.questionsAttempted || 0) - (mp.correctAnswers || 0)
          }));
          setModuleProgress(progressByModule);
        } else {
          // Fallback to empty progress if no stats yet
          setModuleProgress([]);
        }

        // Transform weekly activity for study time chart
        if (statsData.data.weeklyActivity && statsData.data.weeklyActivity.length > 0) {
          const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
          const last7Days = statsData.data.weeklyActivity.slice(-7);
          const studyTimeData = last7Days.map(activity => {
            const date = new Date(activity.date);
            return {
              day: days[date.getDay()],
              hours: Math.round((activity.timeSpent || 0) / 60 * 10) / 10
            };
          });
          setWeeklyActivity(studyTimeData);
        } else {
          setWeeklyActivity([
            { day: 'Lun', hours: 0 },
            { day: 'Mar', hours: 0 },
            { day: 'Mer', hours: 0 },
            { day: 'Jeu', hours: 0 },
            { day: 'Ven', hours: 0 },
            { day: 'Sam', hours: 0 },
            { day: 'Dim', hours: 0 }
          ]);
        }

        // Calculate performance trend (last 6 months)
        if (statsData.data.weeklyActivity && statsData.data.weeklyActivity.length > 0) {
          const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
          const monthlyData = {};

          statsData.data.weeklyActivity.forEach(activity => {
            const date = new Date(activity.date);
            const monthKey = `${months[date.getMonth()]}`;

            if (!monthlyData[monthKey]) {
              monthlyData[monthKey] = { total: 0, correct: 0 };
            }

            monthlyData[monthKey].total += activity.questionsAttempted || 0;
            monthlyData[monthKey].correct += activity.correctAnswers || 0;
          });

          const trendData = Object.keys(monthlyData).slice(-6).map(month => ({
            month,
            score: monthlyData[month].total > 0
              ? Math.round((monthlyData[month].correct / monthlyData[month].total) * 100)
              : 0
          }));
          setPerformanceTrend(trendData.length > 0 ? trendData : [
            { month: 'Jan', score: 0 },
            { month: 'Fév', score: 0 },
            { month: 'Mar', score: 0 },
            { month: 'Avr', score: 0 },
            { month: 'Mai', score: 0 },
            { month: 'Juin', score: 0 }
          ]);
        } else {
          setPerformanceTrend([
            { month: 'Jan', score: 0 },
            { month: 'Fév', score: 0 },
            { month: 'Mar', score: 0 },
            { month: 'Avr', score: 0 },
            { month: 'Mai', score: 0 },
            { month: 'Juin', score: 0 }
          ]);
        }

        // Calculate completion rate from stats
        const totalQuestions = statsData.data.stats?.totalQuestionsAttempted || 0;
        const correctAnswers = statsData.data.stats?.totalCorrectAnswers || 0;
        const incorrectAnswers = statsData.data.stats?.totalIncorrectAnswers || 0;

        if (totalQuestions > 0) {
          setCompletionData([
            { name: 'Correct', value: correctAnswers, fill: '#4ade80' },
            { name: 'Incorrect', value: incorrectAnswers, fill: '#f87171' }
          ]);
        } else {
          setCompletionData([
            { name: 'Aucune donnée', value: 1, fill: '#94a3b8' }
          ]);
        }

        setStats({
          examsCompleted: statsData.data.stats?.examsCompleted || 0,
          averageScore: statsData.data.stats?.averageScore || 0,
          studyHours: statsData.data.stats?.studyHours || 0,
          rank: rank || 0,
        });
      } catch (error) {
        console.error("Error fetching semester data:", error);
      }
    };

    fetchSemesterData();
  }, [semester]);

  // Filter courses based on selected semester and user's subscription
  useEffect(() => {
    if (coursesData && semester && userSemesters.length > 0) {
      // Only show modules for the selected semester if user is subscribed to it
      const filtered = coursesData.filter(course =>
        course.semester === semester && userSemesters.includes(course.semester)
      );
      setFilteredCourses(filtered);
    } else if (coursesData && userSemesters.length === 0) {
      // No subscription - show empty
      setFilteredCourses([]);
    } else {
      setFilteredCourses([]);
    }
  }, [coursesData, semester, userSemesters]);

  const handleCourseClick = (courseId) => {
    // Navigate directly to the module without showing intermediate popup
    navigate(`/dashboard/subjects/${courseId}`);
  };

  const handleStartModule = () => {
    if (selectedModule) {
      setShowModuleDialog(false);
      navigate(`/dashboard/subjects/${selectedModule._id}`);
    }
  };

  const handleDownloadPDF = async () => {
    if (!selectedModule) return;

    try {
      // Create a PDF-like document with module information
      const pdfContent = `
MODULE: ${selectedModule.name}
SEMESTER: ${selectedModule.semester}
PROGRESS: ${selectedModule.progress || 0}%
TOTAL QUESTIONS: ${selectedModule.totalQuestions || 0}

${selectedModule.infoText ? `DESCRIPTION:\n${selectedModule.infoText}` : ''}

${selectedModule.helpContent ? `HELP CONTENT:\n${selectedModule.helpContent}` : ''}

EXAMS:
${selectedModule.exams?.map((exam, i) => `${i + 1}. ${exam.name || exam.year || 'Exam'}`).join('\n') || 'No exams available'}
      `.trim();

      // Create a blob and download
      const blob = new Blob([pdfContent], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedModule.name.replace(/\s+/g, '_')}_module.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success('Module téléchargé avec succès');
    } catch (error) {
      console.error('Error downloading module:', error);
      toast.error('Erreur lors du téléchargement');
    }
  };

  const handleViewText = () => {
    if (!selectedModule) return;

    // Create a formatted text view
    const textContent = `
📚 ${selectedModule.name}
${'='.repeat(50)}

📅 Semestre: ${selectedModule.semester}
📊 Progression: ${selectedModule.progress || 0}%
❓ Questions totales: ${selectedModule.totalQuestions || 0}

${selectedModule.infoText ? `\n📝 Description:\n${selectedModule.infoText}\n` : ''}

${selectedModule.helpContent ? `\n💡 Aide:\n${selectedModule.helpContent}\n` : ''}

${selectedModule.exams?.length ? `\n📋 Examens disponibles:\n${selectedModule.exams.map((exam, i) => `  ${i + 1}. ${exam.name || exam.year || 'Exam'}`).join('\n')}` : ''}
    `.trim();

    // Copy to clipboard and show notification
    navigator.clipboard.writeText(textContent).then(() => {
      toast.success('Contenu copié dans le presse-papiers');
    }).catch(() => {
      // Fallback: show in alert
      alert(textContent);
      toast.info('Contenu affiché');
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 p-4 md:p-6">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-blue-100/30 rounded-full opacity-20 blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-purple-100/20 rounded-full opacity-15 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-teal-100/15 rounded-full opacity-10 blur-2xl animate-pulse" style={{ animationDelay: '0.5s' }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 shadow-2xl">
            {/* Animated Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.4)_0%,transparent_50%)]" />
              <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.3)_0%,transparent_50%)]" />
            </div>

            <CardContent className="relative z-10 p-3 xs:p-4 sm:p-6 lg:p-8">
              <div className="flex flex-col lg:grid lg:grid-cols-[1fr_auto] gap-4 sm:gap-6">
                {/* Welcome Section */}
                <div className="space-y-3 sm:space-y-4">
                  {/* Header */}
                  <div className="flex items-start gap-2 sm:gap-3">
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                      className="p-2 sm:p-2.5 bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg flex-shrink-0"
                    >
                      <Sparkles className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-yellow-300" />
                    </motion.div>
                    <div className="min-w-0 flex-1">
                      <h1 className="text-base xs:text-lg sm:text-xl lg:text-2xl font-bold text-white leading-tight">
                        Bienvenue, {user?.name || user?.fullName || 'Étudiant'} !
                      </h1>
                      <p className="text-blue-100 text-xs xs:text-sm mt-1">
                        Prêt à exceller dans vos études ?
                      </p>
                    </div>
                  </div>

                  {/* Quick Stats Row */}
                  <div className="grid grid-cols-3 gap-2 sm:gap-3">
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-2 sm:p-3 border border-white/20">
                      <div className="flex flex-col xs:flex-row xs:items-center gap-1 xs:gap-2 mb-1">
                        <Award className="h-3 w-3 xs:h-4 xs:w-4 text-yellow-300" />
                        <span className="text-[10px] xs:text-xs text-blue-100">Examens</span>
                      </div>
                      <p className="text-lg xs:text-xl sm:text-2xl font-bold text-white">{stats.examsCompleted}</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-2 sm:p-3 border border-white/20">
                      <div className="flex flex-col xs:flex-row xs:items-center gap-1 xs:gap-2 mb-1">
                        <TrendingUp className="h-3 w-3 xs:h-4 xs:w-4 text-green-300" />
                        <span className="text-[10px] xs:text-xs text-blue-100">Score</span>
                      </div>
                      <p className="text-lg xs:text-xl sm:text-2xl font-bold text-white">{Math.round(stats.averageScore)}%</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-2 sm:p-3 border border-white/20">
                      <div className="flex flex-col xs:flex-row xs:items-center gap-1 xs:gap-2 mb-1">
                        <Clock className="h-3 w-3 xs:h-4 xs:w-4 text-blue-300" />
                        <span className="text-[10px] xs:text-xs text-blue-100">Heures</span>
                      </div>
                      <p className="text-lg xs:text-xl sm:text-2xl font-bold text-white">{Math.round(stats.studyHours)}h</p>
                    </div>
                  </div>

                  {/* Support Link */}
                  <div className="flex flex-wrap items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                    <p className="text-blue-100">Besoin d'aide ?</p>
                    <Button
                      variant="link"
                      className="p-0 h-auto text-white font-semibold hover:text-yellow-300 underline underline-offset-4 text-xs sm:text-sm"
                      onClick={() => navigate('/dashboard/support')}
                    >
                      Contactez-nous
                    </Button>
                  </div>
                </div>

                {/* Right Column - Plan & Semesters */}
                <div className="flex flex-col gap-3 sm:gap-4 w-full lg:min-w-[320px] xl:min-w-[340px]">
                  {/* Subscription Card */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="relative overflow-hidden bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-xl cursor-pointer group"
                    onClick={() => navigate('/dashboard/subscription')}
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-white/10 rounded-full -mr-12 sm:-mr-16 -mt-12 sm:-mt-16" />
                    <div className="relative flex items-center justify-between gap-3">
                      <div className="text-white min-w-0 flex-1">
                        <p className="text-xs sm:text-sm font-medium opacity-90">Mon Abonnement</p>
                        <p className="text-xl sm:text-2xl font-bold mt-0.5 truncate">{user?.plan || 'Gratuit'}</p>
                        <p className="text-[10px] xs:text-xs opacity-80 mt-1 group-hover:underline">Voir les détails →</p>
                      </div>
                      <div className="bg-white/20 p-2 sm:p-3 rounded-lg sm:rounded-xl backdrop-blur-sm flex-shrink-0">
                        <Award className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                      </div>
                    </div>
                  </motion.div>

                  {/* Semester Selector Card */}
                  <div className="bg-white/95 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-lg border border-white/50">
                    <div className="flex items-center justify-between mb-2 sm:mb-3">
                      <p className="text-xs sm:text-sm font-bold text-slate-800">Mes Semestres</p>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-[10px] xs:text-xs">
                        {userSemesters.length} actif{userSemesters.length > 1 ? 's' : ''}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-1 sm:gap-2 mb-2 sm:mb-3">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0 hover:bg-slate-100"
                        onClick={() => setSemesterPage(p => Math.max(0, p - 1))}
                        disabled={semesterPage === 0}
                      >
                        <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4 text-slate-600" />
                      </Button>
                      
                      <div className="flex gap-1 sm:gap-2 flex-1 justify-center">
                        {visibleSemesters.length > 0 ? visibleSemesters.map((sem) => {
                          const isSelected = semester === sem;
                          return (
                            <Button
                              key={sem}
                              variant={isSelected ? "default" : "outline"}
                              size="sm"
                              onClick={() => setSemester(sem)}
                              className={`min-w-[50px] xs:min-w-[58px] sm:min-w-[65px] text-xs sm:text-sm font-semibold transition-all ${
                                isSelected
                                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md scale-105'
                                  : 'hover:bg-blue-50 hover:border-blue-300 text-slate-700'
                              }`}
                            >
                              {sem}
                            </Button>
                          );
                        }) : (
                          <p className="text-xs text-slate-500 py-2">Aucun semestre souscrit</p>
                        )}
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0 hover:bg-slate-100"
                        onClick={() => setSemesterPage(p => Math.min(totalSemesterPages - 1, p + 1))}
                        disabled={semesterPage >= totalSemesterPages - 1}
                      >
                        <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 text-slate-600" />
                      </Button>
                    </div>
                    
                    <p className="text-[10px] xs:text-xs text-center text-slate-500">
                      Page {semesterPage + 1} sur {totalSemesterPages}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Modules Section - Moved above Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <GraduationCap className="h-6 w-6 text-teal-600" />
                {t('dashboard:modules')}
                <Badge variant="outline" className="ml-2 bg-teal-50 text-teal-700 border-teal-200">
                  {semester || "Sélectionner"}
                </Badge>
              </h2>
              <div className="h-1 w-16 bg-gradient-to-r from-teal-600 to-emerald-500 mt-2 rounded-full" />
            </div>
            {!loading && filteredCourses.length > 0 && (
              <Badge variant="secondary" className="text-sm">
                {filteredCourses.length} module{filteredCourses.length > 1 ? 's' : ''}
              </Badge>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
              {[...Array(8)].map((_, i) => (
                <Card key={i} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4 sm:p-6">
                    <Skeleton className="h-28 xs:h-32 sm:h-36 md:h-40 w-full mb-4 rounded-lg" />
                    <Skeleton className="h-5 sm:h-6 w-3/4 mb-2" />
                    <Skeleton className="h-3 sm:h-4 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <motion.div
              className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 md:gap-5 lg:gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {filteredCourses.length > 0 ? (
                filteredCourses.map((course, index) => (
                  <ModuleCard
                    key={course._id || course.id || index}
                    course={course}
                    handleCourseClick={handleCourseClick}
                    index={index}
                  />
                ))
              ) : (
                <div className="col-span-full">
                  <Card className="border-2 border-dashed border-slate-200 bg-slate-50/50">
                    <CardContent className="text-center py-16">
                      <div className="max-w-md mx-auto space-y-4">
                        <div className="w-16 h-16 mx-auto bg-slate-100 rounded-full flex items-center justify-center">
                          {userSemesters.length === 0 ? (
                            <Lock className="h-8 w-8 text-slate-400" />
                          ) : (
                            <Book className="h-8 w-8 text-blue-400" />
                          )}
                        </div>
                        <h3 className="text-xl font-semibold text-slate-700">
                          {userSemesters.length === 0
                            ? "Aucun semestre souscrit"
                            : `Aucun module pour ${semester}`
                          }
                        </h3>
                        <p className="text-slate-500">
                          {userSemesters.length === 0
                            ? "Abonnez-vous pour accéder aux modules et commencer votre apprentissage"
                            : userSemesters.length > 1 
                              ? "Aucun module n'est encore disponible pour ce semestre. Essayez un autre semestre."
                              : "Aucun module n'est encore disponible pour ce semestre. Les modules seront ajoutés prochainement."
                          }
                        </p>
                        {userSemesters.length === 0 ? (
                          <Button
                            onClick={() => navigate('/dashboard/subscription')}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            Voir les abonnements
                          </Button>
                        ) : userSemesters.length > 1 && (
                          <p className="text-sm text-blue-600 font-medium">
                            Vos semestres: {userSemesters.join(', ')}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </motion.div>
          )}
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="mb-4">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              Mes Statistiques
            </h2>
            <div className="h-1 w-16 bg-gradient-to-r from-blue-600 to-teal-500 mt-2 rounded-full" />
          </div>

          {loading ? (
            <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <Card key={i}>
                  <CardHeader className="pb-2">
                    <Skeleton className="h-4 w-24" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-20 mb-2" />
                    <Skeleton className="h-3 w-32" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
              <StatCard
                title={t('dashboard:exams_completed')}
                value={stats.examsCompleted}
                icon={<Award className="h-4 w-4" />}
                description={t('dashboard:in_total')}
              />
              <StatCard
                title={t('dashboard:average_score')}
                value={`${Math.round(stats.averageScore)}%`}
                icon={<TrendingUp className="h-4 w-4" />}
                description={t('dashboard:last_exam')}
              />
              <StatCard
                title={t('dashboard:study_hours')}
                value={Math.round(stats.studyHours)}
                icon={<Clock className="h-4 w-4" />}
                description={t('dashboard:total_time')}
              />
              <StatCard
                title={t('dashboard:ranking')}
                value={`#${stats.rank}`}
                icon={<Award className="h-4 w-4" />}
                description={t('dashboard:global_rank')}
              />
            </div>
          )}
        </motion.div>

        {/* Statistics Charts Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="mb-4">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Activity className="h-5 w-5 text-purple-600" />
              Analyse de Performance
            </h2>
            <div className="h-1 w-16 bg-gradient-to-r from-purple-600 to-pink-500 mt-2 rounded-full" />
          </div>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
              <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
              <TabsTrigger value="detailed">Détails</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4 sm:space-y-6">
              <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
                {/* Module Progress Chart */}
                <Card className="border-blue-100 bg-white shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <BarChart3 className="h-5 w-5 text-blue-600" />
                      Progrès par Module
                    </CardTitle>
                    <CardDescription>Top 6 modules actifs</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4">
                    {moduleProgress.length > 0 ? (
                      <div className="w-full h-[280px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={moduleProgress} margin={{ top: 10, right: 20, left: 0, bottom: 50 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="name" fontSize={11} angle={-45} textAnchor="end" height={70} />
                            <YAxis fontSize={11} />
                            <Tooltip
                              contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                              cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                            />
                            <Legend wrapperStyle={{ paddingTop: '10px' }} />
                            <Bar dataKey="completed" fill="#3b82f6" name="Complétées" radius={[6, 6, 0, 0]} />
                            <Bar dataKey="pending" fill="#fbbf24" name="En attente" radius={[6, 6, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-64 text-slate-400">
                        <p>Aucune donnée disponible</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Performance Trend Chart */}
                <Card className="border-green-100 bg-white shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <LineChartIcon className="h-5 w-5 text-green-600" />
                      Évolution du Score
                    </CardTitle>
                    <CardDescription>Progression sur 6 mois</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4">
                    {performanceTrend.length > 0 ? (
                      <div className="w-full h-[280px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={performanceTrend}
                            margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="month" fontSize={11} />
                            <YAxis fontSize={11} domain={[0, 100]} />
                            <Tooltip
                              contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                              cursor={{ stroke: '#10b981', strokeWidth: 2 }}
                            />
                            <Legend wrapperStyle={{ paddingTop: '10px' }} />
                            <Line
                              type="monotone"
                              dataKey="score"
                              stroke="#10b981"
                              strokeWidth={3}
                              dot={{ fill: '#10b981', r: 4 }}
                              activeDot={{ r: 6 }}
                              name="Score (%)"
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-64 text-slate-400">
                        <p>Aucune donnée historique</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="detailed" className="space-y-4 sm:space-y-6">
              <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
                {/* Completion Rate Pie Chart */}
                <Card className="border-purple-100 bg-white shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Activity className="h-5 w-5 text-purple-600" />
                      Taux de Complétion
                    </CardTitle>
                    <CardDescription>Répartition QCM</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 flex items-center justify-center">
                    {completionData.length > 0 ? (
                      <div className="w-full h-[280px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={completionData}
                              cx="50%"
                              cy="50%"
                              innerRadius={40}
                              outerRadius={80}
                              paddingAngle={3}
                              dataKey="value"
                              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                              {completionData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                              ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-64 text-slate-400">
                        <p>Aucune donnée disponible</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Study Time Distribution */}
                <Card className="border-amber-100 bg-white shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Clock className="h-5 w-5 text-amber-600" />
                      Temps d'Étude
                    </CardTitle>
                    <CardDescription>Heures par jour (7 jours)</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4">
                    {weeklyActivity.length > 0 ? (
                      <div className="w-full h-[280px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={weeklyActivity}
                            margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="day" fontSize={11} />
                            <YAxis fontSize={11} />
                            <Tooltip
                              contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                              formatter={(value) => `${value}h`}
                              cursor={{ fill: 'rgba(245, 158, 11, 0.1)' }}
                            />
                            <Bar dataKey="hours" fill="#f59e0b" name="Heures" radius={[6, 6, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-64 text-slate-400">
                        <p>Aucune donnée d'étude</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Help Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          {/* Help Center Section */}
          <Card className="border-purple-100 bg-gradient-to-br from-white to-purple-50/30 shadow-lg max-w-md" ref={contactRef}>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-md">
                  <HelpCircle className="h-5 w-5 text-white" />
                </div>
                <span className="text-lg">Besoin d'aide ?</span>
              </CardTitle>
              <CardDescription>Contactez notre équipe</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-medium text-slate-600">Filtrer:</span>
                <Select value={contactFilter} onValueChange={setContactFilter}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous</SelectItem>
                    <SelectItem value="social">Réseaux</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                {(contactFilter === "all" || contactFilter === "social") && (
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="p-4 rounded-lg border-2 border-blue-100 bg-white hover:shadow-md transition-all cursor-pointer"
                    onClick={() => window.open('https://facebook.com/wafa_app', '_blank')}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-slate-900">Facebook</h3>
                        <p className="text-xs text-slate-500">Actualités</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {(contactFilter === "all" || contactFilter === "email") && (
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="p-4 rounded-lg border-2 border-blue-100 bg-white hover:shadow-md transition-all cursor-pointer"
                    onClick={() => window.location.href = 'mailto:contact@wafa.com'}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-slate-900">Email</h3>
                        <p className="text-xs text-slate-500">contact@wafa.com</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {(contactFilter === "all" || contactFilter === "social") && (
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="p-4 rounded-lg border-2 border-pink-100 bg-white hover:shadow-md transition-all cursor-pointer"
                    onClick={() => window.open('https://instagram.com/wafa_app', '_blank')}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-slate-900">Instagram</h3>
                        <p className="text-xs text-slate-500">@wafa_app</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Module Preview Modal */}
        <ModulePreviewModal
          isOpen={showModuleDialog}
          onClose={() => setShowModuleDialog(false)}
          module={selectedModule}
        />
      </div>
    </div>
  );
};

export default Dashboard;