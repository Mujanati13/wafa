import { useMemo, useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import { GraduationCap, Search, Filter, Plus, Edit, Trash2, Eye, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
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
import NewExamCourseForm from "@/components/admin/NewExamCourseForm";
import { api } from "@/lib/utils";
import { toast } from "sonner";

const ExamCourses = () => {
  const { t } = useTranslation(['admin', 'common']);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showAddCourseForm, setShowAddCourseForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [moduleFilter, setModuleFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [formData, setFormData] = useState({
    courseName: "",
    moduleName: "",
    category: "",
    imageUrl: "",
    helpText: "",
  });

  const [examCourses, setExamCourses] = useState([]);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const placeholderImage = "https://via.placeholder.com/150x100/4F46E5/FFFFFF?text=Course";

  useEffect(() => {
    fetchCourses();
    fetchModules();
  }, []);

  const fetchModules = async () => {
    try {
      const { data } = await api.get("/modules");
      setModules(data?.data || []);
    } catch (err) {
      console.error("Error fetching modules:", err);
    }
  };

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await api.get("/exam-courses");
      const list = (data?.data || []).map((c) => ({
        id: c._id,
        moduleName: c.moduleName || c.moduleId?.name || "",
        moduleId: c.moduleId?._id || c.moduleId || "",
        category: c.category || "",
        courseName: c.name || "",
        imageUrl: c.imageUrl || placeholderImage,
        helpText: c.helpText || "",
        totalQuestions: c.totalQuestions || 0,
        status: c.status || "active",
      }));
      setExamCourses(list);
    } catch (err) {
      console.error("Error fetching courses:", err);
      setError("Erreur lors du chargement des cours");
      toast.error("Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return examCourses.filter((course) => {
      const passesModule = moduleFilter === "all" || course.moduleName === moduleFilter;
      const passesCategory = categoryFilter === "all" || course.category === categoryFilter;
      const passesSearch =
        course.courseName.toLowerCase().includes(term) ||
        course.moduleName.toLowerCase().includes(term) ||
        course.category.toLowerCase().includes(term) ||
        String(course.id).includes(term);
      return passesModule && passesCategory && passesSearch;
    });
  }, [searchTerm, moduleFilter, categoryFilter, examCourses]);

  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCourses = filteredCourses.slice(startIndex, endIndex);

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, moduleFilter, categoryFilter]);

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
        {t('common:previous')}
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
        {t('common:next')}
        <ChevronRight className="h-4 w-4" />
      </Button>
    );

    return <div className="flex items-center gap-2">{buttons}</div>;
  };

  const uniqueModules = Array.from(new Set(examCourses.map((c) => c.moduleName))).filter(Boolean);
  const uniqueCategories = Array.from(new Set(examCourses.map((c) => c.category))).filter(Boolean);
  const CATEGORIES = ["Théorique", "Pratique", "Clinique", "Laboratoire", "Recherche", "Évaluation"];

  const handleAddCourse = async () => {
    if (!formData.courseName || !formData.moduleName || !formData.category) {
      toast.error(t('admin:fill_required_fields'));
      return;
    }

    try {
      // Find module ID from name
      const selectedModule = modules.find(m => m.name === formData.moduleName);
      if (!selectedModule) {
        toast.error("Module non trouvé");
        return;
      }

      await api.post("/exam-courses", {
        name: formData.courseName,
        moduleId: selectedModule._id,
        category: formData.category,
        imageUrl: formData.imageUrl || "",
        helpText: formData.helpText || "",
      });

      setShowAddCourseForm(false);
      setFormData({
        courseName: "",
        moduleName: "",
        category: "",
        imageUrl: "",
        helpText: "",
      });
      toast.success(t('admin:course_added_success'));
      fetchCourses();
    } catch (err) {
      console.error("Error creating course:", err);
      toast.error("Erreur lors de la création du cours");
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce cours ?")) return;

    try {
      await api.delete(`/exam-courses/${courseId}`);
      toast.success("Cours supprimé avec succès");
      fetchCourses();
    } catch (err) {
      console.error("Error deleting course:", err);
      toast.error("Erreur lors de la suppression");
    }
  };

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
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
            <h2 className="text-2xl font-bold text-black mb-1">{t('admin:course_directory')}</h2>
            <p className="text-gray-600">{t('admin:total')}: <span className="font-semibold text-black">{filteredCourses.length}</span> {t('admin:courses')}</p>
          </div>
          <Button
            size="lg"
            className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg"
            onClick={() => setShowAddCourseForm(true)}
          >
            <Plus className="w-5 h-5 mr-2" />
            {t('admin:create_course')}
          </Button>
        </motion.div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              {t('admin:course_directory')}
            </CardTitle>
            <CardDescription>{t('admin:search_manage_exam_courses')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input type="text" placeholder={t('admin:search_by_name_module_category')} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
              </div>
              <Select value={moduleFilter} onValueChange={setModuleFilter}>
                <SelectTrigger>
                  <SelectValue placeholder={t('admin:all_modules')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('admin:all_modules')}</SelectItem>
                  {uniqueModules.map((module) => (
                    <SelectItem key={module} value={module}>
                      {module}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Toutes les catégories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les catégories</SelectItem>
                  {uniqueCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Module</TableHead>
                    <TableHead>Catégorie</TableHead>
                    <TableHead>Nom du Cours</TableHead>
                    <TableHead>Image</TableHead>
                    <TableHead>Aide</TableHead>
                    <TableHead>Questions</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentCourses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                        Aucun cours trouvé
                      </TableCell>
                    </TableRow>
                  ) : (
                    currentCourses.map((course) => (
                      <TableRow key={course.id}>
                        <TableCell className="font-mono text-sm">{course.id}</TableCell>
                        <TableCell className="font-medium">{course.moduleName}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{course.category}</Badge>
                        </TableCell>
                        <TableCell className="font-medium">{course.courseName}</TableCell>
                        <TableCell>
                          <div className="w-16 h-12 rounded-md overflow-hidden bg-slate-100 border">
                            <img src={course.imageUrl} alt={course.courseName} className="w-full h-full object-cover" />
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs truncate" title={course.helpText}>
                          {course.helpText}
                        </TableCell>
                        <TableCell>{course.totalQuestions}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="icon" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-green-600 hover:text-green-700 hover:bg-green-50">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleDeleteCourse(course.id)}
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
              Affichage de {filteredCourses.length === 0 ? 0 : startIndex + 1} à {Math.min(endIndex, filteredCourses.length)} sur {filteredCourses.length} résultats
            </div>
            {renderPagination()}
          </CardFooter>
        </Card>
      </div>

      {showCreateForm && <NewExamCourseForm setShowNewExamCourseForm={setShowCreateForm} modules={uniqueModules} categories={uniqueCategories} />}

      {/* Add/Edit Course Dialog */}
      <AnimatePresence>
        {showAddCourseForm && (
          <Dialog open={showAddCourseForm} onOpenChange={setShowAddCourseForm}>
            <DialogContent className="bg-white border-gray-200 text-black sm:max-w-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <DialogHeader>
                  <DialogTitle className="text-black text-xl">Créer un nouveau cours</DialogTitle>
                  <DialogDescription className="text-gray-600">
                    Ajouter un cours avec tous les détails nécessaires
                  </DialogDescription>
                </DialogHeader>

                <form className="space-y-4 py-4" onSubmit={(e) => { e.preventDefault(); handleAddCourse(); }}>
                  <div className="space-y-2">
                    <Label className="text-black font-medium">Nom du cours *</Label>
                    <Input
                      placeholder="Ex: Système Cardiovasculaire - Anatomie 1"
                      value={formData.courseName}
                      onChange={(e) => handleFormChange("courseName", e.target.value)}
                      className="bg-gray-50 border-gray-300 text-black placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500"
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
                    <Label className="text-black font-medium">Catégorie *</Label>
                    <Select value={formData.category} onValueChange={(value) => handleFormChange("category", value)}>
                      <SelectTrigger className="bg-gray-50 border-gray-300 text-black">
                        <SelectValue placeholder="Sélectionner une catégorie" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-gray-200">
                        {uniqueCategories.map((category) => (
                          <SelectItem key={category} value={category} className="text-black">
                            {category}
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
                      className="bg-gray-50 border-gray-300 text-black placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-black font-medium">Texte d'aide (description)</Label>
                    <textarea
                      placeholder="Entrez une description ou des informations supplémentaires..."
                      value={formData.helpText}
                      onChange={(e) => handleFormChange("helpText", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-black placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500 min-h-[80px] resize-none"
                    />
                  </div>

                  <DialogFooter className="gap-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      className="border-gray-300 text-black hover:bg-gray-100 hover:text-black"
                      onClick={() => setShowAddCourseForm(false)}
                    >
                      Annuler
                    </Button>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        type="submit"
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                      >
                        Créer Cours
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

export default ExamCourses;
