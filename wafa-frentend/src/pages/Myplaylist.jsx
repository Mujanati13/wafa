import React, { useState } from 'react';
import { Plus, Search, Play, Pencil, Trash2, ListPlus, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PageHeader } from '@/components/shared';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const Myplaylist = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newPlaylist, setNewPlaylist] = useState({ title: '', description: '' });
  
  const [playlists, setPlaylists] = useState([
    {
      id: 1,
      title: "Biochimie",
      date: "29 déc. 2023",
      questionsCount: 12,
      description: "Questions essentielles de biochimie",
    },
    {
      id: 2,
      title: "Anatomie Cardiaque",
      date: "6 oct. 2023",
      questionsCount: 8,
      description: "Révision anatomie du cœur",
    },
    {
      id: 3,
      title: "Pharmacologie Générale",
      date: "15 nov. 2023",
      questionsCount: 15,
      description: "Concepts de base en pharmacologie",
    },
  ]);

  const filteredPlaylists = playlists.filter(playlist =>
    playlist.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreatePlaylist = () => {
    if (!newPlaylist.title.trim()) {
      toast.error('Le titre est requis');
      return;
    }
    
    const playlist = {
      id: Date.now(),
      title: newPlaylist.title,
      description: newPlaylist.description,
      date: new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }),
      questionsCount: 0,
    };
    
    setPlaylists([playlist, ...playlists]);
    setNewPlaylist({ title: '', description: '' });
    setIsCreateDialogOpen(false);
    toast.success('Playlist créée avec succès!');
  };

  const handleDeletePlaylist = (id) => {
    setPlaylists(playlists.filter(p => p.id !== id));
    toast.success('Playlist supprimée');
  };

  const handlePlayPlaylist = (playlist) => {
    if (playlist.questionsCount === 0) {
      toast.error('Cette playlist est vide');
      return;
    }
    toast.info(`Lancement de la playlist "${playlist.title}"`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Hero Section */}
        <Card className="bg-gradient-to-br from-blue-500 to-teal-500 border-none text-white overflow-hidden">
          <CardContent className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <ListPlus className="h-8 w-8" />
                  <h1 className="text-3xl md:text-4xl font-bold">Mes Playlists</h1>
                </div>
                <p className="text-white/90 text-lg">
                  Organisez vos questions favorites en collections
                </p>
                <Badge variant="secondary" className="bg-white text-blue-700 hover:bg-white/90">
                  {playlists.length} playlist{playlists.length > 1 ? 's' : ''} au total
                </Badge>
              </div>
              
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-white text-blue-700 hover:bg-white/90 gap-2 text-base px-6">
                    <Plus className="h-5 w-5" />
                    Nouvelle playlist
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Créer une nouvelle playlist</DialogTitle>
                    <DialogDescription>
                      Donnez un nom à votre playlist pour organiser vos questions
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Titre *</Label>
                      <Input
                        id="title"
                        placeholder="Ex: Anatomie Générale"
                        value={newPlaylist.title}
                        onChange={(e) => setNewPlaylist({ ...newPlaylist, title: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Description de la playlist (optionnel)"
                        value={newPlaylist.description}
                        onChange={(e) => setNewPlaylist({ ...newPlaylist, description: e.target.value })}
                        rows={3}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Annuler
                    </Button>
                    <Button onClick={handleCreatePlaylist}>
                      Créer
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {/* Search Bar */}
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                placeholder="Rechercher une playlist..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Playlists Grid */}
        {filteredPlaylists.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="h-20 w-20 rounded-full bg-blue-50 flex items-center justify-center">
                  <ListPlus className="h-10 w-10 text-blue-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">
                    {searchQuery ? 'Aucune playlist trouvée' : 'Aucune playlist'}
                  </h3>
                  <p className="text-muted-foreground">
                    {searchQuery 
                      ? 'Essayez avec un autre terme de recherche'
                      : 'Créez votre première playlist pour commencer'
                    }
                  </p>
                </div>
                {!searchQuery && (
                  <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Créer une playlist
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlaylists.map((playlist, index) => (
              <motion.div
                key={playlist.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1 flex-1">
                          <p className="text-xs text-muted-foreground">{playlist.date}</p>
                          <h3 className="text-xl font-semibold">{playlist.title}</h3>
                          {playlist.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {playlist.description}
                            </p>
                          )}
                        </div>
                        <Badge variant={playlist.questionsCount > 0 ? "default" : "secondary"}>
                          {playlist.questionsCount} question{playlist.questionsCount > 1 ? 's' : ''}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          size="icon"
                          onClick={() => handlePlayPlaylist(playlist)}
                          disabled={playlist.questionsCount === 0}
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => toast.info('Modification de la playlist')}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="outline"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDeletePlaylist(playlist.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Help Card */}
        <Card className="bg-blue-50 border-blue-100">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <HelpCircle className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Comment utiliser les playlists?</h3>
                <p className="text-sm text-muted-foreground">
                  Les playlists vous permettent de regrouper vos questions favorites. 
                  Lors d'un examen, vous pouvez ajouter des questions à vos playlists pour les réviser plus tard.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Myplaylist;
