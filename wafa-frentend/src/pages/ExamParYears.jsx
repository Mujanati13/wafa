import { useMemo, useState, useEffect } from "react";
import { Calendar, Search, Filter, Plus, Edit, Trash2, Eye, ChevronLeft, ChevronRight, Loader2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/shared";
import { toast } from "sonner";
import NewExamForm from "@/components/admin/NewExamForm";
import { api } from "@/lib/utils";

const ExamParYears = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showAddExamForm, setShowAddExamForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [moduleFilter, setModuleFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    examName: "",
    moduleName: "",
    year: "",
    imageUrl: "",
    helpText: "",
  });

  const placeholderImage = "https://via.placeholder.com/150x100/4F46E5/FFFFFF?text=Exam";

  useEffect(() => {
    fetchExams();
  }, [showCreateForm]);

  const handleAddExam = () => {
    if (!formData.examName || !formData.moduleName || !formData.year) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }
    setShowAddExamForm(false);
    setFormData({
      examName: "",
      moduleName: "",
      year: "",
      imageUrl: "",
      helpText: "",
    });
    toast.success("Examen ajouté avec succès");
  };

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const fetchExams = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await api.get("/exams/all");
      const list = (data?.data || []).map((e) => ({
        id: e?._id,
        moduleName: e?.moduleName || e?.moduleId?.name || "",
        examName: e?.name || "",
        year: String(e?.year ?? ""),
        imageUrl: e?.imageUrl || placeholderImage,
        totalQuestions: Array.isArray(e?.questions) ? e.questions.length : 0,
        helpText: e?.infoText || "",
        status: "active",
      }));
      list.sort((a, b) => b.year.localeCompare(a.year));
      setExams(list);
    } catch (err) {
      console.error("Error fetching exams:", err);
      setError("Échec du chargement des examens");
      toast.error("Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  const filteredExams = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return exams.filter((exam) => {
      const passesModule = moduleFilter === "all" || exam.moduleName === moduleFilter;
      const passesYear = yearFilter === "all" || exam.year === yearFilter;
      const passesSearch =
        exam.examName.toLowerCase().includes(term) ||
        exam.moduleName.toLowerCase().includes(term) ||
        exam.year.includes(term) ||
        String(exam.id).includes(term);
      return passesModule && passesYear && passesSearch;
    });
  }, [searchTerm, moduleFilter, yearFilter, exams]);

  const totalPages = Math.ceil(filteredExams.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentExams = filteredExams.slice(startIndex, endIndex);

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, moduleFilter, yearFilter]);

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    const buttons = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);

    buttons.push(
      <Button key="prev" variant="outline" size="sm" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1} className="gap-1">
        <ChevronLeft className="h-4 w-4" />
        Précédent
      </Button>
    );

    for (let i = start; i <= end; i++) {
      buttons.push(
        <Button key={i} variant={i === currentPage ? "default" : "outline"} size="sm" onClick={() => goToPage(i)} className="min-w-[40px]">
          {i}
        </Button>
      );
    }

    buttons.push(
      <Button key="next" variant="outline" size="sm" onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages} className="gap-1">
        Suivant
        <ChevronRight className="h-4 w-4" />
      </Button>
    );

    return <div className="flex items-center gap-2">{buttons}</div>;
  };

  const uniqueModules = Array.from(new Set(exams.map((e) => e.moduleName)));
  const uniqueYears = Array.from(new Set(exams.map((e) => e.year))).sort((a, b) => b - a);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Chargement des examens...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
    

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Action Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
        >
          <div>
            <h2 className="text-2xl font-bold text-black mb-1">Répertoire des Examens</h2>
            <p className="text-gray-600">Total: <span className="font-semibold text-black">{filteredExams.length}</span> examens</p>
          </div>
          <Button
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
            onClick={() => setShowAddExamForm(true)}
          >
            <Plus className="w-5 h-5 mr-2" />
            Créer Examen
          </Button>
        </motion.div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Répertoire des Examens
            </CardTitle>
            <CardDescription>Rechercher et gérer les examens par années</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input type="text" placeholder="Rechercher par nom, module ou année..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
              </div>
              <Select value={moduleFilter} onValueChange={setModuleFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous les modules" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les modules</SelectItem>
                  {Array.from(new Set(exams.map((e) => e.moduleName))).map((module) => (
                    <SelectItem key={module} value={module}>
                      {module}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={yearFilter} onValueChange={setYearFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Toutes les années" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les années</SelectItem>
                  {Array.from(new Set(exams.map((e) => e.year))).sort((a, b) => b - a).map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {error && <div className="text-sm text-red-600 p-3 bg-red-50 rounded-md">{error}</div>}

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Module</TableHead>
                    <TableHead>Nom de l'Examen</TableHead>
                    <TableHead>Année</TableHead>
                    <TableHead>Image</TableHead>
                    <TableHead>Texte d'aide</TableHead>
                    <TableHead>Questions</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentExams.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                        Aucun examen trouvé
                      </TableCell>
                    </TableRow>
                  ) : (
                    currentExams.map((exam) => (
                      <TableRow key={exam.id}>
                        <TableCell className="font-mono text-sm">{exam.id}</TableCell>
                        <TableCell className="font-medium">{exam.moduleName}</TableCell>
                        <TableCell className="font-medium">{exam.examName}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{exam.year}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="w-16 h-12 rounded-md overflow-hidden bg-slate-100 border">
                            <img src={exam.imageUrl} alt={exam.examName} className="w-full h-full object-cover" />
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs truncate" title={exam.helpText}>
                          {exam.helpText || "—"}
                        </TableCell>
                        <TableCell>{exam.totalQuestions}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="icon" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-green-600 hover:text-green-700 hover:bg-green-50">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700 hover:bg-red-50">
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
              Affichage de {filteredExams.length === 0 ? 0 : startIndex + 1} à {Math.min(endIndex, filteredExams.length)} sur {filteredExams.length} résultats
            </div>
            {renderPagination()}
          </CardFooter>
        </Card>
      </div>

      {showCreateForm && <NewExamForm setShowNewExamForm={setShowCreateForm} modules={uniqueModules} years={uniqueYears} />}

      {/* Add/Edit Exam Dialog */}
      <AnimatePresence>
        {showAddExamForm && (
          <Dialog open={showAddExamForm} onOpenChange={setShowAddExamForm}>
            <DialogContent className="bg-white border-gray-200 text-black sm:max-w-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <DialogHeader>
                  <DialogTitle className="text-black text-xl">Créer un nouvel examen</DialogTitle>
                  <DialogDescription className="text-gray-600">
                    Ajouter un examen avec tous les détails nécessaires
                  </DialogDescription>
                </DialogHeader>

                <form className="space-y-4 py-4" onSubmit={(e) => { e.preventDefault(); handleAddExam(); }}>
                  <div className="space-y-2">
                    <Label className="text-black font-medium">Nom de l'examen *</Label>
                    <Input
                      placeholder="Ex: Examen Final de Biologie"
                      value={formData.examName}
                      onChange={(e) => handleFormChange("examName", e.target.value)}
                      className="bg-gray-50 border-gray-300 text-black placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-black font-medium">Module *</Label>
                    <Select value={formData.moduleName} onValueChange={(value) => handleFormChange("moduleName", value)}>
                      <SelectTrigger className="bg-gray-50 border-gray-300 text-black">
                        <SelectValue placeholder="Sélectionner un module" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-gray-200">
                        {uniqueModules.map((module) => (
                          <SelectItem key={module} value={module} className="text-black">
                            {module}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-black font-medium">Année *</Label>
                    <Select value={formData.year} onValueChange={(value) => handleFormChange("year", value)}>
                      <SelectTrigger className="bg-gray-50 border-gray-300 text-black">
                        <SelectValue placeholder="Sélectionner une année" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-gray-200">
                        {Array.from({ length: 20 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                          <SelectItem key={year} value={String(year)} className="text-black">
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-black font-medium">URL de l'image</Label>
                    <Input
                      placeholder="https://..."
                      value={formData.imageUrl}
                      onChange={(e) => handleFormChange("imageUrl", e.target.value)}
                      className="bg-gray-50 border-gray-300 text-black placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-black font-medium">Texte d'aide (description)</Label>
                    <textarea
                      placeholder="Entrez une description ou des informations supplémentaires..."
                      value={formData.helpText}
                      onChange={(e) => handleFormChange("helpText", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-black placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500 min-h-[80px] resize-none"
                    />
                  </div>

                  <DialogFooter className="gap-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      className="border-gray-300 text-black hover:bg-gray-100 hover:text-black"
                      onClick={() => setShowAddExamForm(false)}
                    >
                      Annuler
                    </Button>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        Créer Examen
                      </Button>
                    </motion.div>
                  </DialogFooter>
                </form>
              </motion.div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ExamParYears;
