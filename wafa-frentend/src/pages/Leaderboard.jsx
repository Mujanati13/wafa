import { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import { Search, Filter, ArrowUp, ArrowDown, Award, Users, TrendingUp, Download, Calendar, Trophy, Zap, MessageSquare, Star, GraduationCap } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PageHeader, StatCard, TableFilters } from "@/components/shared";
import { adminAnalyticsService } from "@/services/adminAnalyticsService";
import { moduleService } from "@/services/moduleService";
import { toast } from "sonner";

const studentYears = [
  { value: "all", label: "student year (all-1-2-3-4-5)" },
  { value: "1", label: "1ère année" },
  { value: "2", label: "2ème année" },
  { value: "3", label: "3ème année" },
  { value: "4", label: "4ème année" },
  { value: "5", label: "5ème année" },
];

// Level calculation based on total points (1 level = 50 points)
const calculateLevel = (totalPoints) => {
  const level = Math.floor(totalPoints / 50);
  if (level >= 200) return { level, name: "Maître Suprême", color: "bg-purple-600" };
  if (level >= 150) return { level, name: "Maître", color: "bg-purple-500" };
  if (level >= 100) return { level, name: "Expert", color: "bg-indigo-500" };
  if (level >= 75) return { level, name: "Avancé", color: "bg-blue-500" };
  if (level >= 50) return { level, name: "Confirmé", color: "bg-cyan-500" };
  if (level >= 30) return { level, name: "Intermédiaire", color: "bg-teal-500" };
  if (level >= 20) return { level, name: "Apprenti", color: "bg-green-500" };
  if (level >= 10) return { level, name: "Initié", color: "bg-lime-500" };
  if (level >= 5) return { level, name: "Novice", color: "bg-yellow-500" };
  if (level >= 1) return { level, name: "Débutant", color: "bg-orange-500" };
  return { level: 0, name: "Nouveau", color: "bg-gray-400" };
};

