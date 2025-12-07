import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { moduleService } from "@/services/moduleService";
import { dashboardService } from "@/services/dashboardService";
import { Lock, Sparkles, TrendingUp, Award, Clock, HelpCircle, ChevronDown, GraduationCap, UserPlus, BarChart3, Shield, RefreshCcw, Settings2 } from "lucide-react";
import ModuleCard from "@/components/Dashboard/ModuleCard";
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

const Dashboard = () => {
  const { t } = useTranslation(['dashboard', 'common']);
  const navigate = useNavigate();
  const [semester, setSemester] = useState(null);
  const [coursesData, setCoursesData] = useState(null);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [userSemesters, setUserSemesters] = useState([]);
  const [stats, setStats] = useState({
    examsCompleted: 0,
    averageScore: 0,
    studyHours: 0,
    rank: 0,
  });

  const allSemesters = ["S1", "S2", "S3", "S4", "S5", "S6", "S7", "S8", "S9", "S10"];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch modules
        const { data: modulesData } = await moduleService.getAllmodules();
        localStorage.setItem("modules", JSON.stringify(modulesData.data));
        setCoursesData(modulesData.data);

        // Fetch user profile
        const profileData = await dashboardService.getUserProfile();
        const userData = profileData.data?.user || profileData.data;
        setUser(userData);
        
        // Get user's subscribed semesters
        const subscribedSemesters = userData?.semesters || [];
        setUserSemesters(subscribedSemesters);
        
        // Set default semester to the first subscribed semester
        if (subscribedSemesters.length > 0) {
          setSemester(subscribedSemesters[0]);
        }

        // Fetch user stats
        const statsData = await dashboardService.getUserStats();
        
        // Fetch user's rank
        const { rank } = await dashboardService.getLeaderboardRank();

        setStats({
          examsCompleted: statsData.data.stats.examsCompleted || 0,
          averageScore: statsData.data.stats.averageScore || 0,
          studyHours: statsData.data.stats.studyHours || 0,
          rank: rank || 0,
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast.error(t('dashboard:error_loading_dashboard'));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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
    navigate(`/dashboard/subjects/${courseId}`);
  };

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
                      {t('dashboard:welcome')}
                    </span>
                    <span className="text-primary ml-2">{user?.name || user?.fullName || 'Utilisateur'}</span>
                  </h1>
                </div>
                <p className="text-muted-foreground text-sm md:text-base">
                  {t('dashboard:welcome_message')}{" "}
                  <Button
                    variant="link"
                    className="p-0 h-auto text-primary"
                    onClick={() => navigate("/contact")}
                  >
                    {t('common:contact')}
                  </Button>
                  .
                </p>
              </div>

              {/* Semester Selector & Plan Badge */}
              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap gap-2">
                  {allSemesters.slice(0, 6).map((sem) => {
                    const isSubscribed = userSemesters.includes(sem);
                    return (
                      <Button
                        key={sem}
                        variant={semester === sem ? "default" : "outline"}
                        size="sm"
                        disabled={!isSubscribed}
                        onClick={() => setSemester(sem)}
                        className="min-w-[60px]"
                      >
                        {sem}
                        {!isSubscribed && <Lock className="ml-1 h-3 w-3" />}
                      </Button>
                    );
                  })}
                </div>
                <Badge variant="secondary" className="self-start">
                  {user?.plan || 'Plan Gratuit'}
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

        {/* Modules Section */}
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              {t('dashboard:modules')} <Badge variant="outline">{semester}</Badge>
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
                <div className="col-span-full text-center py-12">
                  <div className="max-w-md mx-auto">
                    <Lock className="h-12 w-12 mx-auto mb-4 text-slate-400" />
                    <h3 className="text-lg font-semibold text-slate-700 mb-2">
                      {userSemesters.length === 0 
                        ? "Aucun semestre souscrit" 
                        : "Aucun module disponible pour ce semestre"
                      }
                    </h3>
                    <p className="text-slate-500 mb-4">
                      {userSemesters.length === 0 
                        ? "Abonnez-vous pour accéder aux modules de vos semestres" 
                        : "Sélectionnez un autre semestre ou vérifiez votre abonnement"
                      }
                    </p>
                    <Button onClick={() => navigate('/dashboard/subscription')}>
                      Voir les abonnements
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8"
        >
          <Card className="border-blue-100 bg-gradient-to-br from-white to-blue-50/30">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl md:text-2xl">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <HelpCircle className="h-6 w-6 text-blue-600" />
                </div>
                Réponses aux questions fréquentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full space-y-2">
                <AccordionItem value="item-1" className="border rounded-lg px-4 bg-white shadow-sm">
                  <AccordionTrigger className="hover:no-underline py-4">
                    <div className="flex items-center gap-3 text-left">
                      <GraduationCap className="h-5 w-5 text-blue-500 flex-shrink-0" />
                      <span className="font-medium">Pour quelle faculté sont destinés ces QCMs ?</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-slate-600 pb-4 pl-8">
                    Les QCMs sont spécifiquement conçus pour les étudiants de la <strong>FMPR</strong> (Faculté de Médecine et de Pharmacie de Rabat).
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2" className="border rounded-lg px-4 bg-white shadow-sm">
                  <AccordionTrigger className="hover:no-underline py-4">
                    <div className="flex items-center gap-3 text-left">
                      <UserPlus className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span className="font-medium">Dois-je créer un compte ?</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-slate-600 pb-4 pl-8">
                    Oui, la création d'un compte gratuit est nécessaire pour accéder aux QCMs et sauvegarder votre progression.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3" className="border rounded-lg px-4 bg-white shadow-sm">
                  <AccordionTrigger className="hover:no-underline py-4">
                    <div className="flex items-center gap-3 text-left">
                      <BarChart3 className="h-5 w-5 text-purple-500 flex-shrink-0" />
                      <span className="font-medium">Puis-je suivre ma progression ?</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-slate-600 pb-4 pl-8">
                    Oui, votre progression est automatiquement sauvegardée et vous pouvez la consulter à tout moment.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-4" className="border rounded-lg px-4 bg-white shadow-sm">
                  <AccordionTrigger className="hover:no-underline py-4">
                    <div className="flex items-center gap-3 text-left">
                      <Shield className="h-5 w-5 text-teal-500 flex-shrink-0" />
                      <span className="font-medium">Mes informations bancaires sont-elles sécurisées ?</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-slate-600 pb-4 pl-8">
                    Absolument. Nous ne conservons aucune information concernant votre carte bancaire. Tous les paiements sont traités par <strong>PayPal</strong> qui garantit la sécurité de vos transactions.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-5" className="border rounded-lg px-4 bg-white shadow-sm">
                  <AccordionTrigger className="hover:no-underline py-4">
                    <div className="flex items-center gap-3 text-left">
                      <RefreshCcw className="h-5 w-5 text-orange-500 flex-shrink-0" />
                      <span className="font-medium">Puis-je être remboursé ?</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-slate-600 pb-4 pl-8">
                    Les remboursements ne sont accordés que dans des cas exceptionnels. Pour toute demande, contactez-nous sur WhatsApp <a href="https://wa.me/212612345678" target="_blank" rel="noopener noreferrer" className="text-blue-600 font-semibold hover:underline">0612345678</a>.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-6" className="border rounded-lg px-4 bg-white shadow-sm">
                  <AccordionTrigger className="hover:no-underline py-4">
                    <div className="flex items-center gap-3 text-left">
                      <Settings2 className="h-5 w-5 text-indigo-500 flex-shrink-0" />
                      <span className="font-medium">Puis-je personnaliser mon parcours d'études ?</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-slate-600 pb-4 pl-8">
                    Bien sûr ! Vous pouvez organiser votre plan d'études par création des <strong>playlists</strong>, des <strong>examens</strong> et des <strong>exercices spécifiques</strong> afin de personnaliser votre expérience d'apprentissage.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </motion.div>

        {/* Help Center Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-8"
        >
          <Card className="border-blue-100 bg-gradient-to-br from-white to-blue-50/30">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center justify-center gap-3 text-2xl md:text-3xl">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg">
                  <HelpCircle className="h-6 w-6 text-white" />
                </div>
                Centre d'Aide
              </CardTitle>
              <CardDescription className="text-center text-base">
                Trouvez des réponses à vos questions ou contactez notre équipe de support
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Facebook Card */}
                <motion.div
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="p-6 rounded-xl border-2 border-blue-100 bg-white hover:shadow-lg transition-all cursor-pointer group"
                  onClick={() => window.open('https://facebook.com/wafa_app', '_blank')}
                >
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                      <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    </div>
                    <div className="text-center">
                      <h3 className="text-lg font-bold text-slate-900">Facebook</h3>
                      <p className="text-sm text-slate-600 mt-1">Suivez nos actualités</p>
                    </div>
                  </div>
                </motion.div>

                {/* Email Card */}
                <motion.div
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="p-6 rounded-xl border-2 border-blue-100 bg-white hover:shadow-lg transition-all cursor-pointer group"
                  onClick={() => window.location.href = 'mailto:contact@wafa.com'}
                >
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="text-center">
                      <h3 className="text-lg font-bold text-slate-900">Email</h3>
                      <p className="text-sm text-slate-600 mt-1">contact@wafa.com</p>
                    </div>
                  </div>
                </motion.div>

                {/* Instagram Card */}
                <motion.div
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="p-6 rounded-xl border-2 border-blue-100 bg-white hover:shadow-lg transition-all cursor-pointer group"
                  onClick={() => window.open('https://instagram.com/wafa_app', '_blank')}
                >
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                      <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"/>
                      </svg>
                    </div>
                    <div className="text-center">
                      <h3 className="text-lg font-bold text-slate-900">Instagram</h3>
                      <p className="text-sm text-slate-600 mt-1">@wafa_app</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;