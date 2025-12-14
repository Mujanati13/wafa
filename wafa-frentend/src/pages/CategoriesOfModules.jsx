import { useMemo, useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import { Folders, Search, Filter, Plus, Edit, Trash2, ChevronLeft, ChevronRight, Loader2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PageHeader, StatCard } from "@/components/shared";
import { toast } from "sonner";
import { api } from "@/lib/utils";
import NewCategoryForm from "@/components/admin/NewCategoryForm";

// 3 default categories
const DEFAULT_CATEGORIES = [
  { value: "Exam par years", label: "Exam par years", color: "bg-blue-100 text-blue-700" },
  { value: "Exam par courses", label: "Exam par courses", color: "bg-purple-100 text-purple-700" },
  { value: "Résumé et cours", label: "Résumé et cours", color: "bg-green-100 text-green-700" },
];

const CategoriesOfModules = () => {
  const { t } = useTranslation(['admin', 'common']);
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewCategoryForm, setShowNewCategoryForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterCategory, setFilterCategory] = useState("all");
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchModules();
  }, []);

  const fetchModules = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/modules");
      setModules(data?.data || []);
    } catch (e) {
      toast.error("Erreur lors du chargement des modules");
    } finally {
      setLoading(false);
    }
  };

  const filteredModules = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return modules.filter((m) => {
      const passesCategory = filterCategory === "all" || m.category === filterCategory;
      const passesSearch =
        m.name?.toLowerCase().includes(term) ||
        m.semester?.toLowerCase().includes(term) ||
        m.courseNames?.some(c => c.toLowerCase().includes(term));
      return passesCategory && passesSearch;
    });
  }, [searchTerm, filterCategory, modules]);

  const totalPages = Math.ceil(filteredModules.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentModules = filteredModules.slice(startIndex, endIndex);

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterCategory]);

  // Stats
  const categoryStats = DEFAULT_CATEGORIES.map(cat => ({
    ...cat,
    count: modules.filter(m => m.category === cat.value).length
  }));

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
        {t('common:previous')}
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
        {t('common:next')}
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
          <PageHeader title="Catégories de Modules" description="Gérez les catégories et cours de chaque module" />
          
          <Button onClick={() => setShowNewCategoryForm(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Ajouter un Module
          </Button>
        </div>

        {/* Category Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {categoryStats.map((cat) => (
            <Card key={cat.value} className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{cat.label}</p>
                    <p className="text-2xl font-bold">{cat.count}</p>
                  </div>
                  <Badge className={cat.color}>{cat.label.split(' ')[0]}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Folders className="h-5 w-5" />
              Liste des Modules par Catégorie
            </CardTitle>
            <CardDescription>Modules organisés par les 3 catégories principales</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Rechercher par nom, semestre, cours..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Toutes les catégories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les catégories</SelectItem>
                  {DEFAULT_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Module</TableHead>
                    <TableHead>Semestre</TableHead>
                    <TableHead>Catégorie</TableHead>
                    <TableHead>Noms des Cours</TableHead>
                    <TableHead>Difficulté</TableHead>
                    <TableHead className="text-right">{t('common:actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentModules.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                        Aucun module trouvé
                      </TableCell>
                    </TableRow>
                  ) : (
                    currentModules.map((m) => (
                      <TableRow key={m._id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                              style={{ backgroundColor: m.color || "#6366f1" }}
                            >
                              {m.name?.charAt(0) || "M"}
                            </div>
                            <span className="font-medium">{m.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{m.semester}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={
                            DEFAULT_CATEGORIES.find(c => c.value === m.category)?.color || "bg-gray-100 text-gray-700"
                          }>
                            {m.category || "Exam par years"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {m.courseNames && m.courseNames.length > 0 ? (
                              m.courseNames.slice(0, 3).map((course, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {course}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-muted-foreground text-sm">—</span>
                            )}
                            {m.courseNames && m.courseNames.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{m.courseNames.length - 3}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={
                            m.difficulty === "easy" ? "bg-green-100 text-green-700" :
                            m.difficulty === "hard" ? "bg-red-100 text-red-700" :
                            "bg-amber-100 text-amber-700"
                          }>
                            {m.difficulty === "easy" ? "Facile" :
                             m.difficulty === "hard" ? "Difficile" : "Moyen"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
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
              Affichage {filteredModules.length === 0 ? 0 : startIndex + 1} à {Math.min(endIndex, filteredModules.length)} sur {filteredModules.length} résultats
            </div>
            {renderPagination()}
          </CardFooter>
        </Card>
      </div>

      {showNewCategoryForm && (
        <NewCategoryForm setShowNewCategoryForm={setShowNewCategoryForm} modules={modules} />
      )}
    </div>
  );
};

export default CategoriesOfModules;