const Leaderboard = () => {
  const { t } = useTranslation(['dashboard', 'common']);
  const [studentYear, setStudentYear] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [pointType, setPointType] = useState("normal"); // normal, report, explication
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    topPoints: 0,
    avgPoints: 0
  });

  useEffect(() => {
    fetchLeaderboard();
  }, [studentYear]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await adminAnalyticsService.getLeaderboard({
        studentYear: studentYear !== 'all' ? studentYear : undefined,
        limit: 100
      });
      
      // Transform data to include all point types
      const transformedData = (response.data.leaderboard || []).map((user, index) => {
        // Calculate year from semesters if currentYear not set
        let year = user.currentYear;
        if (!year && user.semesters && user.semesters.length > 0) {
          // Extract year number from first semester (S1-S2 = 1, S3-S4 = 2, etc.)
          const firstSem = user.semesters[0];
          const semNum = parseInt(firstSem?.replace('S', '') || '0');
          year = Math.ceil(semNum / 2);
        }
        
        return {
          ...user,
          photoURL: user.photoURL || '',
          normalPoints: user.normalPoints || user.points || 0,
          bluePoints: user.bluePoints || 0,
          greenPoints: user.greenPoints || 0,
          totalPoints: user.totalPoints || ((user.normalPoints || user.points || 0) + (user.bluePoints || 0) + (user.greenPoints || 0)),
          currentYear: year,
          rank: user.rank || (index + 1) // Use provided rank or calculate from index
        };
      });
      
      console.log('Leaderboard API Response:', response.data);
      console.log('First user data:', transformedData[0]); 
      console.log('First user photoURL:', transformedData[0]?.photoURL);
      setLeaderboardData(transformedData);
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

      // Create CSV content with new columns
      const csvData = [
        ['Rang', 'Utilisateur', 'Année', 'Points Normaux', 'Points Bleus', 'Points Verts', 'Niveau'],
        ...filteredData.map(user => {
          const levelInfo = calculateLevel(user.totalPoints);
          return [
            user.rank,
            user.name || user.username,
            user.currentYear || '-',
            user.normalPoints,
            user.bluePoints,
            user.greenPoints,
            `${levelInfo.level} - ${levelInfo.name}`
          ];
        })
      ];

      const csvContent = csvData.map(row => row.join(',')).join('\n');
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `leaderboard_${new Date().toISOString().split('T')[0]}.csv`);
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

  const handleClearFilters = () => {
    setSearchTerm("");
    setStudentYear("all");
    setPointType("normal");
  };

  const activeFilterCount = (searchTerm ? 1 : 0) + (studentYear !== "all" ? 1 : 0) + (pointType !== "normal" ? 1 : 0);

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
        <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
          {/* Point Type Selector */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Type de points:</label>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={pointType === "normal" ? "default" : "outline"}
                onClick={() => setPointType("normal")}
                className={`flex items-center gap-2 ${
                  pointType === "normal" ? "bg-blue-600 hover:bg-blue-700" : "hover:bg-blue-50"
                }`}
              >
                <Star className="w-4 h-4" />
                Points Normaux
              </Button>
              <Button
                variant={pointType === "report" ? "default" : "outline"}
                onClick={() => setPointType("report")}
                className={`flex items-center gap-2 ${
                  pointType === "report" ? "bg-green-600 hover:bg-green-700" : "hover:bg-green-50"
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                Points Report
              </Button>
              <Button
                variant={pointType === "explication" ? "default" : "outline"}
                onClick={() => setPointType("explication")}
                className={`flex items-center gap-2 ${
                  pointType === "explication" ? "bg-yellow-600 hover:bg-yellow-700" : "hover:bg-yellow-50"
                }`}
              >
                <Zap className="w-4 h-4" />
                Points Explication
              </Button>
            </div>
          </div>

          <TableFilters
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Rechercher par nom ou username..."
            showDateFilter={false}
            additionalFilters={[
              {
                key: "studentYear",
                label: "Année d'étude",
                value: studentYear,
                onChange: setStudentYear,
                options: studentYears,
              }
            ]}
            onClearFilters={handleClearFilters}
            activeFilterCount={activeFilterCount}
          />
        </div>

        {/* Leaderboard Table Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px]">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700 w-16">
                    Rang
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 min-w-[300px]">
                    Utilisateur
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 w-20">
                    <div className="flex items-center gap-1">
                      <GraduationCap className="w-4 h-4" />
                      year
                    </div>
                  </th>
                  <th className="text-center py-3 px-4 font-medium text-gray-700">
                    Points
                  </th>
                  <th className="text-center py-3 px-4 font-medium text-gray-700">
                    <div className="flex items-center justify-center gap-1">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      bleu points
                    </div>
                  </th>
                  <th className="text-center py-3 px-4 font-medium text-gray-700">
                    <div className="flex items-center justify-center gap-1">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      vert poits
                    </div>
                  </th>
                  <th className="text-center py-3 px-4 font-medium text-gray-700">
                    level
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="py-4 px-4"><div className="h-4 bg-gray-200 rounded animate-pulse w-8"></div></td>
                      <td className="py-4 px-4"><div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div></td>
                      <td className="py-4 px-4"><div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div></td>
                      <td className="py-4 px-4"><div className="h-4 bg-gray-200 rounded animate-pulse w-12 mx-auto"></div></td>
                      <td className="py-4 px-4"><div className="h-4 bg-gray-200 rounded animate-pulse w-12 mx-auto"></div></td>
                      <td className="py-4 px-4"><div className="h-4 bg-gray-200 rounded animate-pulse w-12 mx-auto"></div></td>
                      <td className="py-4 px-4"><div className="h-4 bg-gray-200 rounded animate-pulse w-20 mx-auto"></div></td>
                    </tr>
                  ))
                ) : filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-gray-500">
                      {t('dashboard:no_data_found')}
                    </td>
                  </tr>
                ) : (
                  filteredData.map((user) => {
                    const levelInfo = calculateLevel(user.totalPoints);
                    return (
                      <tr
                        key={user._id || user.rank}
                        className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                          user.rank === 1 ? "bg-yellow-50" : user.rank === 2 ? "bg-slate-50" : user.rank === 3 ? "bg-orange-50" : ""
                        }`}
                      >
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            {user.rank <= 3 ? (
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                user.rank === 1 ? 'bg-yellow-400' : user.rank === 2 ? 'bg-gray-300' : 'bg-orange-400'
                              }`}>
                                <Trophy className="w-4 h-4 text-white" />
                              </div>
                            ) : (
                              <span className="w-8 h-8 flex items-center justify-center font-bold text-gray-600">
                                {user.rank}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3 min-w-0">
                            <Avatar className="h-10 w-10 flex-shrink-0">
                              <AvatarImage 
                                src={user.photoURL?.startsWith('http') 
                                  ? user.photoURL 
                                  : user.photoURL 
                                    ? `${import.meta.env.VITE_API_URL?.replace('/api/v1', '')}${user.photoURL}` 
                                    : undefined
                                } 
                                alt={user.name || user.username} 
                              />
                              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                                {(user.name || user.username)?.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col min-w-0">
                              <span className="font-semibold text-gray-900 truncate" title={user.name || user.username}>{user.name || user.username}</span>
                              <span className="text-sm text-gray-500 truncate">@{user.username}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-gray-700">
                            {user.currentYear ? `${user.currentYear}eme` : '-'}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className="font-bold text-gray-900">{user.normalPoints}</span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <span className="font-bold text-blue-600">{user.bluePoints}</span>
                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <span className="font-bold text-green-600">{user.greenPoints}</span>
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className="font-bold text-gray-900">{levelInfo.level}</span>
                        </td>
                      </tr>
                    );
                  })
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
