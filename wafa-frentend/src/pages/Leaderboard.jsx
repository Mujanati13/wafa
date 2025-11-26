import { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import { Search, Filter, ArrowUp, ArrowDown, Award, Users, TrendingUp, Download, Calendar, Trophy, Zap, MessageSquare, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader, StatCard } from "@/components/shared";
import { adminAnalyticsService } from "@/services/adminAnalyticsService";
import { moduleService } from "@/services/moduleService";
import { toast } from "sonner";

const years = ["All", "2025", "2024", "2023"];
const studentYears = ["All", "1st", "2nd", "3rd", "4th"];
const periods = ["All", "Monthly", "Weekly", "Daily"];
const pointTypes = [
  { value: "all", label: "Tous les points", icon: Trophy, color: "gray" },
  { value: "normal", label: "Points Normaux", icon: Star, color: "blue" },
  { value: "report", label: "Points Report", icon: MessageSquare, color: "green" },
  { value: "explanation", label: "Points Explication", icon: Zap, color: "yellow" },
];

const Leaderboard = () => {
  const { t } = useTranslation(['dashboard', 'common']);
  const [filter, setFilter] = useState("All");
  const [year, setYear] = useState("All");
  const [studentYear, setStudentYear] = useState("All");
  const [pointType, setPointType] = useState("all");
  const [moduleFilter, setModuleFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [modules, setModules] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    topPoints: 0,
    avgPoints: 0
  });

  useEffect(() => {
    fetchModules();
  }, []);

  useEffect(() => {
    fetchLeaderboard();
  }, [year, studentYear, filter, pointType, moduleFilter]);

  const fetchModules = async () => {
    try {
      const response = await moduleService.getAllmodules();
      setModules(response.data?.data || []);
    } catch (error) {
      console.error('Error fetching modules:', error);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await adminAnalyticsService.getLeaderboard({
        year,
        studentYear,
        period: filter,
        pointType: pointType !== 'all' ? pointType : undefined,
        moduleId: moduleFilter !== 'all' ? moduleFilter : undefined,
        limit: 100
      });
      
      setLeaderboardData(response.data.leaderboard);
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      toast.error('Erreur', {
        description: 'Impossible de charger le classement.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      toast.loading('Génération du rapport...', { id: 'export' });

      // Create CSV content
      const csvData = [
        ['Rang', 'Nom d\'utilisateur', 'Nom', 'Points', 'Type de Points', 'Examens Complétés'],
        ...leaderboardData.map(user => [
          user.rank,
          user.username,
          user.name,
          user.points,
          pointType === 'all' ? 'Tous' : pointType,
          user.totalExams || 0
        ])
      ];

      const csvContent = csvData.map(row => row.join(',')).join('\n');
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `leaderboard_${pointType}_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Rapport exporté', { 
        id: 'export',
        description: 'Le fichier CSV a été téléchargé.'
      });
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Erreur lors de l\'export', { id: 'export' });
    } finally {
      setExporting(false);
    }
  };

  const getPointTypeBadge = (type) => {
    const config = pointTypes.find(p => p.value === type) || pointTypes[0];
    const colorClasses = {
      blue: 'bg-blue-100 text-blue-700',
      green: 'bg-green-100 text-green-700',
      yellow: 'bg-yellow-100 text-yellow-700',
      gray: 'bg-gray-100 text-gray-700',
    };
    return (
      <Badge className={colorClasses[config.color]}>
        <config.icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  // Filter logic (client-side search only)
  const filteredData = leaderboardData.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="w-full space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t('dashboard:leaderboard')}</h1>
            <p className="text-gray-600 mt-1">
              {t('dashboard:view_top_students')}
            </p>
          </div>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="shadow-sm bg-white rounded-lg p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t('dashboard:total_users')}</p>
              <p className="text-2xl font-bold text-gray-900">{loading ? '...' : stats.totalUsers}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="shadow-sm bg-white rounded-lg p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t('dashboard:top_points')}</p>
              <p className="text-2xl font-bold text-gray-900">{loading ? '...' : stats.topPoints}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Award className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="shadow-sm bg-white rounded-lg p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t('dashboard:avg_points')}</p>
              <p className="text-2xl font-bold text-gray-900">{loading ? '...' : stats.avgPoints}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        {/* Search & Filter Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex flex-col gap-4">
            {/* Top Row - Search and Export */}
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="relative flex-1 w-full sm:max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder={t('dashboard:search_by_name')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <Button
                onClick={handleExport}
                variant="outline"
                className="flex items-center gap-2"
                disabled={exporting || loading}
              >
                <Download className={`w-4 h-4 ${exporting ? 'animate-spin' : ''}`} />
                {exporting ? 'Export...' : 'Exporter CSV'}
              </Button>
            </div>

            {/* Point Type Filter - Visual Badges */}
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium text-gray-600 mr-2 self-center">Type de points:</span>
              {pointTypes.map((pt) => {
                const colorClasses = {
                  blue: pointType === pt.value ? 'bg-blue-500 text-white' : 'bg-blue-50 text-blue-700 hover:bg-blue-100',
                  green: pointType === pt.value ? 'bg-green-500 text-white' : 'bg-green-50 text-green-700 hover:bg-green-100',
                  yellow: pointType === pt.value ? 'bg-yellow-500 text-white' : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100',
                  gray: pointType === pt.value ? 'bg-gray-500 text-white' : 'bg-gray-50 text-gray-700 hover:bg-gray-100',
                };
                return (
                  <button
                    key={pt.value}
                    onClick={() => setPointType(pt.value)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${colorClasses[pt.color]}`}
                  >
                    <pt.icon className="w-4 h-4" />
                    {pt.label}
                  </button>
                );
              })}
            </div>

            {/* Filter Row */}
            <div className="flex flex-wrap gap-2">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-3 py-2 rounded-lg border border-gray-300 bg-gray-50 text-sm"
              >
                {periods.map((tab) => (
                  <option key={tab} value={tab}>
                    {tab === 'All' ? 'Toutes périodes' : tab}
                  </option>
                ))}
              </select>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="px-3 py-2 rounded-lg border border-gray-300 bg-gray-50 text-sm"
              >
                <option value="All">{t('dashboard:all_years')}</option>
                {years.filter(y => y !== 'All').map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
              <select
                value={studentYear}
                onChange={(e) => setStudentYear(e.target.value)}
                className="px-3 py-2 rounded-lg border border-gray-300 bg-gray-50 text-sm"
              >
                <option value="All">{t('dashboard:all_student_years')}</option>
                {studentYears.filter(sy => sy !== 'All').map((sy) => (
                  <option key={sy} value={sy}>
                    {sy}
                  </option>
                ))}
              </select>
              <select
                value={moduleFilter}
                onChange={(e) => setModuleFilter(e.target.value)}
                className="px-3 py-2 rounded-lg border border-gray-300 bg-gray-50 text-sm"
              >
                <option value="all">Tous les modules</option>
                {modules.map((mod) => (
                  <option key={mod._id} value={mod._id}>
                    {mod.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Leaderboard Table Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">
                    {t('dashboard:rank')}
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">
                    {t('dashboard:user_name')}
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">
                    {t('dashboard:name')}
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">
                    {t('dashboard:points')}
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">
                    {t('dashboard:exams')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="py-4 px-4"><div className="h-4 bg-gray-200 rounded animate-pulse"></div></td>
                      <td className="py-4 px-4"><div className="h-4 bg-gray-200 rounded animate-pulse"></div></td>
                      <td className="py-4 px-4"><div className="h-4 bg-gray-200 rounded animate-pulse"></div></td>
                      <td className="py-4 px-4"><div className="h-4 bg-gray-200 rounded animate-pulse"></div></td>
                      <td className="py-4 px-4"><div className="h-4 bg-gray-200 rounded animate-pulse"></div></td>
                    </tr>
                  ))
                ) : filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-500">
                      {t('dashboard:no_data_found')}
                    </td>
                  </tr>
                ) : (
                  filteredData.map((user, index) => (
                    <tr
                      key={user._id || index}
                      className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                        user.rank === 1 ? "bg-blue-50" : ""
                      }`}
                    >
                      <td className="py-4 px-4 text-gray-700 font-medium">
                        {user.rank}
                      </td>
                      <td className="py-4 px-4 text-blue-700 font-semibold">
                        {user.username}
                      </td>
                      <td className="py-4 px-4">{user.name}</td>
                      <td className="py-4 px-4 font-bold text-gray-900">
                        {user.points}
                      </td>
                      <td className="py-4 px-4 font-bold text-gray-900">
                        {user.totalExams || 0}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
