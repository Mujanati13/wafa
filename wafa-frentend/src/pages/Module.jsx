import { useMemo, useState, useEffect } from "react";
import { BookOpen, Search, Filter, Plus, Edit, Trash2, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared";
import { toast } from "sonner";
import NewModuleForm from "@/components/admin/NewModuleForm";
import EditModuleForm from "@/components/admin/EditModuleForm";
import { api } from "@/lib/utils";

const Module = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewModuleForm, setShowNewModuleForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [semesterFilter, setSemesterFilter] = useState("all");

  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedModule, setSelectedModule] = useState(null);

  useEffect(() => {
    fetchModules();
  }, [showNewModuleForm, showEditForm]);

  const fetchModules = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await api.get("/modules");

      const placeholderImage =
        "http://www.univ-mosta.dz/medecine/wp-content/uploads/sites/4/2021/12/telechargement-1-1.jpg";
      const list = (data?.data || []).map((m) => ({
        id: m?._id,
        semester: m?.semester || "",
        name: m?.name || "",
        imageUrl: m?.imageUrl || placeholderImage,
        totalQuestions: m.totalQuestions,
        helpText: m?.infoText || "",
      }));
      setModules(list);
    } catch (e) {
      console.error("Error fetching modules:", e);
      setError("Échec du chargement des modules");
      toast.error("Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  const handleEditModule = (module) => {
    setSelectedModule(module);
    setShowEditForm(true);
  };

  const handleModuleUpdated = () => {
    setShowEditForm(false);
    setSelectedModule(null);
  };

  const handleDeleteModule = async (id) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce module ?")) return;

    try {
      await api.delete(`/modules/${id}`);
      toast.success("Module supprimé");
      fetchModules();
    } catch (error) {
      console.error("Error deleting module:", error);
      toast.error("Échec de suppression");
    }
  };

  const filteredModules = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return modules.filter((m) => {
      const passesSemester =
        semesterFilter === "all" || m.semester === semesterFilter;
      const passesSearch =
        m.name.toLowerCase().includes(term) ||
        m.semester.toLowerCase().includes(term) ||
        String(m.id).includes(term);
      return passesSemester && passesSearch;
    });
  }, [searchTerm, semesterFilter, modules]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, semesterFilter]);

  const totalPages = Math.ceil(filteredModules.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentModules = filteredModules.slice(startIndex, endIndex);

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    const buttons = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);

    buttons.push(
      <Button
        key="prev"
        variant="outline"
        size="sm"
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage === 1}
        className="gap-1"
      >
        <ChevronLeft className="h-4 w-4" />
        Précédent
      </Button>
    );

    for (let i = start; i <= end; i++) {
      buttons.push(
        <Button
          key={i}
          variant={i === currentPage ? "default" : "outline"}
          size="sm"
          onClick={() => goToPage(i)}
          className="min-w-[40px]"
        >
          {i}
        </Button>
      );
    }

    buttons.push(
      <Button
        key="next"
        variant="outline"
        size="sm"
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="gap-1"
      >
        Suivant
        <ChevronRight className="h-4 w-4" />
      </Button>
    );

    return <div className="flex items-center gap-2">{buttons}</div>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <PageHeader title="Modules" description="Gérer les modules par semestre" />
          
          <Button onClick={() => setShowNewModuleForm(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Ajouter Module
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Répertoire des Modules
            </CardTitle>
            <CardDescription>Rechercher et gérer les modules</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Rechercher par nom, semestre ou ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={semesterFilter} onValueChange={setSemesterFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous les semestres" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les semestres</SelectItem>
                  {Array.from({ length: 10 }, (_, i) => `S${i + 1}`)
                    .reverse()
                    .map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {error && (
              <div className="text-sm text-red-600 p-3 bg-red-50 rounded-md">
                {error}
              </div>
            )}

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Semestre</TableHead>
                    <TableHead>Module</TableHead>
                    <TableHead>Image</TableHead>
                    <TableHead>Questions</TableHead>
                    <TableHead>Texte d'aide</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentModules.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                        Aucun module trouvé
                      </TableCell>
                    </TableRow>
                  ) : (
                    currentModules.map((m) => (
                      <TableRow key={m.id}>
                        <TableCell className="font-mono text-sm">{m.id}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{m.semester}</Badge>
                        </TableCell>
                        <TableCell className="font-medium">{m.name}</TableCell>
                        <TableCell>
                          <div className="w-12 h-12 rounded-md overflow-hidden bg-slate-100 border">
                            <img
                              src={m.imageUrl}
                              alt={m.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </TableCell>
                        <TableCell>{m.totalQuestions}</TableCell>
                        <TableCell className="max-w-xs truncate" title={m.helpText}>
                          {m.helpText || "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditModule(m)}
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteModule(m.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-4 border-t bg-slate-50/50">
            <div className="text-sm text-muted-foreground">
              Affichage de {filteredModules.length === 0 ? 0 : startIndex + 1} à{" "}
              {Math.min(endIndex, filteredModules.length)} sur {filteredModules.length} résultats
            </div>
            {renderPagination()}
          </CardFooter>
        </Card>
      </div>

      {showNewModuleForm && (
        <NewModuleForm setShowNewModuleForm={setShowNewModuleForm} />
      )}

      {showEditForm && selectedModule && (
        <EditModuleForm
          module={selectedModule}
          setShowEditForm={setShowEditForm}
          onModuleUpdated={handleModuleUpdated}
        />
      )}
    </div>
  );
};

export default Module;
