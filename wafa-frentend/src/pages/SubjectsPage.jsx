import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Play, RotateCcw, ChevronDown, BookOpen, GraduationCap, Lock, FileQuestion, ListChecks, Shuffle } from "lucide-react";
import { moduleService } from "@/services/moduleService";
import { userService } from "@/services/userService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/shared";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

// Progress Circle Component
const ProgressCircle = ({ progress, size = 48 }) => {
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
          className="text-blue-600 transition-all duration-500"
          strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          stroke="currentColor"
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

const SubjectsPage = () => {
  const { t } = useTranslation(['dashboard', 'common']);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [course, setCourse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(true);
  const [userSemesters, setUserSemesters] = useState([]);
  const [userPlan, setUserPlan] = useState("Free");
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
        // Fallback to localStorage
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
    // If user has semesters defined, check against those
    if (userSemesters && userSemesters.length > 0) {
      return userSemesters.includes(semester);
    }
    // For Free plan users with no semesters set, give access to S1 by default
    if (userPlan === "Free" || !userPlan) {
      return semester === "S1";
    }
    return false;
  };

  useEffect(() => {
    const fetchData = async (id) => {
      setIsLoading(true);
      try {
        const { data } = await moduleService.getModuleById(id);
        const moduleData = data?.data;

        if (!moduleData) return;

        // Check if user has access to this module's semester
        if (!hasAccessToSemester(moduleData.semester)) {
          setHasAccess(false);
          setCourse({ name: moduleData.name, semester: moduleData.semester });
          setIsLoading(false);
          return;
        }
        setHasAccess(true);

        // Build a map of examId -> questions count
        const examIdToQuestionCount = (moduleData.questions || []).reduce(
          (acc, q) => {
            const key = q.examId;
            acc[key] = (acc[key] || 0) + 1;
            return acc;
          },
          {}
        );

        // Normalize exams to UI structure
        const normalizedExams = (moduleData.exams || []).map((e) => ({
          id: e._id,
          name: e.name,
          questions: examIdToQuestionCount[e._id] || 0,
          completed: 0,
          progress: 0,
          description: e.infoText,
          imageUrl: e.imageUrl,
          infoText: e.infoText,
          category: "all",
        }));

        // Minimal categories for filters
        const categories = [{ id: "all", name: t('common:all') }];

        setCourse({
          id: moduleData._id,
          name: moduleData.name,
          image: "📘",
          categories,
          exams: normalizedExams,
        });
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

  const filteredExams = course?.exams?.filter(
    (exam) => selectedCategory === "all" || exam.category === selectedCategory
  ) || [];

  const totalQuestions = course?.exams?.reduce((sum, exam) => sum + exam.questions, 0) || 0;
  const completedExams = course?.exams?.filter(exam => exam.progress === 100).length || 0;

  const handleStartExam = (examId) => {
    navigate(`/exam/${examId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-12 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
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

  // Access denied - user doesn't have subscription for this semester
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
                    <strong>{course?.name}</strong> - {course?.semester}
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
            <PageHeader
              title={course.name}
              description={`${course.exams.length} ${t('dashboard:exams_available')}`}
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('dashboard:total_questions')}</p>
                  <p className="text-2xl font-bold">{totalQuestions}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-green-50 flex items-center justify-center">
                  <GraduationCap className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('dashboard:exams')}</p>
                  <p className="text-2xl font-bold">{course.exams.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-purple-50 flex items-center justify-center">
                  <Play className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('dashboard:completed')}</p>
                  <p className="text-2xl font-bold">{completedExams}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        {course.categories.length > 1 && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">{t('dashboard:category')}:</span>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {course.categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Exams List - QCMOLOGY Style */}
        <div className="space-y-4">
          {filteredExams.map((exam, index) => (
            <motion.div
              key={exam.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="hover:shadow-lg transition-all overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    {/* Left Side: Exam Info */}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                          <FileQuestion className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 line-clamp-1">{exam.name}</h3>
                          <p className="text-sm text-gray-500">{exam.questions} Questions</p>
                        </div>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">Progression</span>
                          <span className="font-medium text-gray-700">{exam.progress}%</span>
                        </div>
                        <Progress value={exam.progress} className="h-2" />
                      </div>
                    </div>

                    {/* Right Side: Mode Buttons */}
                    <div className="flex flex-col sm:flex-row gap-2 lg:gap-3">
                      <Button 
                        className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={() => navigate(`/exam/${exam.id}?mode=exam`)}
                      >
                        <Play className="h-4 w-4" />
                        Mode Examen
                      </Button>
                      <Button 
                        variant="outline"
                        className="gap-2 border-green-200 text-green-700 hover:bg-green-50"
                        onClick={() => navigate(`/exam/${exam.id}?mode=course`)}
                      >
                        <BookOpen className="h-4 w-4" />
                        Mode Cours
                      </Button>
                      <Button 
                        variant="outline"
                        className="gap-2 border-purple-200 text-purple-700 hover:bg-purple-50"
                        onClick={() => navigate(`/exam/${exam.id}?mode=bank`)}
                      >
                        <Shuffle className="h-4 w-4" />
                        Mode Banque
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredExams.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="h-20 w-20 rounded-full bg-blue-50 flex items-center justify-center">
                  <BookOpen className="h-10 w-10 text-blue-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">{t('dashboard:no_exams_available')}</h3>
                  <p className="text-muted-foreground">
                    {selectedCategory === "all" 
                      ? t('dashboard:no_exams_in_module')
                      : t('dashboard:no_exams_in_category')
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SubjectsPage;
