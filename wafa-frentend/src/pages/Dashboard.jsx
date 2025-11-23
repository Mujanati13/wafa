import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { moduleService } from "@/services/moduleService";
import { Lock, Sparkles, TrendingUp, Award, Clock } from "lucide-react";
import ModuleCard from "@/components/Dashboard/ModuleCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader, StatCard } from "@/components/shared";

const Dashboard = () => {
  const navigate = useNavigate();
  const [semester, setSemester] = useState("S1");
  const [coursesData, setCoursesData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProgress: 0,
    questionsAnswered: 0,
    currentStreak: 0,
    rank: 0,
  });

  const semesters = [
    { name: "S1", isOpen: true },
    { name: "S2", isOpen: false },
    { name: "S3", isOpen: false },
    { name: "S4", isOpen: false },
    { name: "S5", isOpen: false },
    { name: "S6", isOpen: false },
    { name: "S7", isOpen: false },
    { name: "S8", isOpen: false },
    { name: "S9", isOpen: false },
    { name: "S10", isOpen: false },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { data } = await moduleService.getAllmodules();
        localStorage.setItem("modules", JSON.stringify(data.data));
        setCoursesData(data.data);
        
        // Mock stats - replace with actual API call
        setStats({
          totalProgress: 65,
          questionsAnswered: 1234,
          currentStreak: 7,
          rank: 45,
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  const handleCourseClick = (courseId) => {
    navigate(`/dashboard/subjects/${courseId}`);
  };

  const user = { name: "Az-eddine serhani", plan: "Plan Gratuit" };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 p-4 md:p-6">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-blue-100 rounded-full opacity-20 blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-teal-100 rounded-full opacity-15 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-blue-200 rounded-full opacity-20 blur-2xl animate-pulse" style={{ animationDelay: '0.5s' }} />
      </div>

      <div className="relative z-10 space-y-6">
        {/* Header Section */}
        <Card className="border-primary/20 bg-gradient-to-br from-white to-blue-50/30">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              {/* Welcome Message */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-yellow-500" />
                  <h1 className="text-2xl md:text-3xl font-bold">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-teal-500 to-blue-600">
                      Bienvenue
                    </span>
                    <span className="text-primary ml-2">{user.name}</span>
                  </h1>
                </div>
                <p className="text-muted-foreground text-sm md:text-base">
                  Bienvenue dans votre interface WAFA. Si vous avez des questions,{" "}
                  <Button
                    variant="link"
                    className="p-0 h-auto text-primary"
                    onClick={() => navigate("/contact")}
                  >
                    contactez-nous
                  </Button>
                  .
                </p>
              </div>

              {/* Semester Selector & Plan Badge */}
              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap gap-2">
                  {semesters.slice(0, 6).map((item) => (
                    <Button
                      key={item.name}
                      variant={semester === item.name ? "default" : "outline"}
                      size="sm"
                      disabled={!item.isOpen}
                      onClick={() => setSemester(item.name)}
                      className="min-w-[60px]"
                    >
                      {item.name}
                      {!item.isOpen && <Lock className="ml-1 h-3 w-3" />}
                    </Button>
                  ))}
                </div>
                <Badge variant="secondary" className="self-start">
                  {user.plan}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Progression totale"
              value={`${stats.totalProgress}%`}
              icon={<TrendingUp className="h-4 w-4" />}
              trend="up"
              trendValue="+12%"
              description="ce mois"
            />
            <StatCard
              title="Questions répondues"
              value={stats.questionsAnswered}
              icon={<Award className="h-4 w-4" />}
              description="au total"
            />
            <StatCard
              title="Série actuelle"
              value={`${stats.currentStreak} jours`}
              icon={<Clock className="h-4 w-4" />}
              trend="up"
              trendValue="Record!"
              description="Continuez comme ça"
            />
            <StatCard
              title="Classement"
              value={`#${stats.rank}`}
              icon={<Award className="h-4 w-4" />}
              trend="up"
              trendValue="+3"
              description="cette semaine"
            />
          </div>
        )}

        {/* Modules Section */}
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              Modules <Badge variant="outline">{semester}</Badge>
            </h2>
            <div className="h-1 w-12 bg-primary mt-2 rounded-full" />
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <Skeleton className="h-32 w-full mb-4 rounded-lg" />
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {coursesData?.map((course, index) => (
                <ModuleCard
                  key={course.id || index}
                  course={course}
                  handleCourseClick={handleCourseClick}
                  index={index}
                />
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
