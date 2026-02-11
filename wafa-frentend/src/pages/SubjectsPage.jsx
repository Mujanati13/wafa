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

// Custom hook for responsive breakpoints
const useResponsiveSize = () => {
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);
  
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return {
    isMobile: windowWidth < 400,
    isSmall: windowWidth < 640,
    isMedium: windowWidth < 1024,
    isLarge: windowWidth >= 1024,
    windowWidth
  };
};

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
  const responsive = useResponsiveSize();
  const [isHovered, setIsHovered] = useState(false);
  
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
  
  // Responsive progress circle size
  const getProgressCircleSize = () => {
    if (responsive.isMobile) return 44;
    if (responsive.isSmall) return 48;
    return 60;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="h-full"
    >
      <Card
        className="h-full hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group active:scale-[0.98] overflow-hidden border border-gray-100 shadow-sm bg-white"
        onClick={() => onStart(exam.id, examType)}
      >
        <CardContent className="p-0 h-full relative">
          {/* Help button - top right corner */}
          {exam.helpText && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2 sm:top-3 sm:right-3 h-8 w-8 sm:h-9 sm:w-9 p-0 z-10 hover:bg-blue-50 rounded-full transition-all hover:scale-110 shadow-sm bg-white/80 backdrop-blur-sm"
              onClick={(e) => {
                e.stopPropagation();
                onShowHelp(exam);
              }}
            >
              <HelpCircle className="h-4 w-4 sm:h-4.5 sm:w-4.5 text-blue-600" />
            </Button>
          )}
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 md:gap-5 p-4 sm:p-5 md:p-6">
            {/* Left side - Icon/Image with rounded corners */}
            <div className="flex-shrink-0 w-full sm:w-auto flex justify-center sm:justify-start">
              {imageUrl ? (
                <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 rounded-2xl overflow-hidden shadow-md group-hover:shadow-xl transition-all duration-300" style={{
                  transform: isHovered ? 'scale(1.05)' : 'scale(1)'
                }}>  
                  <img 
                    src={imageUrl} 
                    alt={exam.name} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.style.display = 'none';
                      const svgIcon = '<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14,2 14,8 20,8"/></svg>';
                      const bgColor = moduleColor || '#3b82f6';
                      const darkColor = adjustColorLocal(moduleColor, -30) || '#4f46e5';
                      e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center rounded-2xl" style="background: linear-gradient(135deg, ' + bgColor + ', ' + darkColor + ')">' + svgIcon + '</div>';
                    }}
                  />
                </div>
              ) : (
                <div
                  className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 rounded-2xl flex items-center justify-center shadow-md group-hover:shadow-xl transition-all duration-300"
                  style={{
                    background: `linear-gradient(135deg, ${moduleColor || '#3b82f6'}, ${adjustColorLocal(moduleColor, -30) || '#4f46e5'})`,
                    transform: isHovered ? 'scale(1.05) rotate(3deg)' : 'scale(1)'
                  }}
                >
                  <FileQuestion className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 lg:h-14 lg:w-14 text-white drop-shadow-lg" />
                </div>
              )}
            </div>

            {/* Right side - Info */}
            <div className="flex-1 min-w-0 w-full sm:w-auto">
              <div className="flex items-start sm:items-center justify-between gap-3 sm:gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 text-sm sm:text-base md:text-lg lg:text-xl mb-2 sm:mb-2.5 leading-tight line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {exam.name}
                  </h3>
                  <div className="flex items-center gap-2 sm:gap-2.5">
                    <div className="flex items-center gap-1.5 text-xs sm:text-sm md:text-base">
                      <div className="flex-shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center" style={{
                        backgroundColor: `${moduleColor || '#3b82f6'}15`,
                      }}>
                        <FileQuestion className="h-4 w-4 sm:h-4.5 sm:w-4.5" style={{ color: moduleColor || '#3b82f6' }} />
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="font-bold text-gray-900 text-base sm:text-lg" style={{ color: moduleColor || '#3b82f6' }}>{answeredQuestions}</span>
                        <span className="text-gray-400 font-medium text-sm">/</span>
                        <span className="text-gray-600 font-semibold text-sm sm:text-base">{exam.questions}</span>
                      </div>
                    </div>
                    
                    {/* Progress Badge */}
                    <Badge 
                      variant="secondary" 
                      className="text-xs px-2 py-0.5 font-semibold"
                      style={{
                        backgroundColor: exam.progress >= 100 ? '#10b98120' : exam.progress >= 50 ? `${moduleColor || '#3b82f6'}20` : '#f59e0b20',
                        color: exam.progress >= 100 ? '#10b981' : exam.progress >= 50 ? moduleColor || '#3b82f6' : '#f59e0b'
                      }}
                    >
                      {exam.progress}%
                    </Badge>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="mt-2.5 sm:mt-3">
                    <div className="h-2 sm:h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ 
                          background: exam.progress >= 100 
                            ? 'linear-gradient(90deg, #10b981, #059669)' 
                            : `linear-gradient(90deg, ${moduleColor || '#3b82f6'}, ${adjustColorLocal(moduleColor, -20) || '#2563eb'})`,
                          width: `${exam.progress || 0}%`
                        }}
                        initial={{ width: 0 }}
                        animate={{ width: `${exam.progress || 0}%` }}
                        transition={{ duration: 0.8, delay: index * 0.05 }}
                      />
                    </div>
                  </div>
                </div>
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
  const [checkingAccess, setCheckingAccess] = useState(true);
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
        // First, fetch only module data to check access quickly
        const { data } = await moduleService.getModuleById(id);
        const moduleData = data?.data;

        if (!moduleData) {
          setIsLoading(false);
          return;
        }

        // Set module data immediately
        setModule({
          id: moduleData._id,
          name: moduleData.name,
          semester: moduleData.semester,
          color: moduleData.color,
        });

        // Check access with module name
        if (!hasAccessToSemester(moduleData.semester, moduleData.name)) {
          // For now, allow access - validation can be stricter later
          // setHasAccess(false);
          // setCheckingAccess(false);
          // return;
        }
        setHasAccess(true);
        setCheckingAccess(false);

        // Show module data while loading exams
        setIsLoading(false);

        // Fetch exams in parallel to get complete data with question counts
        Promise.all([
          api.get(`/exam-courses?moduleId=${id}`),
          api.get(`/exams/all`).catch((err) => {
            console.error('Error fetching exams:', err);
            return { data: { data: [] } };
          }),
          api.get(`/qcm-banque/all`).catch((err) => {
            console.error('Error fetching QCM banque:', err);
            return { data: { data: [] } };
          })
        ]).then(([examCoursesResponse, examsResponse, qcmResponse]) => {

          const examCourses = examCoursesResponse.data?.data || [];
          const allExams = examsResponse.data?.data || [];
          const allQcmBanque = qcmResponse.data?.data || [];

          console.log('All exams from API:', allExams);
          console.log('All QCM from API:', allQcmBanque);

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

          console.log('Filtered module exams:', moduleExams);
          console.log('Module exams with totalQuestions:', moduleExams.map(e => ({ name: e.name, totalQuestions: e.totalQuestions })));

          // Map exam par années from /exams endpoint - use totalQuestions from backend
          const yearExamsFromApi = moduleExams.map(e => ({
            id: e._id,
            name: e.name,
            questions: e.totalQuestions || 0,  // Backend provides totalQuestions
            progress: 0,
            category: "Exam par years",
            imageUrl: e.imageUrl,
            year: e.year,
            helpText: e.infoText || e.helpText || e.description || ""
          }));

          console.log('Mapped year exams:', yearExamsFromApi);

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

          // Use API data - it includes totalQuestions from backend
          const yearExams = yearExamsFromApi.length > 0 ? yearExamsFromApi : yearExamsFromCourses;
          const qcmExams = qcmFromApi.length > 0 ? qcmFromApi : qcmFromCourses;

          console.log('Final year exams to display:', yearExams);
          console.log('Final QCM exams to display:', qcmExams);

          // Set exams immediately to show UI faster
          setExamsParYear(yearExams);
          setExamsParCours(courseExams);
          setQcmBanque(qcmExams);

          // Extract unique categories
          const uniqueCategories = [...new Set(
            courseExams.map(exam => exam.category).filter(Boolean)
          )];
          setCategories([
            { id: "all", name: t('dashboard:all_categories') || "Toutes les catégories" },
            ...uniqueCategories.map(cat => ({ id: cat, name: cat }))
          ]);

          // Fetch user statistics asynchronously without blocking UI
          api.get('/users/my-stats').then(async (userStatsResponse) => {
            const userStats = userStatsResponse.data?.data;
            
            console.log('User stats response:', userStats);
            
            // Check if user has answered questions (not just empty object)
            const hasAnsweredQuestions = userStats && 
                                        userStats.answeredQuestions && 
                                        Object.keys(userStats.answeredQuestions).length > 0;
            
            if (hasAnsweredQuestions) {
              const answeredQuestionsMap = userStats.answeredQuestions;
              
              // Helper function to calculate progress for an exam
              const calculateExamProgress = async (exam) => {
                try {
                  // If exam already has total questions from backend, use it
                  // Otherwise fetch questions to get count
                  let totalQuestions = exam.questions;
                  let examQuestions = [];
                  
                  if (!totalQuestions || totalQuestions === 0) {
                    const questionsResponse = await api.get(`/questions/exam/${exam.id}`);
                    examQuestions = questionsResponse.data?.data || [];
                    totalQuestions = examQuestions.length;
                  } else {
                    // Still need to fetch to check which ones are answered
                    const questionsResponse = await api.get(`/questions/exam/${exam.id}`);
                    examQuestions = questionsResponse.data?.data || [];
                  }
                  
                  if (totalQuestions === 0) return { ...exam, progress: 0, answeredQuestions: 0 };
                  
                  // Count VERIFIED questions from server
                  let answeredCount = examQuestions.filter(q => {
                    const questionId = q._id?.toString() || q._id;
                    const answer = answeredQuestionsMap[questionId];
                    return answer && answer.isVerified === true;
                  }).length;
                  
                  const progress = Math.round((answeredCount / totalQuestions) * 100);
                  
                  return { ...exam, progress, answeredQuestions: answeredCount, questions: totalQuestions };
                } catch (err) {
                  console.error('Error calculating progress for exam:', exam.id, err);
                  return exam;
                }
              };
              
              // Calculate progress for all exams in parallel
              const [updatedYearExams, updatedCourseExams, updatedQcmExams] = await Promise.all([
                Promise.all(yearExams.map(e => calculateExamProgress(e))),
                Promise.all(courseExams.map(e => calculateExamProgress(e))),
                Promise.all(qcmExams.map(e => calculateExamProgress(e)))
              ]);
              
              console.log('Updated year exams with progress:', updatedYearExams);
              
              setExamsParYear(updatedYearExams);
              setExamsParCours(updatedCourseExams);
              setQcmBanque(updatedQcmExams);
            } else {
              console.log('No answered questions found, keeping initial question counts');
            }
          }).catch(statsError => {
            console.error('Error fetching user stats:', statsError);
            console.log('Keeping initial exams with question counts from backend');
            // Keep the initial exams that were already set with totalQuestions from backend
          });

        }).catch(examError => {
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
          setIsLoading(false);
        });

        // Fetch module stats in background (non-critical)
        api.get(`/modules/${id}/stats`).then(statsResponse => {
          if (statsResponse.data?.success) {
            setModuleStats(statsResponse.data.data);
          }
        }).catch(statsError => {
          console.error("Error fetching module stats:", statsError);
        });

      } catch (error) {
        console.error(error);
        toast.error(t('dashboard:error_loading_module'));
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-3 xs:p-4 sm:p-5 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-4 xs:space-y-5 sm:space-y-6">
          <Skeleton className="h-10 sm:h-12 md:h-14 w-56 sm:w-64 md:w-72" />
          <Skeleton className="h-12 sm:h-14 w-full max-w-2xl" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32 sm:h-36 md:h-40 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!module) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-3 xs:p-4 sm:p-5 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <Card className="border-gray-200 shadow-lg">
            <CardContent className="p-12 sm:p-16 text-center">
              <div className="flex flex-col items-center gap-5">
                <div className="h-24 w-24 sm:h-28 sm:w-28 rounded-2xl bg-gradient-to-br from-red-100 to-red-50 flex items-center justify-center shadow-md">
                  <BookOpen className="h-12 w-12 sm:h-14 sm:w-14 text-red-500" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{t('dashboard:module_not_found')}</h3>
                  <p className="text-muted-foreground">{t('dashboard:module_not_exist')}</p>
                </div>
                <Button onClick={() => navigate(-1)} className="gap-2 rounded-lg shadow-md hover:shadow-lg transition-all">
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

  if (!hasAccess && !checkingAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-3 xs:p-4 sm:p-5 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <Card className="border-gray-200 shadow-lg">
            <CardContent className="p-12 sm:p-16 text-center">
              <div className="flex flex-col items-center gap-5">
                <div className="h-24 w-24 sm:h-28 sm:w-28 rounded-2xl bg-gradient-to-br from-amber-100 to-amber-50 flex items-center justify-center shadow-md">
                  <Lock className="h-12 w-12 sm:h-14 sm:w-14 text-amber-500" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {t('dashboard:access_restricted', 'Accès Restreint')}
                  </h3>
                  <p className="text-muted-foreground mb-2">
                    {t('dashboard:module_not_in_plan', "Ce module n'est pas inclus dans votre abonnement actuel.")}
                  </p>
                  <p className="text-sm text-gray-700 font-semibold">
                    <strong>{module?.name}</strong> - {module?.semester}
                  </p>
                </div>
                <div className="flex gap-3 mt-2">
                  <Button variant="outline" onClick={() => navigate(-1)} className="gap-2 rounded-lg shadow-sm hover:shadow-md transition-all">
                    <ArrowLeft className="h-4 w-4" />
                    {t('common:back')}
                  </Button>
                  <Button onClick={() => navigate('/dashboard/subscription')} className="gap-2 rounded-lg shadow-md hover:shadow-lg transition-all">
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-3 xs:p-4 sm:p-5 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-4 xs:space-y-5 sm:space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 leading-tight tracking-tight">{module.name}</h1>
            <div
              className={`h-1.5 sm:h-2 w-20 sm:w-24 mt-2 sm:mt-2.5 rounded-full shadow-sm ${!module.color ? 'bg-gradient-to-r from-blue-600 to-indigo-500' : ''}`}
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
            <TabsList className="inline-flex w-auto min-w-full md:grid md:w-full md:grid-cols-3 h-auto p-1.5 bg-white border border-gray-200 shadow-sm rounded-xl">
              <TabsTrigger
                value="year"
                className="flex items-center gap-2 py-3 px-4 data-[state=active]:text-white whitespace-nowrap text-sm font-medium rounded-lg transition-all"
                style={module.color ? {
                  '--tw-bg-opacity': '1',
                  backgroundColor: selectedExamType === 'year' ? module.color : undefined
                } : undefined}
                data-state={selectedExamType === 'year' ? 'active' : 'inactive'}
              >
                <Calendar className="h-4 w-4" />
                <span>Par Année</span>
                {examsParYear.length > 0 && (
                  <Badge variant="secondary" className="ml-1 bg-white/20 text-white data-[state=inactive]:bg-blue-50 data-[state=inactive]:text-blue-700 text-xs font-semibold px-2 py-0.5">
                    {examsParYear.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="course"
                className="flex items-center gap-2 py-3 px-4 data-[state=active]:text-white whitespace-nowrap text-sm font-medium rounded-lg transition-all"
                style={module.color ? {
                  backgroundColor: selectedExamType === 'course' ? module.color : undefined
                } : undefined}
                data-state={selectedExamType === 'course' ? 'active' : 'inactive'}
              >
                <BookOpen className="h-4 w-4" />
                <span>Par Cours</span>
                {examsParCours.length > 0 && (
                  <Badge variant="secondary" className="ml-1 bg-white/20 text-white data-[state=inactive]:bg-orange-50 data-[state=inactive]:text-orange-700 text-xs font-semibold px-2 py-0.5">
                    {examsParCours.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="qcm"
                className="flex items-center gap-2 py-3 px-4 data-[state=active]:text-white whitespace-nowrap text-sm font-medium rounded-lg transition-all"
                style={module.color ? {
                  backgroundColor: selectedExamType === 'qcm' ? module.color : undefined
                } : undefined}
                data-state={selectedExamType === 'qcm' ? 'active' : 'inactive'}
              >
                <Library className="h-4 w-4" />
                <span>QCM Banque</span>
                {qcmBanque.length > 0 && (
                  <Badge variant="secondary" className="ml-1 bg-white/20 text-white data-[state=inactive]:bg-purple-50 data-[state=inactive]:text-purple-700 text-xs font-semibold px-2 py-0.5">
                    {qcmBanque.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Category Filter - Only for "Par Cours" */}
          {selectedExamType === "course" && categories.length > 1 && (
            <Card className="mt-4 border-gray-200 shadow-sm">
              <CardContent className="p-4 sm:p-5">
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
                      className={`${selectedCategory === cat.id && !module.color ? "bg-orange-500 hover:bg-orange-600" : ""} rounded-lg font-medium transition-all hover:shadow-md ${selectedCategory === cat.id ? "shadow-md" : ""}`}
                    >
                      {cat.name}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Exam Lists */}
          <div className="mt-4 sm:mt-5 md:mt-6">
            <TabsContent value="year" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
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
                <Card className="border-dashed border-2 bg-gradient-to-br from-gray-50 to-blue-50/30">
                  <CardContent className="p-12 sm:p-16 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center shadow-sm">
                        <Calendar className="h-10 w-10 sm:h-12 sm:w-12 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-gray-900 font-semibold mb-1">Aucun examen disponible</p>
                        <p className="text-sm text-muted-foreground">Les examens par année apparaîtront ici</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="course" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
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
                <Card className="border-dashed border-2 bg-gradient-to-br from-gray-50 to-orange-50/30">
                  <CardContent className="p-12 sm:p-16 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center shadow-sm">
                        <BookOpen className="h-10 w-10 sm:h-12 sm:w-12 text-orange-500" />
                      </div>
                      <div>
                        <p className="text-gray-900 font-semibold mb-1">
                          {selectedCategory === "all"
                            ? "Aucun examen disponible"
                            : "Aucun examen dans cette catégorie"
                          }
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {selectedCategory === "all" 
                            ? "Les examens par cours apparaîtront ici"
                            : "Essayez une autre catégorie"
                          }
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="qcm" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
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
                <Card className="border-dashed border-2 bg-gradient-to-br from-gray-50 to-purple-50/30">
                  <CardContent className="p-12 sm:p-16 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl bg-gradient-to-br from-purple-100 to-purple-50 flex items-center justify-center shadow-sm">
                        <Library className="h-10 w-10 sm:h-12 sm:w-12 text-purple-500" />
                      </div>
                      <div>
                        <p className="text-gray-900 font-semibold mb-1">Aucun QCM disponible</p>
                        <p className="text-sm text-muted-foreground">Les QCM de la banque apparaîtront ici</p>
                      </div>
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
