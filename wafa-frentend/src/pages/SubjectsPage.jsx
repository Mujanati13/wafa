import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Play, RotateCcw, ChevronDown, BookOpen, GraduationCap } from "lucide-react";
import { moduleService } from "@/services/moduleService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/shared";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

const SubjectsPage = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [course, setCourse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { courseId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async (id) => {
      setIsLoading(true);
      try {
        const { data } = await moduleService.getModuleById(id);
        const moduleData = data?.data;

        if (!moduleData) return;

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
        const categories = [{ id: "all", name: "Tous" }];

        setCourse({
          id: moduleData._id,
          name: moduleData.name,
          image: "📘",
          categories,
          exams: normalizedExams,
        });
      } catch (error) {
        console.error(error);
        toast.error("Erreur lors du chargement du module");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData(courseId);
  }, [courseId]);

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
                  <h3 className="text-lg font-semibold mb-1">Module introuvable</h3>
                  <p className="text-muted-foreground">Ce module n'existe pas ou a été supprimé</p>
                </div>
                <Button onClick={() => navigate(-1)} className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Retour
                </Button>
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
              description={`${course.exams.length} examens disponibles`}
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
                  <p className="text-sm text-muted-foreground">Total Questions</p>
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
                  <p className="text-sm text-muted-foreground">Examens</p>
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
                  <p className="text-sm text-muted-foreground">Complétés</p>
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
                <span className="text-sm font-medium">Catégorie:</span>
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

        {/* Exams Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExams.map((exam, index) => (
            <motion.div
              key={exam.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="hover:shadow-lg transition-all h-full flex flex-col">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg">{exam.name}</CardTitle>
                    <Badge variant={exam.progress > 0 ? "default" : "secondary"}>
                      {exam.questions} Q
                    </Badge>
                  </div>
                  {exam.description && (
                    <CardDescription className="line-clamp-2">
                      {exam.description}
                    </CardDescription>
                  )}
                </CardHeader>
                
                <CardContent className="flex-1 flex flex-col justify-end space-y-4">
                  {exam.progress > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progression</span>
                        <span className="font-medium">{exam.progress}%</span>
                      </div>
                      <Progress value={exam.progress} />
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <Button 
                      className="flex-1 gap-2" 
                      onClick={() => handleStartExam(exam.id)}
                    >
                      <Play className="h-4 w-4" />
                      {exam.progress > 0 ? 'Continuer' : 'Commencer'}
                    </Button>
                    {exam.progress > 0 && (
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => toast.info('Réinitialisation de la progression')}
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    )}
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
                  <h3 className="text-lg font-semibold mb-1">Aucun examen disponible</h3>
                  <p className="text-muted-foreground">
                    {selectedCategory === "all" 
                      ? "Il n'y a pas encore d'examens dans ce module"
                      : "Aucun examen dans cette catégorie"
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
