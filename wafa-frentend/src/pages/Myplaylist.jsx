import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Search, Play, Pencil, Trash2 } from "lucide-react";

const playlists = [
  {
    id: 1,
    title: "Biochimie",
    date: "29 déc. 2023",
    questionsCount: 1,
  },
  {
    id: 2,
    title: "Me",
    date: "6 oct. 2023",
    questionsCount: 1,
  },
];

const StatPill = ({ children }) => (
  <span className="text-xs px-3 py-1 rounded-full bg-blue-600 text-white">
    {children}
  </span>
);

const IconButton = ({ children }) => (
  <div className="h-10 w-10 rounded-xl bg-blue-900/10 dark:bg-white/5 flex items-center justify-center">
    {children}
  </div>
);

const Myplaylist = () => {
  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="rounded-2xl p-6 md:p-8 bg-gradient-to-br from-blue-500 to-teal-500 text-white flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold">Mes Playlists</h1>
          <p className="text-white/90">
            Organisez vos questions favorites en collections
          </p>
          <StatPill>{playlists.length} playlists au total</StatPill>
        </div>
        <Button className="bg-white text-blue-700 hover:bg-white/90 rounded-full px-5 py-6 h-auto text-base">
          <Plus className="mr-2" /> Nouvelle playlist
        </Button>
      </div>

      {/* Search */}
      <div className="rounded-2xl bg-secondary/50 dark:bg-secondary/20 p-4">
        <div className="flex items-center gap-3 rounded-2xl bg-background/40 dark:bg-background/20 border px-4 py-4">
          <Search className="text-blue-600" />
          <input
            type="text"
            placeholder="Rechercher une playlist..."
            className="flex-1 bg-transparent outline-none text-sm"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {playlists.map((p) => (
          <Card
            key={p.id}
            className="bg-secondary/40 dark:bg-secondary/10 border-none"
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">{p.date}</p>
                  <h3 className="text-xl font-semibold">{p.title}</h3>
                </div>
                <StatPill>{p.questionsCount} question</StatPill>
              </div>
              <div className="mt-6 flex items-center gap-3">
                <IconButton>
                  <Play className="text-blue-600" />
                </IconButton>
                <IconButton>
                  <Pencil className="text-amber-400" />
                </IconButton>
                <IconButton>
                  <Trash2 className="text-rose-500" />
                </IconButton>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Myplaylist;
