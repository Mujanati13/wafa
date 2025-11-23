import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Trash2, Search, Pin, NotebookPen, Plus, Calendar, Clock, FileText, Zap } from "lucide-react";
import axios from "axios";
import { debounce } from "lodash";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const NotesPage = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNote, setSelectedNote] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [autoSaving, setAutoSaving] = useState(false);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_API_URL}/notes`,
        { withCredentials: true }
      );
      setNotes(data.notes || []);
    } catch (error) {
      console.error("Error fetching notes:", error);
      toast.error("Erreur lors du chargement des notes");
    } finally {
      setLoading(false);
    }
  };

  const autoSaveNote = useCallback(
    debounce(async (noteId, content) => {
      if (!content.trim()) return;
      setAutoSaving(true);
      try {
        await axios.put(
          `${import.meta.env.VITE_API_URL}/notes/${noteId}`,
          { content },
          { withCredentials: true }
        );
        toast.success("Note sauvegardée automatiquement");
      } catch (error) {
        console.error("Auto-save failed:", error);
        toast.error("Échec de la sauvegarde automatique");
      } finally {
        setTimeout(() => setAutoSaving(false), 500);
      }
    }, 3000),
    []
  );

  const handleContentChange = (content) => {
    setEditContent(content);
    if (selectedNote) {
      autoSaveNote(selectedNote._id, content);
      setNotes((prevNotes) =>
        prevNotes.map((note) =>
          note._id === selectedNote._id
            ? { ...note, content, updatedAt: new Date().toISOString() }
            : note
        )
      );
    }
  };

  const selectNote = (note) => {
    setSelectedNote(note);
    setEditContent(note.content);
  };

  const deleteNote = async (noteId) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette note?")) return;
    
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/notes/${noteId}`, {
        withCredentials: true,
      });
      setNotes((prevNotes) => prevNotes.filter((note) => note._id !== noteId));
      if (selectedNote?._id === noteId) {
        setSelectedNote(null);
        setEditContent("");
      }
      toast.success("Note supprimée avec succès");
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error("Échec de la suppression de la note");
    }
  };

  const togglePin = async (noteId, currentPinned) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/notes/${noteId}`,
        { isPinned: !currentPinned },
        { withCredentials: true }
      );
      setNotes((prevNotes) =>
        prevNotes.map((note) =>
          note._id === noteId ? { ...note, isPinned: !currentPinned } : note
        )
      );
      if (selectedNote?._id === noteId) {
        setSelectedNote((prev) => ({ ...prev, isPinned: !currentPinned }));
      }
      toast.success(
        !currentPinned ? "Note épinglée" : "Note désépinglée"
      );
    } catch (error) {
      console.error("Toggle pin failed:", error);
      toast.error("Échec de l'épinglage");
    }
  };

  const createNewNote = async () => {
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/notes`,
        { content: "Nouvelle note...", questionId: "default" },
        { withCredentials: true }
      );
      setNotes((prevNotes) => [data.note, ...prevNotes]);
      selectNote(data.note);
      toast.success("Nouvelle note créée");
    } catch (error) {
      console.error("Create note failed:", error);
      toast.error("Échec de la création de la note");
    }
  };

  const filteredNotes = notes.filter((note) =>
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pinnedNotes = filteredNotes.filter((note) => note.isPinned);
  const unpinnedNotes = filteredNotes.filter((note) => !note.isPinned);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                  <NotebookPen className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-slate-900">Mes Notes</h1>
              </div>
              <p className="text-slate-500">Organisez et gérez vos notes personnelles</p>
            </div>
            <Button onClick={createNewNote} className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
              <Plus className="h-4 w-4" />
              Nouvelle note
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-slate-200">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 font-medium">Total des notes</span>
                  <NotebookPen className="h-4 w-4 text-blue-600" />
                </div>
                <p className="text-3xl font-bold text-slate-900">{notes.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-slate-200">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 font-medium">Épinglées</span>
                  <Pin className="h-4 w-4 text-yellow-500" />
                </div>
                <p className="text-3xl font-bold text-slate-900">{pinnedNotes.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-slate-200">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 font-medium">En cours d'édition</span>
                  <Zap className="h-4 w-4 text-green-500" />
                </div>
                <p className="text-3xl font-bold text-slate-900">{selectedNote ? editContent.length : 0}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Notes List Sidebar */}
          <div className="lg:col-span-1">
            <Card className="h-fit border-slate-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Vos notes</CardTitle>
                <CardDescription>Sélectionnez une note pour l'éditer</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Rechercher..."
                    className="pl-10 bg-slate-50 border-slate-200"
                  />
                </div>

                {/* Notes List */}
                <ScrollArea className="h-[calc(100vh-32rem)] rounded-lg border border-slate-200">
                  {loading ? (
                    <div className="p-4 space-y-3">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="space-y-2">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-16 w-full" />
                        </div>
                      ))}
                    </div>
                  ) : filteredNotes.length === 0 ? (
                    <div className="p-6 text-center">
                      <FileText className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                      <p className="text-sm text-slate-500 font-medium">
                        {searchQuery ? "Aucune note trouvée" : "Aucune note"}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        {searchQuery ? "Essayez avec d'autres mots-clés" : "Créez votre première note"}
                      </p>
                    </div>
                  ) : (
                    <div className="p-2 space-y-2">
                      {/* Pinned Section */}
                      {pinnedNotes.length > 0 && (
                        <>
                          <div className="px-2 py-2">
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Épinglées</p>
                          </div>
                          {pinnedNotes.map((note) => (
                            <NoteItem
                              key={note._id}
                              note={note}
                              isSelected={selectedNote?._id === note._id}
                              onSelect={() => selectNote(note)}
                              onDelete={() => deleteNote(note._id)}
                            />
                          ))}
                          <Separator className="my-2" />
                        </>
                      )}

                      {/* Unpinned Notes */}
                      <div className="px-2 py-2">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Autres</p>
                      </div>
                      {unpinnedNotes.map((note) => (
                        <NoteItem
                          key={note._id}
                          note={note}
                          isSelected={selectedNote?._id === note._id}
                          onSelect={() => selectNote(note)}
                          onDelete={() => deleteNote(note._id)}
                        />
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Editor Area */}
          <div className="lg:col-span-3">
            {selectedNote ? (
              <Card className="h-[calc(100vh-16rem)] border-slate-200 flex flex-col">
                <CardHeader className="border-b border-slate-200 pb-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <CardTitle className="flex items-center gap-2 text-xl">
                        <div className="p-1.5 bg-blue-100 rounded-lg">
                          <NotebookPen className="h-4 w-4 text-blue-600" />
                        </div>
                        Éditer la note
                      </CardTitle>
                      <CardDescription className="flex flex-wrap items-center gap-3 text-xs pt-1">
                        <span className="flex items-center gap-1 text-slate-500">
                          <Calendar className="h-3 w-3" />
                          {new Date(selectedNote.updatedAt).toLocaleDateString("fr-FR")}
                        </span>
                        <span className="flex items-center gap-1 text-slate-500">
                          <Clock className="h-3 w-3" />
                          {new Date(selectedNote.updatedAt).toLocaleTimeString("fr-FR")}
                        </span>
                        {autoSaving && (
                          <Badge variant="outline" className="gap-1 ml-auto">
                            <div className="animate-spin rounded-full h-2 w-2 border-2 border-green-500 border-t-transparent" />
                            <span className="text-xs">Sauvegarde...</span>
                          </Badge>
                        )}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant={selectedNote.isPinned ? "default" : "outline"}
                        size="sm"
                        onClick={() => togglePin(selectedNote._id, selectedNote.isPinned)}
                        className="gap-2"
                      >
                        <Pin className="h-4 w-4" />
                        {selectedNote.isPinned ? "Épinglée" : "Épingler"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteNote(selectedNote._id)}
                        className="gap-2 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                        Supprimer
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col p-6 gap-4">
                  <Textarea
                    value={editContent}
                    onChange={(e) => handleContentChange(e.target.value)}
                    className="flex-1 resize-none font-mono text-sm bg-slate-50 border-slate-200"
                    placeholder="Écrivez votre note ici..."
                  />
                  <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-200 pt-3">
                    <span>Auto-sauvegarde toutes les 3 secondes</span>
                    <span className="font-medium">{editContent.length} caractères</span>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="h-[calc(100vh-16rem)] border-slate-200 flex items-center justify-center">
                <CardContent className="text-center py-12">
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <div className="p-4 bg-slate-100 rounded-full">
                        <NotebookPen className="h-12 w-12 text-slate-400" />
                      </div>
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-slate-900">Sélectionnez une note</p>
                      <p className="text-sm text-slate-500 mt-1">Choisissez une note dans la liste pour la modifier</p>
                    </div>
                    <Button onClick={createNewNote} className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600">
                      <Plus className="h-4 w-4" />
                      Créer une note
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Note Item Component
const NoteItem = ({ note, isSelected, onSelect, onDelete }) => {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
      className={cn(
        "w-full text-left p-3 rounded-lg border transition-all duration-200",
        isSelected
          ? "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-300 shadow-sm"
          : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm"
      )}
    >
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {note.isPinned && (
              <Pin className="h-3 w-3 text-yellow-500 fill-yellow-500 flex-shrink-0" />
            )}
            <span className="text-xs text-slate-500 flex-shrink-0">
              {new Date(note.updatedAt).toLocaleDateString("fr-FR", {
                month: "short",
                day: "numeric"
              })}
            </span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1 hover:bg-red-50 rounded text-slate-400 hover:text-destructive transition-colors flex-shrink-0"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
        <p className="text-sm text-slate-700 line-clamp-2 leading-tight">
          {note.content || "Note vide"}
        </p>
      </div>
    </motion.button>
  );
};

export default NotesPage;
