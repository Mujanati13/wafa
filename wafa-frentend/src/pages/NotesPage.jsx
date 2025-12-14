import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation(['dashboard', 'common']);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNote, setSelectedNote] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [autoSaving, setAutoSaving] = useState(false);
  const [isSavingTitle, setIsSavingTitle] = useState(false);

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
      setNotes(data.data || []);
    } catch (error) {
      console.error("Error fetching notes:", error);
      toast.error(t('dashboard:error_loading_notes'));
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
        toast.success(t('dashboard:note_auto_saved'));
      } catch (error) {
        console.error("Auto-save failed:", error);
        toast.error(t('dashboard:auto_save_failed'));
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
    setEditTitle(note.title || "Sans titre");
  };

  const deleteNote = async (noteId) => {
    if (!confirm(t('dashboard:confirm_delete_note'))) return;
    
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/notes/${noteId}`, {
        withCredentials: true,
      });
      setNotes((prevNotes) => prevNotes.filter((note) => note._id !== noteId));
      if (selectedNote?._id === noteId) {
        setSelectedNote(null);
        setEditContent("");
        setEditTitle("");
      }
      toast.success(t('dashboard:note_deleted_success'));
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error(t('dashboard:note_delete_failed'));
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

  const saveTitle = async () => {
    if (!selectedNote || !editTitle.trim()) return;
    
    try {
      setIsSavingTitle(true);
      await axios.put(
        `${import.meta.env.VITE_API_URL}/notes/${selectedNote._id}`,
        { title: editTitle.trim() },
        { withCredentials: true }
      );
      
      setNotes((prevNotes) =>
        prevNotes.map((note) =>
          note._id === selectedNote._id
            ? { ...note, title: editTitle.trim() }
            : note
        )
      );
      
      setSelectedNote((prev) => ({
        ...prev,
        title: editTitle.trim()
      }));
      
      toast.success("Titre mis à jour");
    } catch (error) {
      console.error("Save title failed:", error);
      toast.error("Échec de la sauvegarde du titre");
    } finally {
      setIsSavingTitle(false);
    }
  };

  const createNewNote = async () => {
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/notes`,
        { 
          title: "Nouvelle note",
          content: t('dashboard:new_note_placeholder') || "Commencez à taper...",
          questionId: null,
          moduleId: null,
          tags: [],
          color: "#fbbf24"
        },
        { withCredentials: true }
      );
      
      const newNote = data.data || data;
      
      setNotes((prevNotes) => [newNote, ...prevNotes]);
      selectNote(newNote);
      toast.success(t('dashboard:new_note_created'));
    } catch (error) {
      console.error("Create note failed:", error.response?.data || error.message);
      toast.error(t('dashboard:note_create_failed'));
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
                <h1 className="text-3xl font-bold text-slate-900">{t('dashboard:my_notes')}</h1>
              </div>
              <p className="text-slate-500">{t('dashboard:organize_manage_notes')}</p>
            </div>
            <Button onClick={createNewNote} className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
              <Plus className="h-4 w-4" />
              {t('dashboard:new_note')}
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-slate-200">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 font-medium">{t('dashboard:total_notes')}</span>
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
                  <span className="text-sm text-slate-600 font-medium">{t('dashboard:pinned')}</span>
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
                  <span className="text-sm text-slate-600 font-medium">{t('dashboard:currently_editing')}</span>
                  <Zap className="h-4 w-4 text-green-500" />
                </div>
                <p className="text-3xl font-bold text-slate-900">{selectedNote ? editContent.length : 0}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Vos Notes - Full Width Section */}
        <Card className="border-slate-200 shadow-lg bg-gradient-to-b from-slate-50 to-white">
          <CardHeader className="pb-4 border-b border-slate-200 bg-white rounded-t-lg">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-bold text-slate-900">{t('dashboard:your_notes')}</CardTitle>
                  <CardDescription className="text-sm text-slate-600 mt-1">{t('dashboard:select_note_to_edit')}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-sm">
                    {filteredNotes.length} {filteredNotes.length === 1 ? 'note' : 'notes'}
                  </Badge>
                  {pinnedNotes.length > 0 && (
                    <Badge variant="outline" className="text-xs gap-1">
                      <Pin className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                      {pinnedNotes.length}
                    </Badge>
                  )}
                </div>
              </div>
              {/* Search - Full Width */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher une note..."
                  className="pl-10 bg-white border-slate-300 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-100 text-base"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="space-y-3 pb-4">
                    <Skeleton className="h-40 w-full rounded-lg" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                ))}
              </div>
            ) : filteredNotes.length === 0 ? (
              <div className="p-12 text-center">
                <div className="space-y-3 inline-block">
                  <div className="flex justify-center">
                    <div className="p-4 bg-slate-100 rounded-full">
                      <FileText className="h-10 w-10 text-slate-400" />
                    </div>
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-slate-600">
                      {searchQuery ? "Aucune note trouvée" : "Aucune note"}
                    </p>
                    <p className="text-sm text-slate-500 mt-2">
                      {searchQuery ? "Essayez avec d'autres mots-clés" : "Créez votre première note"}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Pinned Section */}
                {pinnedNotes.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-200">
                      <Pin className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
                        Épinglées ({pinnedNotes.length})
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {pinnedNotes.map((note) => (
                        <NoteCard
                          key={note._id}
                          note={note}
                          isSelected={selectedNote?._id === note._id}
                          onSelect={() => selectNote(note)}
                          onDelete={() => deleteNote(note._id)}
                          isPinned={true}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Unpinned Notes */}
                <div>
                  {pinnedNotes.length > 0 && (
                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4 pb-3 border-b border-slate-200">
                      Autres ({unpinnedNotes.length})
                    </h3>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {unpinnedNotes.map((note) => (
                      <NoteCard
                        key={note._id}
                        note={note}
                        isSelected={selectedNote?._id === note._id}
                        onSelect={() => selectNote(note)}
                        onDelete={() => deleteNote(note._id)}
                        isPinned={false}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Editor Section - Below Notes */}
        {selectedNote && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <Card className="border-slate-200 shadow-lg flex flex-col bg-white">
                <CardHeader className="border-b border-slate-200 pb-4 bg-gradient-to-r from-slate-50 to-blue-50">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        <div 
                          className="p-2 rounded-lg text-white" 
                          style={{ backgroundColor: selectedNote.color || '#3b82f6' }}
                        >
                          <NotebookPen className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              onBlur={saveTitle}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') saveTitle();
                                if (e.key === 'Escape') setEditTitle(selectedNote.title || "Sans titre");
                              }}
                              className="text-xl font-semibold text-slate-900 bg-transparent border-b-2 border-transparent hover:border-blue-300 focus:border-blue-500 outline-none transition-colors py-1 px-2 flex-1"
                              placeholder="Titre de la note..."
                            />
                            {isSavingTitle && (
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent" />
                            )}
                          </div>
                          <CardDescription className="text-xs text-slate-500 mt-1">
                            {selectedNote.tags?.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {selectedNote.tags.map((tag, idx) => (
                                  <Badge key={idx} variant="secondary" className="text-xs">#{tag}</Badge>
                                ))}
                              </div>
                            )}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(selectedNote.updatedAt).toLocaleDateString("fr-FR")}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(selectedNote.updatedAt).toLocaleTimeString("fr-FR", { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {autoSaving && (
                          <Badge variant="outline" className="gap-1 ml-auto">
                            <div className="animate-spin rounded-full h-2 w-2 border-2 border-green-500 border-t-transparent" />
                            <span className="text-xs">Sauvegarde...</span>
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button
                        variant={selectedNote.isPinned ? "default" : "outline"}
                        size="sm"
                        onClick={() => togglePin(selectedNote._id, selectedNote.isPinned)}
                        className="gap-1"
                        title="Épingler cette note"
                      >
                        <Pin className="h-4 w-4" />
                        <span className="hidden sm:inline">{selectedNote.isPinned ? "Épinglée" : "Épingler"}</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteNote(selectedNote._id)}
                        className="gap-1 text-destructive hover:text-destructive"
                        title="Supprimer cette note"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="hidden sm:inline">Supprimer</span>
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col p-6 gap-4">
                  <Textarea
                    value={editContent}
                    onChange={(e) => handleContentChange(e.target.value)}
                    className="flex-1 resize-none font-mono text-sm bg-white border-slate-200 rounded-lg shadow-sm focus:shadow-md focus:border-blue-400 transition-all"
                    placeholder="Écrivez votre note ici... (sauvegarde automatique en cours)"
                  />
                  <div className="flex items-center justify-between text-xs text-slate-600 border-t border-slate-200 pt-3 px-2">
                    <div className="space-x-4">
                      <span className="font-medium">{editContent.length} caractères</span>
                      <span>{Math.ceil(editContent.split(/\s+/).filter(w => w).length)} mots</span>
                      <span>{Math.ceil(editContent.split(/\s+/).filter(w => w).length / 200)} min de lecture</span>
                    </div>
                    <span className="text-slate-400 text-xs">💾 Auto-sauvegarde toutes les 3s</span>
                  </div>
                </CardContent>
              </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
};

// Note Item Component
const NoteItem = ({ note, isSelected, onSelect, onDelete }) => {
  const charCount = note.content?.length || 0;
  const wordCount = note.content?.split(/\s+/).filter(w => w).length || 0;
  
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
      className={cn(
        "w-full text-left p-4 rounded-lg border transition-all duration-200 group",
        isSelected
          ? "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-300 shadow-md ring-1 ring-blue-200"
          : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-md hover:bg-slate-50"
      )}
    >
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {note.isPinned && (
              <Pin className="h-4 w-4 text-yellow-500 fill-yellow-500 flex-shrink-0" />
            )}
            {note.color && (
              <div 
                className="h-3 w-3 rounded-full flex-shrink-0" 
                style={{ backgroundColor: note.color }}
              />
            )}
            <span className="text-xs text-slate-500 flex-shrink-0 whitespace-nowrap">
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
            className="p-1.5 hover:bg-red-50 rounded text-slate-400 hover:text-destructive transition-colors flex-shrink-0 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100"
            title="Supprimer"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
        <p className="text-sm font-medium text-slate-900 line-clamp-2 leading-tight">
          {note.title || "Sans titre"}
        </p>
        <p className="text-xs text-slate-600 line-clamp-1 leading-tight">
          {note.content?.substring(0, 60) || "Note vide"}
        </p>
        <div className="flex items-center justify-between pt-1">
          <div className="text-xs text-slate-500 space-x-2 flex">
            <span>{charCount} car.</span>
            <span>•</span>
            <span>{wordCount} mots</span>
          </div>
          {note.tags?.length > 0 && (
            <div className="flex gap-1">
              {note.tags.slice(0, 2).map((tag, idx) => (
                <Badge key={idx} variant="secondary" className="text-xs py-0">
                  #{tag.substring(0, 4)}
                </Badge>
              ))}
              {note.tags.length > 2 && (
                <Badge variant="secondary" className="text-xs py-0">
                  +{note.tags.length - 2}
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.button>
  );
};

const NoteCard = ({ note, isSelected, onSelect, onDelete, isPinned }) => {
  const wordCount = note.content?.split(/\s+/).filter(Boolean).length || 0;
  const charCount = note.content?.length || 0;

  return (
    <motion.button
      whileHover={{ y: -4 }}
      onClick={onSelect}
      className={cn(
        "w-full text-left p-4 rounded-lg border-2 transition-all group relative h-48 flex flex-col",
        isSelected 
          ? "border-blue-400 bg-blue-50 shadow-lg" 
          : "border-slate-200 bg-white hover:border-slate-300"
      )}
    >
      {/* Header with Pin */}
      <div className="flex items-start justify-between mb-3 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div 
            className="p-1.5 rounded text-white" 
            style={{ backgroundColor: note.color || '#3b82f6' }}
          >
            <NotebookPen className="h-3 w-3" />
          </div>
          {isPinned && <Pin className="h-4 w-4 text-yellow-500 fill-yellow-500" />}
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>

      {/* Title */}
      <h3 className="font-semibold text-sm text-slate-900 mb-2 line-clamp-2">
        {note.title || "Sans titre"}
      </h3>

      {/* Preview */}
      <p className="text-xs text-slate-600 line-clamp-3 mb-3 flex-1">
        {note.content || "Aucun contenu"}
      </p>

      {/* Footer Stats */}
      <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-3">
        <span className="text-xs">
          {charCount} car • {wordCount} mots
        </span>
        <span className="text-xs text-slate-400">
          {new Date(note.updatedAt).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' })}
        </span>
      </div>
    </motion.button>
  );
};

export default NotesPage;

