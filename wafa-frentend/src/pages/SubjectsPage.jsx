import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Play, BookOpen, GraduationCap, Lock, FileQuestion, Calendar, Library, Shuffle, HelpCircle } from "lucide-react";
import { moduleService } from "@/services/moduleService";
import { userService } from "@/services/userService";
import { api } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PageHeader } from "@/components/shared";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

// Progress Circle Component
const ProgressCircle = ({ progress, size = 48, color }) => {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  
  // Adjust text size based on circle size
  const fontSize = size > 60 ? 'text-xl' : size > 40 ? 'text-sm' : 'text-xs';

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          className="text-gray-200"
          strokeWidth="6"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className={!color ? "text-blue-600 transition-all duration-500" : "transition-all duration-500"}
          strokeWidth="6"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          stroke={color || "currentColor"}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`${fontSize} font-bold`} style={{ color: color || '#374151' }}>{progress}%</span>
      </div>
    </div>
  );
};

// Exam Card Component
const ExamCard = ({ exam, onStart, onShowHelp, index, moduleColor, examType }) => {
  const API_URL = import.meta.env.VITE_API_URL;
  
  // Helper function to adjust color
  const adjustColorLocal = (color, amount) => {
    if (!color) return null;
    const hex = color.replace('#', '');
    const num = parseInt(hex, 16);
    const r = Math.max(0, Math.min(255, (num >> 16) + amount));
    const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amount));
    const b = Math.max(0, Math.min(255, (num & 0x0000FF) + amount));
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
  };

  // Get the proper image URL
  const getImageUrl = () => {
    if (!exam.imageUrl) return null;
    if (exam.imageUrl.startsWith("http")) return exam.imageUrl;
    return `${API_URL?.replace('/api/v1', '')}${exam.imageUrl}`;
  };

  const imageUrl = getImageUrl();
  
  // Calculate answered questions (progress * total / 100)
  const answeredQuestions = exam.answeredQuestions || Math.round((exam.progress || 0) * exam.questions / 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card
        className="hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer group active:scale-[0.98] overflow-hidden border-0 shadow-md"
        onClick={() => onStart(exam.id, examType)}
      >
        <CardContent className="p-0 h-full relative">
          {/* Help button - top right corner */}
          {exam.helpText && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2 h-8 w-8 p-0 z-10 hover:bg-blue-50 rounded-full"
              onClick={(e) => {
                e.stopPropagation();
                onShowHelp(exam);
              }}
            >
              <HelpCircle className="h-4 w-4 text-blue-600" />
            </Button>
          )}
          
          <div className="flex items-center gap-4 p-4 sm:p-6">
            {/* Left side - Icon/Image with rounded corners */}
            <div className="flex-shrink-0">
              {imageUrl ? (
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden shadow-md group-hover:shadow-lg transition-all">
                  <img 
                    src={imageUrl} 
                    alt={exam.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.style.display = 'none';
                      const svgIcon = '<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14,2 14,8 20,8"/></svg>';
                      const bgColor = moduleColor || '#3b82f6';
                      const darkColor = adjustColorLocal(moduleColor, -30) || '#4f46e5';
                      e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center rounded-2xl" style="background: linear-gradient(to bottom right, ' + bgColor + ', ' + darkColor + ')">' + svgIcon + '</div>';
                    }}
                  />
                </div>
              ) : (
                <div
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all group-hover:scale-105"
                  style={{
                    background: `linear-gradient(to bottom right, ${moduleColor || '#3b82f6'}, ${adjustColorLocal(moduleColor, -30) || '#4f46e5'})`
                  }}
                >
                  <FileQuestion className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                </div>
              )}
            </div>

            {/* Right side - Info */}
            <div className="flex-1 min-w-0 flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0 pr-6">
                <h3 className="font-semibold text-gray-900 text-sm mb-1.5 leading-snug line-clamp-2">
                  {exam.name}
                </h3>
                <div className="flex items-center gap-1.5 text-xs text-gray-600">
                  <FileQuestion className="h-3.5 w-3.5" />
                  <span className="font-semibold">{answeredQuestions}</span>
                  <span className="text-gray-400">/</span>
                  <span>{exam.questions}</span>
                </div>
              </div>
              
              {/* Circular Progress */}
              <div className="flex-shrink-0">
                <ProgressCircle 
                  progress={exam.progress || 0} 
                  size={52} 
                  color={moduleColor || '#f59e0b'} 
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const SubjectsPage = () => {
  const { t } = useTranslation(['dashboard', 'common']);
  const [selectedExamType, setSelectedExamType] = useState("year");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [module, setModule] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(true);
  const [userSemesters, setUserSemesters] = useState([]);
  const [userPlan, setUserPlan] = useState("Free");
  const [userFreeModules, setUserFreeModules] = useState([]);
  const [moduleStats, setModuleStats] = useState(null);
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  const [selectedHelpExam, setSelectedHelpExam] = useState(null);

  // Helper function to darken/lighten color (same as ModuleCard)
  function adjustColor(color, amount) {
    if (!color) return null;
    const hex = color.replace('#', '');
    const num = parseInt(hex, 16);
    const r = Math.max(0, Math.min(255, (num >> 16) + amount));
    const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amount));
    const b = Math.max(0, Math.min(255, (num & 0x0000FF) + amount));
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
  }

  // Exam data by type
  const [examsParYear, setExamsParYear] = useState([]);
  const [examsParCours, setExamsParCours] = useState([]);
  const [qcmBanque, setQcmBanque] = useState([]);
  const [categories, setCategories] = useState([]);

  const { courseId } = useParams();
  const navigate = useNavigate();

  // Check user access based on subscription
  useEffect(() => {
    const checkAccess = async () => {
      try {
        const userProfile = await userService.getUserProfile();
        const semesters = userProfile.semesters || [];
        const plan = userProfile.plan || "Free";
        const freeModules = userProfile.freeModules || [];
        setUserSemesters(semesters);
        setUserPlan(plan);
        setUserFreeModules(freeModules);
        localStorage.setItem("user", JSON.stringify(userProfile));
      } catch (error) {
        console.error("Error fetching user profile:", error);
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const user = JSON.parse(storedUser);
          setUserSemesters(user.semesters || []);
          setUserPlan(user.plan || "Free");
          setUserFreeModules(user.freeModules || []);
        }
      }
    };
    checkAccess();
  }, []);

  // Helper function to check if user has access to a semester and module
  const hasAccessToSemester = (semester, moduleName = null) => {
    // Premium users have access to all semesters
    if (userPlan && userPlan !== "Free") {
      return true;
    }
    
    // Free users: check semester and module
    if (userSemesters && userSemesters.length > 0) {
      const hasSemester = userSemesters.includes(semester);
      
      // If no module name provided, just check semester
      if (!moduleName) return hasSemester;
      
      // Check if module is in allowed free modules
      if (userFreeModules && userFreeModules.length > 0) {
        // Check if module name matches or contains any of the free modules
        return hasSemester && userFreeModules.some(freeModule => 
          moduleName.toLowerCase().includes(freeModule.toLowerCase()) ||
          freeModule.toLowerCase().includes(moduleName.toLowerCase())
        );
      }
      
      return hasSemester;
    }
    
    return false;
  };

  // Fetch module data and exams
  useEffect(() => {
    const fetchData = async (id) => {
      setIsLoading(true);
      try {
        const { data } = await moduleService.getModuleById(id);
        const moduleData = data?.data;

        if (!moduleData) return;

        // Check access with module name
        if (!hasAccessToSemester(moduleData.semester, moduleData.name)) {
          setHasAccess(false);
          setModule({ name: moduleData.name, semester: moduleData.semester });
          setIsLoading(false);
          return;
        }
        setHasAccess(true);

        setModule({
          id: moduleData._id,
          name: moduleData.name,
          semester: moduleData.semester,
          color: moduleData.color,
        });

        // Fetch exam-courses for this module from API
        try {
          // Fetch from all 3 sources: exam-courses, exams (par années), and qcm-banque
          const [examCoursesResponse, examsResponse, qcmResponse] = await Promise.all([
            api.get(`/exam-courses?moduleId=${id}`),
            api.get(`/exams/all`).catch(() => ({ data: { data: [] } })),
            api.get(`/qcm-banque/all`).catch(() => ({ data: { data: [] } }))
          ]);

          const examCourses = examCoursesResponse.data?.data || [];
          const allExams = examsResponse.data?.data || [];
          const allQcmBanque = qcmResponse.data?.data || [];

          // Filter exams by module
          const moduleExams = allExams.filter(e => 
            (e.moduleId?._id || e.moduleId) === id || 
            e.moduleName === moduleData.name
          );

          // Filter QCM Banque by module
          const moduleQcm = allQcmBanque.filter(q => 
            (q.moduleId?._id || q.moduleId) === id ||
            q.moduleName === moduleData.name
          );

          // Map exam par années from /exams endpoint
          const yearExamsFromApi = moduleExams.map(e => ({
            id: e._id,
            name: e.name,
            questions: Array.isArray(e.questions) ? e.questions.length : (e.totalQuestions || 0),
            progress: 0,
            category: "Exam par years",
            imageUrl: e.imageUrl,
            year: e.year,
            helpText: e.infoText || e.helpText || e.description || ""
          }));

          // Map QCM banque from /qcm-banque endpoint
          const qcmFromApi = moduleQcm.map(q => ({
            id: q._id,
            name: q.name,
            questions: q.totalQuestions || 0,
            progress: 0,
            category: "QCM banque",
            imageUrl: q.imageUrl,
            helpText: q.infoText || q.helpText || q.description || ""
          }));

          // Also get exam-courses with category "Exam par years" as fallback
          const yearExamsFromCourses = examCourses
            .filter(c => c.category === "Exam par years")
            .map(c => ({
              id: c._id,
              name: c.name,
              questions: c.totalQuestions || 0,
              progress: 0,
              category: c.category,
              imageUrl: c.imageUrl,
              helpText: c.infoText || c.helpText || c.description || ""
            }));

          // Get all exam courses that are NOT "Exam par years" and NOT "QCM banque"
          // This includes "Exam par courses" and any custom categories
          const courseExams = examCourses
            .filter(c => c.category !== "Exam par years" && c.category !== "QCM banque")
            .map(c => ({
              id: c._id,
              name: c.name,
              questions: c.totalQuestions || 0,
              progress: 0,
              category: c.category, // Use the actual category for filtering
              imageUrl: c.imageUrl,
              helpText: c.infoText || c.helpText || c.description || ""
            }));

          // QCM from exam-courses as fallback
          const qcmFromCourses = examCourses
            .filter(c => c.category === "QCM banque")
            .map(c => ({
              id: c._id,
              name: c.name,
              questions: c.totalQuestions || 0,
              progress: 0,
              category: c.category,
              imageUrl: c.imageUrl,
              helpText: c.infoText || c.helpText || c.description || ""
            }));

          // Combine sources - prioritize direct API sources
          const yearExams = yearExamsFromApi.length > 0 ? yearExamsFromApi : yearExamsFromCourses;
          const qcmExams = qcmFromApi.length > 0 ? qcmFromApi : qcmFromCourses;

          // Fetch user statistics for each exam to get progress
          try {
            const userStatsResponse = await api.get('/users/my-stats');
            const userStats = userStatsResponse.data?.data;
            
            if (userStats && userStats.answeredQuestions) {
              const answeredQuestionsMap = userStats.answeredQuestions;
              
              // Helper function to calculate progress for an exam
              const calculateExamProgress = async (exam, examTypeKey) => {
                try {
                  const questionsResponse = await api.get(`/questions/exam/${exam.id}`);
                  const examQuestions = questionsResponse.data?.data || [];
                  const totalQuestions = examQuestions.length;
                  
                  if (totalQuestions === 0) return { ...exam, progress: 0, answeredQuestions: 0 };
                  
                  // Count VERIFIED questions from server
                  // Use toString() to ensure ID comparison works
                  let answeredCount = examQuestions.filter(q => {
                    const questionId = q._id?.toString() || q._id;
                    const answer = answeredQuestionsMap[questionId];
                    return answer && answer.isVerified === true;
                  }).length;
                  
                  // Also check localStorage for additional progress (in case server sync failed)
                  try {
                    const localProgress = localStorage.getItem(`exam_progress_${examTypeKey}_${exam.id}`);
                    if (localProgress) {
                      const { verified } = JSON.parse(localProgress);
                      if (verified && Object.keys(verified).length > answeredCount) {
                        answeredCount = Object.keys(verified).length;
                      }
                    }
                  } catch (localErr) {
                    // Ignore localStorage errors
                  }
                  
                  const progress = Math.round((answeredCount / totalQuestions) * 100);
                  
                  return { ...exam, progress, answeredQuestions: answeredCount, questions: totalQuestions };
                } catch (err) {
                  console.error('Error calculating progress for exam:', exam.id, err);
                  return exam;
                }
              };
              
              // Calculate progress for all exams in parallel
              const [updatedYearExams, updatedCourseExams, updatedQcmExams] = await Promise.all([
                Promise.all(yearExams.map(e => calculateExamProgress(e, 'exam'))),
                Promise.all(courseExams.map(e => calculateExamProgress(e, 'course'))),
                Promise.all(qcmExams.map(e => calculateExamProgress(e, 'qcm')))
              ]);
              
              setExamsParYear(updatedYearExams);
              setExamsParCours(updatedCourseExams);
              setQcmBanque(updatedQcmExams);
            } else {
              setExamsParYear(yearExams);
              setExamsParCours(courseExams);
              setQcmBanque(qcmExams);
            }
          } catch (statsError) {
            console.error('Error fetching user stats:', statsError);
            setExamsParYear(yearExams);
            setExamsParCours(courseExams);
            setQcmBanque(qcmExams);
          }

          // Extract unique categories from course exams
          const uniqueCategories = [...new Set(courseExams.map(e => e.category))];
          setCategories([
            { id: "all", name: t('common:all', 'Tous') },
            ...uniqueCategories.map(cat => ({ id: cat, name: cat }))
          ]);
        } catch (examError) {
          console.error("Error fetching exam-courses:", examError);
          // Fallback to module.exams if exam-courses API fails
          const allExams = (moduleData.exams || []).map((e) => ({
            id: e._id,
            name: e.name,
            questions: 0,
            progress: 0,
            category: e.category || "Général",
          }));
          setExamsParYear(allExams);
          setExamsParCours([]);
          setQcmBanque([]);
        }

        // Fetch module stats for the current user
        try {
          const statsResponse = await api.get(`/modules/${id}/stats`);
          if (statsResponse.data?.success) {
            setModuleStats(statsResponse.data.data);
          }
        } catch (statsError) {
          console.error("Error fetching module stats:", statsError);
          // Continue without stats - not critical
        }

      } catch (error) {
        console.error(error);
        toast.error(t('dashboard:error_loading_module'));
      } finally {
        setIsLoading(false);
      }
    };

    if (courseId) {
      fetchData(courseId);
    }
  }, [courseId, userSemesters, userPlan]);

  // Filter course exams by category
  const filteredCourseExams = examsParCours.filter(
    (exam) => selectedCategory === "all" || exam.category === selectedCategory
  );

  const handleShowHelp = (exam) => {
    setSelectedHelpExam(exam);
    setHelpModalOpen(true);
  };

  const handleStartExam = (examId, type) => {
    // Include the exam type in the URL for ExamPage to use the correct API endpoint
    const examTypeParam = type || selectedExamType;
    const queryType = examTypeParam === 'year' ? 'exam' : examTypeParam === 'course' ? 'course' : 'qcm';
    navigate(`/exam/${examId}?type=${queryType}`);
  };

  // Get current exams based on selected type
  const getCurrentExams = () => {
    switch (selectedExamType) {
      case "year":
        return examsParYear;
      case "course":
        return filteredCourseExams;
      case "qcm":
        return qcmBanque;
      default:
        return [];
    }
  };

  const currentExams = getCurrentExams();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-12 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!module) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <Card>
            <CardContent className="p-12 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="h-20 w-20 rounded-full bg-red-50 flex items-center justify-center">
                  <BookOpen className="h-10 w-10 text-red-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">{t('dashboard:module_not_found')}</h3>
                  <p className="text-muted-foreground">{t('dashboard:module_not_exist')}</p>
                </div>
                <Button onClick={() => navigate(-1)} className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  {t('common:back')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <Card>
            <CardContent className="p-12 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="h-20 w-20 rounded-full bg-amber-50 flex items-center justify-center">
                  <Lock className="h-10 w-10 text-amber-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">
                    {t('dashboard:access_restricted', 'Accès Restreint')}
                  </h3>
                  <p className="text-muted-foreground mb-2">
                    {t('dashboard:module_not_in_plan', "Ce module n'est pas inclus dans votre abonnement actuel.")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <strong>{module?.name}</strong> - {module?.semester}
                  </p>
                </div>
                <div className="flex gap-3 mt-2">
                  <Button variant="outline" onClick={() => navigate(-1)} className="gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    {t('common:back')}
                  </Button>
                  <Button onClick={() => navigate('/dashboard/subscription')} className="gap-2">
                    {t('dashboard:upgrade_plan', 'Améliorer mon abonnement')}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 flex-wrap">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800">{module.name}</h1>
            <div
              className={`h-1 w-24 mt-2 rounded-full ${!module.color ? 'bg-gradient-to-r from-blue-600 to-indigo-500' : ''}`}
              style={module.color ? {
                background: `linear-gradient(to right, ${module.color}, ${adjustColor(module.color, -30)})`
              } : undefined}
            />
          </div>
          
          {/* Module Stats Card */}
          
        </div>

        {/* Exam Type Tabs */}
        <Tabs value={selectedExamType} onValueChange={setSelectedExamType} className="w-full">
          <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
            <TabsList className="inline-flex w-auto min-w-full md:grid md:w-full md:grid-cols-3 h-auto p-1 bg-white border shadow-sm">
              <TabsTrigger
                value="year"
                className="flex items-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 px-3 sm:px-4 data-[state=active]:text-white whitespace-nowrap text-xs sm:text-sm"
                style={module.color ? {
                  '--tw-bg-opacity': '1',
                  backgroundColor: selectedExamType === 'year' ? module.color : undefined
                } : undefined}
                data-state={selectedExamType === 'year' ? 'active' : 'inactive'}
              >
                <Calendar className="h-4 w-4" />
                <span className="hidden xs:inline">Par Year</span>
                <span className="xs:hidden">Year</span>
                {examsParYear.length > 0 && (
                  <Badge variant="secondary" className="ml-1 bg-blue-100 text-blue-700 data-[state=active]:bg-blue-500 data-[state=active]:text-white text-[10px] sm:text-xs">
                    {examsParYear.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="course"
                className="flex items-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 px-3 sm:px-4 data-[state=active]:text-white whitespace-nowrap text-xs sm:text-sm"
                style={module.color ? {
                  backgroundColor: selectedExamType === 'course' ? module.color : undefined
                } : undefined}
                data-state={selectedExamType === 'course' ? 'active' : 'inactive'}
              >
                <BookOpen className="h-4 w-4" />
                <span className="hidden xs:inline">Par Cours</span>
                <span className="xs:hidden">Cours</span>
                {examsParCours.length > 0 && (
                  <Badge variant="secondary" className="ml-1 bg-orange-100 text-orange-700 data-[state=active]:bg-orange-400 data-[state=active]:text-white text-[10px] sm:text-xs">
                    {examsParCours.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="qcm"
                className="flex items-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 px-3 sm:px-4 data-[state=active]:text-white whitespace-nowrap text-xs sm:text-sm"
                style={module.color ? {
                  backgroundColor: selectedExamType === 'qcm' ? module.color : undefined
                } : undefined}
                data-state={selectedExamType === 'qcm' ? 'active' : 'inactive'}
              >
                <Library className="h-4 w-4" />
                <span className="hidden xs:inline">QCM Banque</span>
                <span className="xs:hidden">Banque</span>
                {qcmBanque.length > 0 && (
                  <Badge variant="secondary" className="ml-1 bg-purple-100 text-purple-700 data-[state=active]:bg-purple-500 data-[state=active]:text-white text-[10px] sm:text-xs">
                    {qcmBanque.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Category Filter - Only for "Par Cours" */}
          {selectedExamType === "course" && categories.length > 1 && (
            <Card className="mt-4">
              <CardContent className="p-4">
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <Button
                      key={cat.id}
                      variant={selectedCategory === cat.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(cat.id)}
                      style={module.color && selectedCategory === cat.id ? {
                        backgroundColor: module.color,
                        borderColor: module.color
                      } : undefined}
                      className={selectedCategory === cat.id && !module.color ? "bg-orange-500 hover:bg-orange-600" : ""}
                    >
                      {cat.name}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Exam Lists */}
          <div className="mt-4">
            <TabsContent value="year" className="mt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                {examsParYear.map((exam, index) => (
                  <ExamCard
                    key={exam.id}
                    exam={exam}
                    onStart={handleStartExam}
                    onShowHelp={handleShowHelp}
                    index={index}
                    moduleColor={module?.color}
                    examType="year"
                  />
                ))}
              </div>
              {examsParYear.length === 0 && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="h-16 w-16 rounded-full bg-blue-50 flex items-center justify-center">
                        <Calendar className="h-8 w-8 text-blue-400" />
                      </div>
                      <p className="text-muted-foreground">Aucun examen par année disponible</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="course" className="mt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                {filteredCourseExams.map((exam, index) => (
                  <ExamCard
                    key={exam.id}
                    exam={exam}
                    onStart={handleStartExam}
                    onShowHelp={handleShowHelp}
                    index={index}
                    moduleColor={module?.color}
                    examType="course"
                  />
                ))}
              </div>
              {filteredCourseExams.length === 0 && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="h-16 w-16 rounded-full bg-orange-50 flex items-center justify-center">
                        <BookOpen className="h-8 w-8 text-orange-400" />
                      </div>
                      <p className="text-muted-foreground">
                        {selectedCategory === "all"
                          ? "Aucun examen par cours disponible"
                          : "Aucun examen dans cette catégorie"
                        }
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="qcm" className="mt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                {qcmBanque.map((exam, index) => (
                  <ExamCard
                    key={exam.id}
                    exam={exam}
                    onStart={handleStartExam}
                    onShowHelp={handleShowHelp}
                    index={index}
                    moduleColor={module?.color}
                    examType="qcm"
                  />
                ))}
              </div>
              {qcmBanque.length === 0 && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="h-16 w-16 rounded-full bg-purple-50 flex items-center justify-center">
                        <Library className="h-8 w-8 text-purple-400" />
                      </div>
                      <p className="text-muted-foreground">Aucun QCM banque disponible</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* Help Modal */}
      <Dialog open={helpModalOpen} onOpenChange={setHelpModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-blue-600" />
              {selectedHelpExam?.name}
            </DialogTitle>
            <DialogDescription>
              Informations d'aide pour cet examen
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            {selectedHelpExam?.helpText ? (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-gray-900 whitespace-pre-wrap">{selectedHelpExam.helpText}</p>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">Aucune information d'aide disponible pour cet examen.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SubjectsPage;
