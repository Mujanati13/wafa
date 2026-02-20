import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Crown, Medal, Trophy, Loader, Zap, Star, TrendingUp, Percent, MoreHorizontal, Filter, Lock, Award, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent } from "@/components/ui/dropdown-menu";
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

// Helper function to get year from semester (S1-S2 = Year 1, S3-S4 = Year 2, etc.)
function getYearFromSemester(semester) {
  if (!semester) return null;
  const semesterNum = parseInt(semester.replace('S', ''));
  return Math.ceil(semesterNum / 2);
}

// Helper function to get user's current academic year
function getUserAcademicYear(semesters) {
  if (!semesters || semesters.length === 0) return null;
  // Get the highest semester the user is enrolled in to determine their year
  const latestSemester = semesters[semesters.length - 1];
  return getYearFromSemester(latestSemester);
}

const LeaderboardClient = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [userContext, setUserContext] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("totalPoints"); // totalPoints, bluePoints, greenPoints, level, percentage
  const [totalQuestionsInSystem, setTotalQuestionsInSystem] = useState(0);
  const [openDropdownId, setOpenDropdownId] = useState(null);

  // Fetch user profile on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await userService.getUserProfile();
        setUser(userData);
        
        // Check if user has premium access - redirect free users
        const userPlan = userData?.plan || 'Free';
        if (userPlan === 'Free') {
          toast.error('Cette fonctionnalité est réservée aux abonnés Premium', {
            description: 'Mettez à niveau votre plan pour accéder au classement.',
            action: {
              label: 'Voir les plans',
              onClick: () => navigate('/dashboard/subscription')
            },
            duration: 5000,
          });
          navigate('/dashboard/subscription');
          return;
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };
    fetchUser();
  }, [navigate]);

  useEffect(() => {
    fetchLeaderboard();
  }, [sortBy, user]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await userService.getLeaderboard(100, sortBy, user?._id);
      setLeaderboardData(response.data.leaderboard || []);
      setUserContext({ userRank: response.data.userRank });
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
  
  // Get top 20 users (3 in podium + 17 in list)
  const top20 = sorted.slice(0, 20);
  const remainingUsers = sorted.slice(3, 20); // Users from rank 4 to 20
  
  // Check if current user is in top 20
  const currentUserInTop20 = user && top20.some(u => 
    (u.odUserIdStr === user._id || u.email === user.email)
  );
  
  // If current user is not in top 20, find them in the full list
  let currentUserData = null;
  if (user && !currentUserInTop20) {
    currentUserData = sorted.find(u => 
      (u.odUserIdStr === user._id || u.email === user.email)
    );
  }
  
  const maxScore = sorted[0]?.totalPoints || 1;
  
  const userRank = userContext?.userRank || null;

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

      {/* Info Banner */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
        <Award className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-medium text-blue-900">
            Le classement affiche tous les étudiants de toutes les années confondues.
          </p>
        </div>
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
                  <Avatar className="h-14 w-14 ring-4 ring-white">
                    <AvatarImage 
                      src={user.profilePicture?.startsWith('http') 
                        ? user.profilePicture 
                        : user.profilePicture 
                          ? `${import.meta.env.VITE_API_URL?.replace('/api/v1', '')}${user.profilePicture}` 
                          : undefined
                      } 
                      alt={user.name} 
                    />
                    <AvatarFallback className="text-lg font-semibold bg-white">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
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
                    <div className="mt-2 h-2 w-full rounded-full bg-gray-200">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-400"
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

      {/* All Users List */}
      <Card>
        <CardHeader>
          <CardTitle>Classement Complet</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Table Header - Desktop only */}
          <div className="hidden lg:grid lg:grid-cols-8 gap-4 pb-3 border-b text-sm font-medium text-muted-foreground">
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

          <div className="space-y-2 lg:space-y-0 lg:divide-y">
            {remainingUsers.map((userData, idx) => {
              const rank = userData.rank;
              if (!rank) return null;
              
              const badge = getScoreBadgeClasses(userData.totalPoints, maxScore);
              const levelInfo = getUserLevel(userData.totalPoints);
              const isCurrentUser = user && (userData.odUserIdStr === user._id || userData.email === user.email);
              const dropdownId = `user-${userData._id || idx}`;
              const isDropdownOpen = openDropdownId === dropdownId;
              
              return (
                <React.Fragment key={userData._id || userData.odUserId || idx}>
                  <div
                    className={`p-3 lg:p-0 rounded-lg lg:rounded-none lg:py-3 ${
                      isCurrentUser ? "bg-blue-50 border-2 border-blue-300 lg:bg-blue-50/50 lg:border-0" : "bg-white lg:bg-transparent border lg:border-0"
                    } ${rank <= 3 ? rank === 1 ? "lg:bg-yellow-50/50" : rank === 2 ? "lg:bg-slate-50/50" : "lg:bg-orange-50/50" : ""}`}
                  >
                  {/* Mobile Layout */}
                  <div className="flex lg:hidden items-center justify-between gap-2">
                    {/* Left: Rank + Avatar + Name */}
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span
                        className={`inline-flex h-8 w-8 items-center justify-center rounded-md border text-xs bg-accent font-semibold flex-shrink-0 ${
                          rank === 1
                            ? "text-amber-700 border-amber-300 bg-amber-50"
                            : rank === 2
                            ? "text-slate-700 border-slate-300 bg-slate-50"
                            : rank === 3
                            ? "text-amber-800 border-amber-200 bg-orange-50"
                            : "text-foreground/70 border-muted"
                        }`}
                      >
                        #{rank}
                      </span>
                      <Avatar className="h-9 w-9 flex-shrink-0">
                        <AvatarImage 
                          src={userData.profilePicture?.startsWith('http') 
                            ? userData.profilePicture 
                            : userData.profilePicture 
                              ? `${import.meta.env.VITE_API_URL?.replace('/api/v1', '')}${userData.profilePicture}` 
                              : undefined
                          } 
                          alt={userData.name} 
                        />
                        <AvatarFallback delayMs={0} className={`text-sm font-semibold ${
                          rank === 1
                            ? "bg-amber-100 text-amber-800"
                            : rank === 2
                            ? "bg-slate-100 text-slate-700"
                            : rank === 3
                            ? "bg-orange-100 text-orange-800"
                            : "bg-muted text-foreground/80"
                        }`}>
                          {getInitials(userData.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className={`font-medium text-sm truncate ${isCurrentUser ? "text-blue-700 font-bold" : ""}`}>
                          {userData.name}
                          {isCurrentUser && <span className="ml-1 text-xs">(vous)</span>}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`text-xs px-1.5 py-0.5 rounded border ${badge}`}>
                            {userData.totalPoints} pts
                          </span>
                          <Badge className={`${levelInfo.color} text-white text-[10px] px-1.5 py-0`}>
                            Nv.{levelInfo.level}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Right: 3-dot menu */}
                    <div className="relative flex-shrink-0">
                      <button 
                        onClick={() => setOpenDropdownId(isDropdownOpen ? null : dropdownId)}
                        className="p-1.5 hover:bg-gray-100 rounded-md transition"
                      >
                        <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
                      </button>
                      {isDropdownOpen && (
                        <>
                          {/* Backdrop to close dropdown */}
                          <div 
                            className="fixed inset-0 z-10" 
                            onClick={() => setOpenDropdownId(null)}
                          />
                          {/* Dropdown */}
                          <div className="absolute right-0 top-full mt-1 w-52 bg-white border border-gray-200 rounded-lg shadow-xl z-20">
                            <div className="p-3 space-y-2 text-sm">
                              <div className="flex items-center justify-between pb-2 border-b">
                                <span className="text-muted-foreground flex items-center gap-1">
                                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                  Points Bleus
                                </span>
                                <span className="font-semibold text-blue-600">{userData.bluePoints}</span>
                              </div>
                              <div className="flex items-center justify-between pb-2 border-b">
                                <span className="text-muted-foreground flex items-center gap-1">
                                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                  Points Verts
                                </span>
                                <span className="font-semibold text-green-600">{userData.greenPoints}</span>
                              </div>
                              <div className="flex items-center justify-between pb-2 border-b">
                                <span className="text-muted-foreground">Niveau</span>
                                <Badge className={`${levelInfo.color} text-white text-xs`}>
                                  <TrendingUp className="h-3 w-3 mr-1" />
                                  {levelInfo.level}
                                </Badge>
                              </div>
                              <div className="flex items-center justify-between pb-2 border-b">
                                <span className="text-muted-foreground">Pourcentage</span>
                                <span className="font-semibold text-cyan-600">{userData.percentageAnswered || 0}%</span>
                              </div>
                              <div className="pt-1">
                                <div className="text-xs text-muted-foreground mb-1">Progression</div>
                                <div className="h-2 w-full rounded-full bg-gray-200">
                                  <div
                                    className="h-2 rounded-full bg-gradient-to-r from-cyan-500 to-cyan-400"
                                    style={{
                                      width: `${Math.min(userData.percentageAnswered || 0, 100)}%`,
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Desktop Layout */}
                  <div className="hidden lg:grid lg:grid-cols-8 items-center gap-4 min-h-[52px]">
                    {/* Rank and User Info */}
                    <div className="flex items-center gap-3 min-w-0 col-span-2">
                      <span
                        className={`inline-flex h-8 w-8 items-center justify-center rounded-md border text-sm bg-accent font-semibold ${
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
                      <Avatar className="h-9 w-9 flex-shrink-0">
                        <AvatarImage 
                          src={userData.profilePicture?.startsWith('http') 
                            ? userData.profilePicture 
                            : userData.profilePicture 
                              ? `${import.meta.env.VITE_API_URL?.replace('/api/v1', '')}${userData.profilePicture}` 
                              : undefined
                          } 
                          alt={userData.name} 
                        />
                        <AvatarFallback delayMs={0} className={`text-sm font-semibold ${
                          rank === 1
                            ? "bg-amber-100 text-amber-800"
                            : rank === 2
                            ? "bg-slate-100 text-slate-700"
                            : rank === 3
                            ? "bg-orange-100 text-orange-800"
                            : "bg-muted text-foreground/80"
                        }`}>
                          {getInitials(userData.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className={`font-medium truncate ${isCurrentUser ? "text-blue-700" : ""}`}>
                          {userData.name}
                          {isCurrentUser && <span className="ml-1 text-xs">(vous)</span>}
                        </p>
                      </div>
                    </div>

                    {/* Desktop: All stats */}
                    <div className="flex justify-center">
                      <span className={`text-xs px-2 py-1 rounded-md border ${badge}`}>
                        {userData.totalPoints} pts
                      </span>
                    </div>

                    <div className="flex items-center justify-center gap-1">
                      <span className="text-sm font-semibold text-blue-600">{userData.bluePoints}</span>
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    </div>

                    <div className="flex items-center justify-center gap-1">
                      <span className="text-sm font-semibold text-green-600">{userData.greenPoints}</span>
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    </div>

                    <div className="flex justify-center">
                      <Badge className={`${levelInfo.color} text-white text-xs`}>
                        <TrendingUp className="h-3 w-3 mr-1" />
                        {levelInfo.level}
                      </Badge>
                    </div>

                    <div className="flex justify-center">
                      <span className="text-sm font-medium text-cyan-600">
                        {userData.percentageAnswered || 0}%
                      </span>
                    </div>

                    <div className="block">
                      <div className="h-2 w-full rounded-full bg-gray-200">
                        <div
                          className="h-2 rounded-full bg-gradient-to-r from-cyan-500 to-cyan-400"
                          style={{
                            width: `${Math.min(userData.percentageAnswered || 0, 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </React.Fragment>
              );
            })}

            {/* Show current user if they're outside top 20 */}
            {currentUserData && (
              <React.Fragment>
                {/* Separator */}
                <div className="py-4 px-3 text-center">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t-2 border-dashed border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center">
                      <span className="bg-white px-3 text-sm font-medium text-gray-500">
                        Votre Position
                      </span>
                    </div>
                  </div>
                </div>

                {/* Current user card */}
                <div className="p-3 lg:p-0 rounded-lg lg:py-3 bg-blue-50 border-2 border-blue-300">
                  {(() => {
                    const rank = currentUserData.rank;
                    const levelInfo = getUserLevel(currentUserData.totalPoints);
                    const badge =
                      rank === 1
                        ? "bg-amber-50 border-amber-200 text-amber-700"
                        : rank === 2
                        ? "bg-slate-50 border-slate-200 text-slate-600"
                        : rank === 3
                        ? "bg-orange-50 border-orange-200 text-orange-700"
                        : rank <= 10
                        ? "bg-blue-50 border-blue-200 text-blue-700"
                        : "bg-gray-50 border-gray-200 text-gray-600";

                    return (
                      <>
                        {/* Mobile Layout */}
                        <div className="flex lg:hidden items-center justify-between gap-2">
                          {/* Left Side: Rank, Avatar, Name */}
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <span
                              className={`flex-shrink-0 font-bold text-sm px-2 py-1 rounded-md ${
                                rank === 1
                                  ? "bg-amber-100 text-amber-700"
                                  : rank === 2
                                  ? "bg-slate-100 text-slate-600"
                                  : rank === 3
                                  ? "bg-orange-100 text-orange-700"
                                  : "bg-muted text-foreground/70"
                              }`}
                            >
                              #{rank}
                            </span>
                            <Avatar className="h-9 w-9 flex-shrink-0">
                              <AvatarImage
                                src={
                                  currentUserData.profilePicture?.startsWith("http")
                                    ? currentUserData.profilePicture
                                    : currentUserData.profilePicture
                                    ? `${import.meta.env.VITE_API_URL?.replace("/api/v1", "")}${
                                        currentUserData.profilePicture
                                      }`
                                    : undefined
                                }
                                alt={currentUserData.name}
                              />
                              <AvatarFallback
                                delayMs={0}
                                className={`text-sm font-semibold ${
                                  rank === 1
                                    ? "bg-amber-100 text-amber-800"
                                    : rank === 2
                                    ? "bg-slate-100 text-slate-700"
                                    : rank === 3
                                    ? "bg-orange-100 text-orange-800"
                                    : "bg-muted text-foreground/80"
                                }`}
                              >
                                {getInitials(currentUserData.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                              <p className="font-medium truncate text-blue-700">
                                {currentUserData.name}
                                <span className="ml-1 text-xs">(vous)</span>
                              </p>
                            </div>
                          </div>

                          {/* Right Side: Points & Dropdown */}
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className={`text-xs px-2 py-1 rounded-md border ${badge}`}>
                              {currentUserData.totalPoints} pts
                            </span>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <ChevronDown className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-56">
                                <div className="p-2 space-y-2 text-sm">
                                  <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Points bleus:</span>
                                    <div className="flex items-center gap-1">
                                      <span className="font-semibold text-blue-600">
                                        {currentUserData.bluePoints}
                                      </span>
                                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                    </div>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Points verts:</span>
                                    <div className="flex items-center gap-1">
                                      <span className="font-semibold text-green-600">
                                        {currentUserData.greenPoints}
                                      </span>
                                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                    </div>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Niveau:</span>
                                    <Badge className={`${levelInfo.color} text-white text-xs`}>
                                      <TrendingUp className="h-3 w-3 mr-1" />
                                      {levelInfo.level}
                                    </Badge>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Progression:</span>
                                    <span className="font-medium text-cyan-600">
                                      {currentUserData.percentageAnswered || 0}%
                                    </span>
                                  </div>
                                  <div>
                                    <div className="h-2 w-full rounded-full bg-gray-200">
                                      <div
                                        className="h-2 rounded-full bg-gradient-to-r from-cyan-500 to-cyan-400"
                                        style={{
                                          width: `${Math.min(
                                            currentUserData.percentageAnswered || 0,
                                            100
                                          )}%`,
                                        }}
                                      />
                                    </div>
                                  </div>
                                </div>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>

                        {/* Desktop Layout */}
                        <div className="hidden lg:grid lg:grid-cols-8 items-center gap-4 min-h-[52px]">
                          {/* Rank + Avatar + Name */}
                          <div className="col-span-2 flex items-center gap-3">
                            <span
                              className={`flex-shrink-0 font-bold text-sm px-2.5 py-1 rounded-md ${
                                rank === 1
                                  ? "bg-amber-100 text-amber-700"
                                  : rank === 2
                                  ? "bg-slate-100 text-slate-600"
                                  : rank === 3
                                  ? "bg-orange-100 text-orange-700"
                                  : "bg-muted text-foreground/70"
                              }`}
                            >
                              #{rank}
                            </span>
                            <Avatar className="h-9 w-9 flex-shrink-0">
                              <AvatarImage
                                src={
                                  currentUserData.profilePicture?.startsWith("http")
                                    ? currentUserData.profilePicture
                                    : currentUserData.profilePicture
                                    ? `${import.meta.env.VITE_API_URL?.replace("/api/v1", "")}${
                                        currentUserData.profilePicture
                                      }`
                                    : undefined
                                }
                                alt={currentUserData.name}
                              />
                              <AvatarFallback
                                delayMs={0}
                                className={`text-sm font-semibold ${
                                  rank === 1
                                    ? "bg-amber-100 text-amber-800"
                                    : rank === 2
                                    ? "bg-slate-100 text-slate-700"
                                    : rank === 3
                                    ? "bg-orange-100 text-orange-800"
                                    : "bg-muted text-foreground/80"
                                }`}
                              >
                                {getInitials(currentUserData.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="font-medium truncate text-blue-700">
                                {currentUserData.name}
                                <span className="ml-1 text-xs">(vous)</span>
                              </p>
                            </div>
                          </div>

                          {/* Desktop: All stats */}
                          <div className="flex justify-center">
                            <span className={`text-xs px-2 py-1 rounded-md border ${badge}`}>
                              {currentUserData.totalPoints} pts
                            </span>
                          </div>

                          <div className="flex items-center justify-center gap-1">
                            <span className="text-sm font-semibold text-blue-600">
                              {currentUserData.bluePoints}
                            </span>
                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                          </div>

                          <div className="flex items-center justify-center gap-1">
                            <span className="text-sm font-semibold text-green-600">
                              {currentUserData.greenPoints}
                            </span>
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          </div>

                          <div className="flex justify-center">
                            <Badge className={`${levelInfo.color} text-white text-xs`}>
                              <TrendingUp className="h-3 w-3 mr-1" />
                              {levelInfo.level}
                            </Badge>
                          </div>

                          <div className="flex justify-center">
                            <span className="text-sm font-medium text-cyan-600">
                              {currentUserData.percentageAnswered || 0}%
                            </span>
                          </div>

                          <div className="block">
                            <div className="h-2 w-full rounded-full bg-gray-200">
                              <div
                                className="h-2 rounded-full bg-gradient-to-r from-cyan-500 to-cyan-400"
                                style={{
                                  width: `${Math.min(currentUserData.percentageAnswered || 0, 100)}%`,
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </React.Fragment>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Points System Info */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">Système de points</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>• Réponse correcte: <span className="font-semibold text-green-600">+1 point</span></p>
          <p>• Réponse incorrecte: <span className="font-semibold text-gray-500">+0 point</span></p>
          <p>• Réessayer: <span className="font-semibold text-gray-500">0 point</span></p>
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
