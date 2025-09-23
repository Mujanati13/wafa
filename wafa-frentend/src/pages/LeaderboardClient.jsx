import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Crown, Medal, Trophy } from "lucide-react";

const mockUsers = [
  { id: 1, name: "Amina Ben", points: 982 },
  { id: 2, name: "Youssef Ali", points: 945 },
  { id: 3, name: "Sara Mou", points: 910 },
  { id: 4, name: "Khalid Z.", points: 880 },
  { id: 5, name: "Imane R.", points: 842 },
  { id: 6, name: "Rachid T.", points: 821 },
  { id: 7, name: "Laila C.", points: 799 },
  { id: 8, name: "Omar H.", points: 772 },
  { id: 9, name: "Nadia F.", points: 740 },
  { id: 10, name: "Mehdi P.", points: 705 },
];

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
      icon: Crown,
    };
  }
  if (rank === 2) {
    return {
      wrapper: "bg-gradient-to-b from-slate-50 to-slate-100 border-slate-200",
      accent: "text-slate-600",
      ring: "ring-slate-300",
      icon: Medal,
    };
  }
  return {
    wrapper: "bg-gradient-to-b from-orange-50 to-amber-100 border-amber-200",
    accent: "text-amber-700",
    ring: "ring-amber-200",
    icon: Trophy,
  };
}

const LeaderboardClient = () => {
  const sorted = [...mockUsers].sort((a, b) => b.points - a.points);
  const topThree = sorted.slice(0, 3);
  const topTen = sorted.slice(0, 10);
  const maxScore = sorted[0]?.points || 1;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Classement
        </h1>
        <p className="text-muted-foreground mt-1">
          Top 10 des étudiants par points
        </p>
      </div>

      {/* Podium */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {topThree.map((user, index) => {
          const rank = index + 1;
          const styles = getPodiumStyles(rank);
          const Icon = styles.icon;
          const badge = getScoreBadgeClasses(user.points, maxScore);

          return (
            <Card key={user.id} className={`border ${styles.wrapper}`}>
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
                    <Icon className="h-5 w-5" />
                    {rank === 1
                      ? "Champion"
                      : rank === 2
                      ? "Deuxième"
                      : "Troisième"}
                  </span>
                </CardTitle>
                <span
                  className={`text-xs px-2 py-1 rounded-md border ${badge}`}
                >
                  {user.points} pts
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
          <CardTitle>Top 10</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="divide-y">
            {topTen.map((user, idx) => {
              const rank = idx + 1;
              const badge = getScoreBadgeClasses(user.points, maxScore);
              return (
                <div
                  key={user.id}
                  className="flex items-center justify-between py-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
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
                    <div className="min-w-0">
                      <p className="font-medium truncate">{user.name}</p>
                      <div className="mt-1 h-1.5 w-48 max-w-[45vw] rounded-full bg-muted">
                        <div
                          className="h-1.5 rounded-full bg-primary/80"
                          style={{
                            width: `${Math.round(
                              (user.points / maxScore) * 100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-md border ${badge}`}
                  >
                    {user.points} pts
                  </span>
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
