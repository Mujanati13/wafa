import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Play, BookOpen, GraduationCap, Lock, FileQuestion, Calendar, Library, Shuffle } from "lucide-react";
import { moduleService } from "@/services/moduleService";
import { userService } from "@/services/userService";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

// Exam Card Component
const ExamCard = ({ exam, onStart, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card
        className="hover:shadow-lg transition-all cursor-pointer group"
        onClick={() => onStart(exam.id)}
      >
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            {/* Icon */}
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <FileQuestion className="h-6 w-6 text-white" />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                {exam.name}
              </h3>
              <p className="text-sm text-gray-500">{exam.questions} Questions</p>
            </div>

            {/* Progress */}
            <ProgressCircle progress={exam.progress || 0} size={48} />
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
        });

        // Build question count map
        const examIdToQuestionCount = (moduleData.questions || []).reduce(
          (acc, q) => {
            const key = q.examId;
            acc[key] = (acc[key] || 0) + 1;
            return acc;
          },
          {}
        );

        // Process exams and categorize by type
        // For now, we'll use the existing exams structure and simulate the 3 types
        // In production, you'd fetch from separate endpoints
        const allExams = (moduleData.exams || []).map((e) => ({
          id: e._id,
          name: e.name,
          questions: examIdToQuestionCount[e._id] || 0,
          progress: 0,
          category: e.category || "Général",
          year: e.year,
          type: e.type || "year", // Default to year type
        }));

        // Separate exams by type (simulated - in production use real type field)
        // For demo: first 1/3 = year, middle 1/3 = course, last 1/3 = qcm
        const yearExams = allExams.filter((_, i) => i % 3 === 0 || allExams.length <= 3);
        const courseExams = allExams.filter((_, i) => i % 3 === 1);
        const qcmExams = allExams.filter((_, i) => i % 3 === 2);

        setExamsParYear(yearExams);
        setExamsParCours(courseExams);
        setQcmBanque(qcmExams);

        // Extract unique categories from course exams
        const uniqueCategories = [...new Set(courseExams.map(e => e.category))];
        setCategories([
          { id: "all", name: t('common:all', 'Tous') },
          ...uniqueCategories.map(cat => ({ id: cat, name: cat }))
        ]);

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
            <div className="h-1 w-24 bg-gradient-to-r from-blue-600 to-indigo-500 mt-2 rounded-full" />
          </div>
        </div>

        {/* Exam Type Tabs */}
        <Tabs value={selectedExamType} onValueChange={setSelectedExamType} className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-auto p-1 bg-white border shadow-sm">
            <TabsTrigger
              value="year"
              className="flex items-center gap-2 py-3 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Exam par Year</span>
              <span className="sm:hidden">Par Year</span>
              {examsParYear.length > 0 && (
                <Badge variant="secondary" className="ml-1 bg-blue-100 text-blue-700 data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                  {examsParYear.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="course"
              className="flex items-center gap-2 py-3 data-[state=active]:bg-orange-500 data-[state=active]:text-white"
            >
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Par Cours</span>
              <span className="sm:hidden">Cours</span>
              {examsParCours.length > 0 && (
                <Badge variant="secondary" className="ml-1 bg-orange-100 text-orange-700 data-[state=active]:bg-orange-400 data-[state=active]:text-white">
                  {examsParCours.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="qcm"
              className="flex items-center gap-2 py-3 data-[state=active]:bg-purple-600 data-[state=active]:text-white"
            >
              <Library className="h-4 w-4" />
              <span className="hidden sm:inline">QCM Banque</span>
              <span className="sm:hidden">Banque</span>
              {qcmBanque.length > 0 && (
                <Badge variant="secondary" className="ml-1 bg-purple-100 text-purple-700 data-[state=active]:bg-purple-500 data-[state=active]:text-white">
                  {qcmBanque.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

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
                      className={selectedCategory === cat.id ? "bg-orange-500 hover:bg-orange-600" : ""}
                    >
                      {cat.name}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Stats Summary */}
          <Card className="mt-4">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
                    <FileQuestion className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Questions</p>
                    <p className="text-xl font-bold">{totalQuestions}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center">
                    <GraduationCap className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Examens</p>
                    <p className="text-xl font-bold">{currentExams.length}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Exam Lists */}
          <div className="mt-4">
            <TabsContent value="year" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {examsParYear.map((exam, index) => (
                  <ExamCard
                    key={exam.id}
                    exam={exam}
                    onStart={handleStartExam}
                    index={index}
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCourseExams.map((exam, index) => (
                  <ExamCard
                    key={exam.id}
                    exam={exam}
                    onStart={handleStartExam}
                    index={index}
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {qcmBanque.map((exam, index) => (
                  <ExamCard
                    key={exam.id}
                    exam={exam}
                    onStart={handleStartExam}
                    index={index}
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
