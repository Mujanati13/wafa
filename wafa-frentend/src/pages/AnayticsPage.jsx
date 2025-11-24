import { useTranslation } from 'react-i18next';
import {
  SubscrptionChart,
  UserGrowChart,
  SubjectPerformanceChart,
  ExamAttemptsChart,
  UserDemographicsChart,
} from "@/components/admin/Charts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  Users,
  GraduationCap,
  CreditCard,
  Plus,
  Calendar,
  Download,
  BarChart3,
  Clock,
  Target,
  Award,
  Activity,
} from "lucide-react";
import { useState, useEffect } from "react";
import { adminAnalyticsService } from "@/services/adminAnalyticsService";
import { toast } from "sonner";

const AnalyticsPage = () => {
  const { t } = useTranslation(['admin', 'common']);
  const [dateRange, setDateRange] = useState("30d");
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, [dateRange]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsResponse, activityResponse] = await Promise.all([
        adminAnalyticsService.getDashboardStats(),
        adminAnalyticsService.getRecentActivity(5)
      ]);
      
      setDashboardData(statsResponse.data);
      setRecentActivity(activityResponse.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Erreur', {
        description: 'Impossible de charger les données du tableau de bord.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    // Export functionality would go here
    console.log("Exporting analytics data...");
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case "user":
        return <Users className="w-4 h-4 text-blue-500" />;
      case "exam":
        return <GraduationCap className="w-4 h-4 text-green-500" />;
      case "subscription":
        return <CreditCard className="w-4 h-4 text-purple-500" />;
      case "payment":
        return <TrendingUp className="w-4 h-4 text-orange-500" />;
      case "admin":
        return <Plus className="w-4 h-4 text-gray-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const past = new Date(date);
    const diffInSeconds = Math.floor((now - past) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds} secondes`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} heures`;
    return `${Math.floor(diffInSeconds / 86400)} jours`;
  };

  // Stats Cards Data (use real data when available)
  const stats = dashboardData ? [
  {
    label: t('admin:total_users'),
    value: dashboardData.totalUsers?.value?.toLocaleString() || "0",
    change: dashboardData.totalUsers?.growth || "+0%",
    changeText: t('admin:from_last_month'),
    icon: <Users className="w-6 h-6 text-gray-400" />,
  },
  {
    label: t('admin:active_subscriptions'),
    value: dashboardData.activeSubscriptions?.value?.toLocaleString() || "0",
    change: dashboardData.activeSubscriptions?.growth || "+0%",
    changeText: t('admin:from_last_month'),
    icon: <CreditCard className="w-6 h-6 text-gray-400" />,
  },
  {
    label: t('admin:exam_attempts'),
    value: dashboardData.examAttempts?.value?.toLocaleString() || "0",
    change: dashboardData.examAttempts?.growth || "+0%",
    changeText: t('admin:from_last_month'),
    icon: <GraduationCap className="w-6 h-6 text-gray-400" />,
  },
  {
    label: t('admin:monthly_revenue'),
    value: `${dashboardData.monthlyRevenue?.value?.toLocaleString() || "0"} ${dashboardData.monthlyRevenue?.currency || "MAD"}`,
    change: "+0%",
    changeText: t('admin:from_last_month'),
    icon: <TrendingUp className="w-6 h-6 text-gray-400" />,
  },
  ] : [];

  // Performance Metrics Data
  const performanceMetrics = dashboardData ? [
  {
    label: t('admin:average_score'),
    value: `${dashboardData.performanceMetrics?.averageScore || "0"}%`,
    change: "+0%",
    icon: <Target className="w-5 h-5 text-blue-500" />,
  },
  {
    label: t('admin:completion_rate'),
    value: "N/A",
    change: "+0%",
    icon: <Award className="w-5 h-5 text-green-500" />,
  },
  {
    label: t('admin:study_time'),
    value: `${dashboardData.performanceMetrics?.totalStudyHours || "0"}h`,
    change: "+0h",
    icon: <Clock className="w-5 h-5 text-purple-500" />,
  },
  {
    label: t('admin:active_sessions'),
    value: dashboardData.totalUsers?.value?.toLocaleString() || "0",
    change: "+0%",
    icon: <Activity className="w-5 h-5 text-orange-500" />,
  },
  ] : [];

  // Subject Performance Data
  const subjectPerformance = [
    { subject: "Mathematics", score: 85, attempts: 1247, growth: "+12.3%" },
    { subject: "Physics", score: 78, attempts: 892, growth: "+8.7%" },
    { subject: "Chemistry", score: 82, attempts: 756, growth: "+15.2%" },
    { subject: "Biology", score: 79, attempts: 634, growth: "+6.8%" },
    { subject: "English", score: 88, attempts: 445, growth: "+9.1%" },
  ];

  return (
    <div className="p-5 space-y-6 flex flex-col">
      {/* Header with Filters and Export */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t('admin:analytics_dashboard')}
          </h1>
          <p className="text-gray-600">
            {t('admin:monitor_platform_performance')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="text-sm border-none outline-none bg-transparent"
            >
              <option value="7d">{t('admin:last_7_days')}</option>
              <option value="30d">{t('admin:last_30_days')}</option>
              <option value="90d">{t('admin:last_90_days')}</option>
              <option value="1y">{t('admin:last_year')}</option>
            </select>
          </div>
          <Button
            onClick={handleExport}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            {t('common:export')}
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, idx) => (
            <div
              key={idx}
              className="flex flex-row justify-between items-center bg-white border border-gray-200 rounded-xl p-6 shadow-sm min-h-[140px] animate-pulse"
            >
              <div className="flex flex-col gap-2 flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
              <div className="w-12 h-12 bg-gray-200 rounded"></div>
            </div>
          ))
        ) : (
          stats.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-row justify-between items-center bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200 min-h-[140px]"
            >
              <div className="flex flex-col gap-2">
                <span className="text-gray-700 font-medium">{stat.label}</span>
                <span className="text-3xl font-bold text-black">
                  {stat.value}
                </span>
              <span className="text-sm text-green-600 font-semibold">
                {stat.change}{" "}
                <span className="text-gray-400 font-normal">
                  {stat.changeText}
                </span>
              </span>
            </div>
            <div className="flex items-center justify-center ml-4">
              {stat.icon}
            </div>
          </div>
        )))}
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {performanceMetrics.map((metric) => (
          <Card
            key={metric.label}
            className="hover:shadow-md transition-shadow"
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{metric.label}</p>
                  <p className="text-2xl font-bold">{metric.value}</p>
                  <p className="text-xs text-green-600 font-medium">
                    {metric.change}
                  </p>
                </div>
                <div className="p-2 bg-gray-50 rounded-lg">{metric.icon}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <UserGrowChart />
        <SubscrptionChart />
      </div>

      {/* Additional Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SubjectPerformanceChart />
        <ExamAttemptsChart />
      </div>

      {/* User Demographics Chart */}
      <div className="grid grid-cols-1 gap-4">
        <UserDemographicsChart />
      </div>

      {/* Subject Performance and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subject Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              {t('admin:subject_performance')}
            </CardTitle>
            <CardDescription>
              {t('admin:avg_scores_attempts_by_subject')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {subjectPerformance.map((subject) => (
                <div
                  key={subject.subject}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">
                      {subject.subject}
                    </h4>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>{t('admin:score')}: {subject.score}%</span>
                      <span>{t('admin:attempts')}: {subject.attempts}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium text-green-600">
                      {subject.growth}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              {t('admin:recent_activity')}
            </CardTitle>
            <CardDescription>{t('admin:latest_platform_activities')}</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : recentActivity.length > 0 ? (
              <div className="space-y-3">
                {recentActivity.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <div className="mt-1">{getActivityIcon(activity.type)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.action}
                      </p>
                      <p className="text-xs text-gray-600">
                        {activity.user} • {formatTimeAgo(activity.time)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">
                Aucune activité récente
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>{t('admin:quick_actions')}</CardTitle>
          <CardDescription>{t('admin:common_admin_tasks')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="flex items-center gap-2 h-auto p-4 flex-col"
            >
              <Users className="w-6 h-6" />
              <span className="text-sm">{t('admin:manage_users')}</span>
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2 h-auto p-4 flex-col"
            >
              <GraduationCap className="w-6 h-6" />
              <span className="text-sm">{t('admin:add_exam')}</span>
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2 h-auto p-4 flex-col"
            >
              <CreditCard className="w-6 h-6" />
              <span className="text-sm">{t('admin:view_subscriptions')}</span>
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2 h-auto p-4 flex-col"
            >
              <BarChart3 className="w-6 h-6" />
              <span className="text-sm">{t('admin:generate_report')}</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsPage;
