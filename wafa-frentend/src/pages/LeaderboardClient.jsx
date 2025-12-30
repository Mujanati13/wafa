import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Crown, Medal, Trophy, Loader, Zap, Star, TrendingUp, Percent, MoreHorizontal, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { userService } from "@/services/userService";
import { toast } from "sonner";

function getInitials(fullName) {
  if (!fullName) return "?";
  return fullName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getScoreBadgeClasses(score, maxScore) {
  const ratio = score / maxScore;
  if (ratio >= 0.9) return "bg-emerald-100 text-emerald-700 border-emerald-200";
  if (ratio >= 0.75) return "bg-lime-100 text-lime-700 border-lime-200";
  if (ratio >= 0.6) return "bg-yellow-100 text-yellow-800 border-yellow-200";
  if (ratio >= 0.45) return "bg-orange-100 text-orange-700 border-orange-200";
  return "bg-rose-100 text-rose-700 border-rose-200";
}

function getPodiumStyles(rank) {
  if (rank === 1) {
    return {
      wrapper: "bg-gradient-to-b from-yellow-50 to-amber-100 border-amber-200",
      accent: "text-amber-600",
      ring: "ring-amber-300",
      icon: <Crown className="h-5 w-5" />,
    };
  }
  if (rank === 2) {
    return {
      wrapper: "bg-gradient-to-b from-slate-50 to-slate-100 border-slate-200",
      accent: "text-slate-600",
      ring: "ring-slate-300",
      icon: <Medal className="h-5 w-5" />,
    };
  }
  return {
    wrapper: "bg-gradient-to-b from-orange-50 to-amber-100 border-amber-200",
    accent: "text-amber-700",
    ring: "ring-amber-200",
    icon: <Trophy className="h-5 w-5" />,
  };
}

// Calculate user level: 1 level = 50 points
function getUserLevel(points) {
  const level = Math.floor(points / 50);
  if (level >= 200) return { level, name: "Maître Suprême", color: "bg-purple-600" };
  if (level >= 150) return { level, name: "Maître", color: "bg-purple-500" };
  if (level >= 100) return { level, name: "Expert", color: "bg-indigo-500" };
  if (level >= 75) return { level, name: "Avancé", color: "bg-blue-500" };
  if (level >= 50) return { level, name: "Confirmé", color: "bg-cyan-500" };
  if (level >= 30) return { level, name: "Intermédiaire", color: "bg-teal-500" };
  if (level >= 20) return { level, name: "Apprenti", color: "bg-green-500" };
  if (level >= 10) return { level, name: "Novice", color: "bg-lime-500" };
  if (level >= 5) return { level, name: "Débutant", color: "bg-yellow-500" };
  return { level, name: "Nouveau", color: "bg-slate-400" };
}

const LeaderboardClient = () => {
  const { t } = useTranslation();
  const [user, setUser] = useState(null);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [userContext, setUserContext] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("totalPoints"); // totalPoints, bluePoints, greenPoints, level, percentage
  const [totalQuestionsInSystem, setTotalQuestionsInSystem] = useState(0);

  // Fetch user profile on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await userService.getUserProfile();
        setUser(userData);
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    fetchLeaderboard();
  }, [sortBy, user]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await userService.getLeaderboard(20, sortBy, user?._id);
      setLeaderboardData(response.data.leaderboard || []);
      setUserContext(response.data.userContext || null);
      setTotalQuestionsInSystem(response.data.totalQuestionsInSystem || 0);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      toast.error('Erreur', {
        description: 'Impossible de charger le classement.'
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 pb-28 md:pb-8 flex items-center justify-center min-h-screen">
        <Loader className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const sorted = leaderboardData;
  const topThree = sorted.slice(0, 3);
  const maxScore = sorted[0]?.totalPoints || 1;

  // Filter buttons config
  const filterButtons = [
    { key: "totalPoints", label: "Points", icon: <Star className="h-4 w-4" />, color: "yellow" },
    { key: "bluePoints", label: "Points Bleus", icon: <Zap className="h-4 w-4" />, color: "blue" },
    { key: "greenPoints", label: "Points Verts", icon: <Star className="h-4 w-4" />, color: "green" },
    { key: "level", label: "Niveau", icon: <TrendingUp className="h-4 w-4" />, color: "purple" },
    { key: "percentage", label: "Pourcentage", icon: <Percent className="h-4 w-4" />, color: "cyan" },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 pb-28 md:pb-8">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          {t('dashboard:leaderboard')}
        </h1>
        <p className="text-muted-foreground mt-1">
          {t('dashboard:top_10_students_by_points')}
        </p>
      </div>

      {/* Filter Buttons */}
      <div className="mb-6 flex flex-wrap gap-2">
        {filterButtons.map(({ key, label, icon, color }) => (
          <Button
            key={key}
            variant={sortBy === key ? "default" : "outline"}
            size="sm"
            onClick={() => setSortBy(key)}
            className={`flex items-center gap-2 ${
              sortBy === key 
                ? color === "blue" ? "bg-blue-600 hover:bg-blue-700" :
                  color === "green" ? "bg-green-600 hover:bg-green-700" :
                  color === "purple" ? "bg-purple-600 hover:bg-purple-700" :
                  color === "cyan" ? "bg-cyan-600 hover:bg-cyan-700" :
                  "bg-yellow-600 hover:bg-yellow-700"
                : ""
            }`}
          >
            {icon}
            {label}
          </Button>
        ))}
      </div>

      {/* Podium */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {topThree.map((user, index) => {
          const rank = index + 1;
          const styles = getPodiumStyles(rank);
          const badge = getScoreBadgeClasses(user.totalPoints, maxScore);
          const levelInfo = getUserLevel(user.totalPoints);

          return (
            <Card key={user._id || user.odUserId} className={`border ${styles.wrapper}`}>
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <span
                    className={`inline-flex h-8 w-8 items-center justify-center rounded-md border ${styles.ring} bg-white font-semibold`}
                  >
                    #{rank}
                  </span>
                  <span
                    className={`inline-flex items-center gap-2 ${styles.accent}`}
                  >
                    {styles.icon}
                    {rank === 1
                      ? t('dashboard:champion')
                      : rank === 2
                      ? t('dashboard:second')
                      : t('dashboard:third')}
                  </span>
                </CardTitle>
                <span className={`text-xs px-2 py-1 rounded-md border ${badge}`}>
                  {user.totalPoints} pts
                </span>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div
                    className={`h-14 w-14 rounded-full ring-4 ${styles.ring} flex items-center justify-center font-semibold text-lg bg-white`}
                  >
                    {getInitials(user.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold truncate">{user.name}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs">
                      <span className="flex items-center gap-1 text-blue-600">
                        <Zap className="h-3 w-3" /> {user.bluePoints}
                      </span>
                      <span className="flex items-center gap-1 text-green-600">
                        <Star className="h-3 w-3" /> {user.greenPoints}
                      </span>
                      <Badge className={`${levelInfo.color} text-white text-[10px]`}>
                        Nv.{levelInfo.level}
                      </Badge>
                    </div>
                    <div className="mt-2 h-2 w-full rounded-full bg-muted">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-primary to-primary/60"
                        style={{
                          width: `${Math.round((user.totalPoints / maxScore) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Top 20 List */}
      <Card>
        <CardHeader>
          <CardTitle>Top 20</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Table Header */}
          <div className="hidden md:grid md:grid-cols-8 gap-4 pb-3 border-b text-sm font-medium text-muted-foreground">
            <div className="col-span-2">Étudiant</div>
            <div className="text-center">Points</div>
            <div className="text-center">
              <span className="flex items-center justify-center gap-1">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                Bleus
              </span>
            </div>
            <div className="text-center">
              <span className="flex items-center justify-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                Verts
              </span>
            </div>
            <div className="text-center">Niveau</div>
            <div className="text-center">%</div>
            <div className="text-center">Progression</div>
          </div>

          <div className="divide-y">
            {sorted.map((userData, idx) => {
              const rank = userData.rank || idx + 1;
              const badge = getScoreBadgeClasses(userData.totalPoints, maxScore);
              const levelInfo = getUserLevel(userData.totalPoints);
              const isCurrentUser = user && (userData.odUserIdStr === user._id || userData.email === user.email);
              
              return (
                <div
                  key={userData._id || userData.odUserId || idx}
                  className={`flex md:grid md:grid-cols-8 items-center justify-between gap-4 py-3 ${
                    isCurrentUser ? "bg-blue-50 rounded-lg" : ""
                  } ${rank <= 3 ? rank === 1 ? "bg-yellow-50/50" : rank === 2 ? "bg-slate-50/50" : "bg-orange-50/50" : ""}`}
                >
                  {/* User Info */}
                  <div className="flex items-center gap-3 min-w-0 col-span-2">
                    <span
                      className={`inline-flex h-8 w-8 items-center justify-center rounded-md border bg-accent font-semibold ${
                        rank === 1
                          ? "text-amber-700 border-amber-300"
                          : rank === 2
                          ? "text-slate-700 border-slate-300"
                          : rank === 3
                          ? "text-amber-800 border-amber-200"
                          : "text-foreground/70 border-muted"
                      }`}
                    >
                      #{rank}
                    </span>
                    <div
                      className={`h-9 w-9 rounded-full flex items-center justify-center text-sm font-semibold ${
                        rank === 1
                          ? "bg-amber-100 text-amber-800"
                          : rank === 2
                          ? "bg-slate-100 text-slate-700"
                          : rank === 3
                          ? "bg-orange-100 text-orange-800"
                          : "bg-muted text-foreground/80"
                      }`}
                    >
                      {getInitials(userData.name)}
                    </div>
                    <div className="min-w-0">
                      <p className={`font-medium truncate ${isCurrentUser ? "text-blue-700" : ""}`}>
                        {userData.name}
                        {isCurrentUser && <span className="ml-1 text-xs">(vous)</span>}
                      </p>
                    </div>
                  </div>

                  {/* Total Points */}
                  <div className="hidden md:flex justify-center">
                    <span className={`text-xs px-2 py-1 rounded-md border ${badge}`}>
                      {userData.totalPoints} pts
                    </span>
                  </div>

                  {/* Blue Points */}
                  <div className="hidden md:flex items-center justify-center gap-1">
                    <span className="text-sm font-semibold text-blue-600">{userData.bluePoints}</span>
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  </div>

                  {/* Green Points */}
                  <div className="hidden md:flex items-center justify-center gap-1">
                    <span className="text-sm font-semibold text-green-600">{userData.greenPoints}</span>
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  </div>

                  {/* Level */}
                  <div className="hidden md:flex justify-center">
                    <Badge className={`${levelInfo.color} text-white text-xs`}>
                      <TrendingUp className="h-3 w-3 mr-1" />
                      {levelInfo.level}
                    </Badge>
                  </div>

                  {/* Percentage */}
                  <div className="hidden md:flex justify-center">
                    <span className="text-sm font-medium text-cyan-600">
                      {userData.percentageAnswered || 0}%
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="hidden md:block">
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div
                        className="h-2 rounded-full bg-primary/80"
                        style={{
                          width: `${Math.round((userData.totalPoints / maxScore) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Mobile: Show only main stats */}
                  <div className="md:hidden flex items-center gap-2">
                    <Badge className={`${levelInfo.color} text-white text-xs`}>
                      Nv. {levelInfo.level}
                    </Badge>
                    <span className={`text-xs px-2 py-1 rounded-md border ${badge}`}>
                      {userData.totalPoints} pts
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* User Context - Show if user is not in top 20 */}
      {userContext && userContext.userRank > 20 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MoreHorizontal className="h-5 w-5" />
              Votre position
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Dots separator */}
            <div className="flex justify-center py-4">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                <div className="w-2 h-2 rounded-full bg-gray-300"></div>
              </div>
            </div>

            <div className="divide-y">
              {userContext.nearbyUsers.map((userData, idx) => {
                const levelInfo = getUserLevel(userData.totalPoints);
                const badge = getScoreBadgeClasses(userData.totalPoints, maxScore);
                const isCurrentUser = user && (userData.odUserIdStr === user._id || userData.email === user.email);
                
                return (
                  <div
                    key={userData._id || userData.odUserId || idx}
                    className={`flex md:grid md:grid-cols-8 items-center justify-between gap-4 py-3 ${
                      isCurrentUser ? "bg-blue-100 rounded-lg border-2 border-blue-300" : ""
                    }`}
                  >
                    {/* User Info */}
                    <div className="flex items-center gap-3 min-w-0 col-span-2">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-md border bg-accent font-semibold text-foreground/70 border-muted">
                        #{userData.rank}
                      </span>
                      <div className="h-9 w-9 rounded-full flex items-center justify-center text-sm font-semibold bg-muted text-foreground/80">
                        {getInitials(userData.name)}
                      </div>
                      <div className="min-w-0">
                        <p className={`font-medium truncate ${isCurrentUser ? "text-blue-700 font-bold" : ""}`}>
                          {userData.name}
                          {isCurrentUser && <span className="ml-1 text-xs">(vous)</span>}
                        </p>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="hidden md:flex justify-center">
                      <span className={`text-xs px-2 py-1 rounded-md border ${badge}`}>
                        {userData.totalPoints} pts
                      </span>
                    </div>
                    <div className="hidden md:flex items-center justify-center gap-1">
                      <span className="text-sm font-semibold text-blue-600">{userData.bluePoints}</span>
                    </div>
                    <div className="hidden md:flex items-center justify-center gap-1">
                      <span className="text-sm font-semibold text-green-600">{userData.greenPoints}</span>
                    </div>
                    <div className="hidden md:flex justify-center">
                      <Badge className={`${levelInfo.color} text-white text-xs`}>
                        {levelInfo.level}
                      </Badge>
                    </div>
                    <div className="hidden md:flex justify-center">
                      <span className="text-sm font-medium text-cyan-600">
                        {userData.percentageAnswered || 0}%
                      </span>
                    </div>
                    <div className="hidden md:block">
                      <div className="h-2 w-full rounded-full bg-muted">
                        <div
                          className="h-2 rounded-full bg-primary/80"
                          style={{ width: `${Math.round((userData.totalPoints / maxScore) * 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Mobile */}
                    <div className="md:hidden flex items-center gap-2">
                      <Badge className={`${levelInfo.color} text-white text-xs`}>
                        Nv. {levelInfo.level}
                      </Badge>
                      <span className={`text-xs px-2 py-1 rounded-md border ${badge}`}>
                        {userData.totalPoints} pts
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Points System Info */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">Système de points</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>• Réponse correcte: <span className="font-semibold text-green-600">+1 point</span></p>
          <p>• Réponse incorrecte: <span className="font-semibold text-gray-500">+0 point</span></p>
          <p>• Réessayer: <span className="font-semibold text-red-600">-1 point</span></p>
          <p>• Report approuvé: <span className="font-semibold text-green-600">+1 point vert (= 30 pts)</span></p>
          <p>• Explication approuvée: <span className="font-semibold text-blue-600">+1 point bleu (= 40 pts)</span></p>
          <p>• 1 niveau = 50 points</p>
          <p>• Pourcentage = questions répondues / total questions ({totalQuestionsInSystem})</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default LeaderboardClient;
