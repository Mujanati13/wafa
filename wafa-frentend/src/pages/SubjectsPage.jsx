import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Play, BookOpen, GraduationCap, Lock, FileQuestion, Calendar, Library, Shuffle } from "lucide-react";
import { moduleService } from "@/services/moduleService";
import { userService } from "@/services/userService";
import { api } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/shared";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

// Progress Circle Component
const ProgressCircle = ({ progress, size = 48, color }) => {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          className="text-gray-200"
          strokeWidth="4"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className={!color ? "text-blue-600 transition-all duration-500" : "transition-all duration-500"}
          strokeWidth="4"
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
        <span className="text-xs font-bold text-gray-700">{progress}%</span>
      </div>
    </div>
  );
};

// Exam Card Component
const ExamCard = ({ exam, onStart, index, moduleColor }) => {
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
    return `${API_URL}${exam.imageUrl}`;
  };

  const imageUrl = getImageUrl();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card
        className="hover:shadow-lg transition-all cursor-pointer group active:scale-[0.98]"
        onClick={() => onStart(exam.id)}
      >
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Icon or Image */}
            {imageUrl ? (
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl overflow-hidden flex-shrink-0 group-hover:scale-105 transition-transform">
                <img 
                  src={imageUrl} 
                  alt={exam.name} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = `<div class="h-full w-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 sm:h-6 sm:w-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14,2 14,8 20,8"/><circle cx="10" cy="13" r="2"/><path d="m20 17-1.09-1.09a2 2 0 0 0-2.82 0L10 22"/></svg></div>`;
                  }}
                />
              </div>
            ) : (
              <div
                className={`h-10 w-10 sm:h-12 sm:w-12 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform ${!moduleColor ? 'bg-gradient-to-br from-blue-500 to-indigo-600' : ''}`}
                style={moduleColor ? {
                  background: `linear-gradient(to bottom right, ${moduleColor}, ${adjustColorLocal(moduleColor, -30)})`
                } : undefined}
              >
                <FileQuestion className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
            )}

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h3
                className="font-semibold text-gray-900 line-clamp-1 transition-colors"
                style={{ color: moduleColor ? undefined : undefined }}
              >
                {exam.name}
              </h3>
              <p className="text-sm text-gray-500">{exam.questions} Questions</p>
            </div>

            {/* Progress */}
            <ProgressCircle progress={exam.progress || 0} size={48} color={moduleColor} />
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
        setUserSemesters(semesters);
        setUserPlan(plan);
        localStorage.setItem("user", JSON.stringify(userProfile));
      } catch (error) {
        console.error("Error fetching user profile:", error);
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const user = JSON.parse(storedUser);
          setUserSemesters(user.semesters || []);
          setUserPlan(user.plan || "Free");
        }
      }
    };
    checkAccess();
  }, []);

  // Helper function to check if user has access to a semester
  const hasAccessToSemester = (semester) => {
    if (userSemesters && userSemesters.length > 0) {
      return userSemesters.includes(semester);
    }
    if (userPlan === "Free" || !userPlan) {
      return semester === "S1";
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

        // Check access
        if (!hasAccessToSemester(moduleData.semester)) {
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
            year: e.year
          }));

          // Map QCM banque from /qcm-banque endpoint
          const qcmFromApi = moduleQcm.map(q => ({
            id: q._id,
            name: q.name,
            questions: q.totalQuestions || 0,
            progress: 0,
            category: "QCM banque",
            imageUrl: q.imageUrl
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
              imageUrl: c.imageUrl
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
              imageUrl: c.imageUrl
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
              imageUrl: c.imageUrl
            }));

          // Combine sources - prioritize direct API sources
          const yearExams = yearExamsFromApi.length > 0 ? yearExamsFromApi : yearExamsFromCourses;
          const qcmExams = qcmFromApi.length > 0 ? qcmFromApi : qcmFromCourses;

          setExamsParYear(yearExams);
          setExamsParCours(courseExams);
          setQcmBanque(qcmExams);

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

  const handleStartExam = (examId) => {
    navigate(`/exam/${examId}`);
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
  const totalQuestions = currentExams.reduce((sum, exam) => sum + exam.questions, 0);

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
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800">{module.name}</h1>
            <div
              className={`h-1 w-24 mt-2 rounded-full ${!module.color ? 'bg-gradient-to-r from-blue-600 to-indigo-500' : ''}`}
              style={module.color ? {
                background: `linear-gradient(to right, ${module.color}, ${adjustColor(module.color, -30)})`
              } : undefined}
            />
          </div>
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

          {/* Stats Summary */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Total Questions Card */}
            <Card className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div
                    className={`h-14 w-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${!module.color ? 'bg-blue-50' : ''}`}
                    style={module.color ? {
                      backgroundColor: `${module.color}20`
                    } : undefined}
                  >
                    <FileQuestion
                      className={`h-7 w-7 ${!module.color ? 'text-blue-600' : ''}`}
                      style={module.color ? { color: module.color } : undefined}
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500 mb-1">Total Questions</p>
                    <p className="text-3xl font-bold text-gray-900">{totalQuestions}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Examens Card */}
            <Card className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div
                    className={`h-14 w-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${!module.color ? 'bg-blue-50' : ''}`}
                    style={module.color ? {
                      backgroundColor: `${module.color}15`
                    } : undefined}
                  >
                    <GraduationCap
                      className={`h-7 w-7 ${!module.color ? 'text-blue-600' : ''}`}
                      style={module.color ? { color: module.color } : undefined}
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500 mb-1">Examens</p>
                    <p className="text-3xl font-bold text-gray-900">{currentExams.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Exam Lists */}
          <div className="mt-4">
            <TabsContent value="year" className="mt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                {examsParYear.map((exam, index) => (
                  <ExamCard
                    key={exam.id}
                    exam={exam}
                    onStart={handleStartExam}
                    index={index}
                    moduleColor={module?.color}
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
                    index={index}
                    moduleColor={module?.color}
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
                    index={index}
                    moduleColor={module?.color}
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
    </div>
  );
};

export default SubjectsPage;
