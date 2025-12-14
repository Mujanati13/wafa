import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Crown, Medal, Trophy, Loader, Zap, Star, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { userService } from "@/services/userService";
import { toast } from "sonner";

function getInitials(fullName) {
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

// Calculate user level based on total points
function getUserLevel(points) {
  if (points >= 10000) return { level: 10, name: "Maître", color: "bg-purple-500" };
  if (points >= 7500) return { level: 9, name: "Expert", color: "bg-indigo-500" };
  if (points >= 5000) return { level: 8, name: "Avancé", color: "bg-blue-500" };
  if (points >= 3500) return { level: 7, name: "Confirmé", color: "bg-cyan-500" };
  if (points >= 2500) return { level: 6, name: "Intermédiaire+", color: "bg-teal-500" };
  if (points >= 1500) return { level: 5, name: "Intermédiaire", color: "bg-green-500" };
  if (points >= 1000) return { level: 4, name: "Apprenti+", color: "bg-lime-500" };
  if (points >= 500) return { level: 3, name: "Apprenti", color: "bg-yellow-500" };
  if (points >= 200) return { level: 2, name: "Débutant+", color: "bg-orange-500" };
  return { level: 1, name: "Débutant", color: "bg-slate-400" };
}

const LeaderboardClient = () => {
  const { t } = useTranslation();
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await userService.getLeaderboard(20);
      setLeaderboardData(response.data.leaderboard || []);
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
  const topTen = sorted.slice(0, 10);
  const maxScore = sorted[0]?.points || 1;

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

      {/* Podium */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {topThree.map((user, index) => {
          const rank = index + 1;
          const styles = getPodiumStyles(rank);
          const badge = getScoreBadgeClasses(user.points, maxScore);

          return (
            <Card key={user._id || user.userId} className={`border ${styles.wrapper}`}>
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
                <span
                  className={`text-xs px-2 py-1 rounded-md border ${badge}`}
                >
                  {user.points} {t('dashboard:pts')}
                </span>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div
                    className={`h-14 w-14 rounded-full ring-4 ${styles.ring} flex items-center justify-center font-semibold text-lg bg-white`}
                  >
                    {getInitials(user.name)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold truncate">{user.name}</p>
                    <div className="mt-2 h-2 w-full rounded-full bg-muted">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-primary to-primary/60"
                        style={{
                          width: `${Math.round(
                            (user.points / maxScore) * 100
                          )}%`,
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

      {/* Top 10 List */}
      <Card>
        <CardHeader>
          <CardTitle>{t('dashboard:top_10')}</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Table Header */}
          <div className="hidden md:grid md:grid-cols-7 gap-4 pb-3 border-b text-sm font-medium text-muted-foreground">
            <div className="col-span-2">Étudiant</div>
            <div className="text-center">Points Bleus</div>
            <div className="text-center">Points Verts</div>
            <div className="text-center">Total</div>
            <div className="text-center">Niveau</div>
            <div className="text-center">Progression</div>
          </div>

          <div className="divide-y">
            {topTen.map((user, idx) => {
              const rank = idx + 1;
              const badge = getScoreBadgeClasses(user.points, maxScore);
              const levelInfo = getUserLevel(user.points);
              // Calculate blue/green points (mock calculation based on total)
              const bluePoints = user.bluePoints || Math.floor(user.points * 0.6);
              const greenPoints = user.greenPoints || Math.floor(user.points * 0.4);
              
              return (
                <div
                  key={user._id || user.userId}
                  className="flex md:grid md:grid-cols-7 items-center justify-between gap-4 py-3"
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
                      {getInitials(user.name)}
                    </div>
                    <p className="font-medium truncate">{user.name}</p>
                  </div>

                  {/* Blue Points */}
                  <div className="hidden md:flex items-center justify-center gap-1">
                    <Zap className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-semibold text-blue-600">{bluePoints}</span>
                  </div>

                  {/* Green Points */}
                  <div className="hidden md:flex items-center justify-center gap-1">
                    <Star className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-semibold text-green-600">{greenPoints}</span>
                  </div>

                  {/* Total Points */}
                  <div className="hidden md:flex justify-center">
                    <span className={`text-xs px-2 py-1 rounded-md border ${badge}`}>
                      {user.points} pts
                    </span>
                  </div>

                  {/* Level */}
                  <div className="hidden md:flex justify-center">
                    <Badge className={`${levelInfo.color} text-white text-xs`}>
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Nv. {levelInfo.level}
                    </Badge>
                  </div>

                  {/* Progress Bar */}
                  <div className="hidden md:block">
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div
                        className="h-2 rounded-full bg-primary/80"
                        style={{
                          width: `${Math.round((user.points / maxScore) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Mobile: Show only total points */}
                  <div className="md:hidden flex items-center gap-2">
                    <Badge className={`${levelInfo.color} text-white text-xs`}>
                      Nv. {levelInfo.level}
                    </Badge>
                    <span className={`text-xs px-2 py-1 rounded-md border ${badge}`}>
                      {user.points} pts
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LeaderboardClient;
