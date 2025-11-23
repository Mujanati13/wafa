import { useMemo, useState, useEffect } from "react";
import { Folders, Search, Filter, Plus, Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/shared";
import { toast } from "sonner";
import NewCategoryForm from "@/components/admin/NewCategoryForm";

const CategoriesOfModules = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewCategoryForm, setShowNewCategoryForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterModule, setFilterModule] = useState("all");
  const itemsPerPage = 8;

  const categories = useMemo(() => {
    const placeholderImage = "https://via.placeholder.com/150x150?text=Category";
    const modules = [
      { id: 1, name: "Anatomie 1" },
      { id: 2, name: "Biophysique" },
      { id: 3, name: "Embryologie" },
      { id: 4, name: "Histologie" },
      { id: 5, name: "Physiologie 1" },
      { id: 6, name: "Biochimie 1" },
      { id: 7, name: "Biostatistiques 1" },
      { id: 8, name: "Génétique" },
    ];

    const categoryTypes = [
      "Exam par years",
      "Exam par courses",
      "Exam TP",
      "Exam QCM",
      "Exam théorique",
      "Exam pratique",
      "Contrôle continu",
      "Évaluation finale",
      "Travaux dirigés",
      "Projets",
      "Mémoires",
      "Présentations",
    ];

    let id = 1;
    const list = [];

    modules.forEach((module) => {
      const numCategories = 2 + (module.id % 4);
      for (let i = 0; i < numCategories; i++) {
        const categoryType = categoryTypes[(module.id + i) % categoryTypes.length];
        list.push({
          id: id++,
          moduleId: module.id,
          moduleName: module.name,
          name: categoryType,
          imageUrl: placeholderImage,
          totalQuestions: 25 + ((id + i * 7) % 100),
        });
      }
    });

    return list;
  }, []);

  const filteredCategories = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return categories.filter((c) => {
      const passesModule = filterModule === "all" || c.moduleId.toString() === filterModule;
      const passesSearch =
        c.name.toLowerCase().includes(term) ||
        c.moduleName.toLowerCase().includes(term) ||
        String(c.id).includes(term);
      return passesModule && passesSearch;
    });
  }, [searchTerm, filterModule, categories]);

  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCategories = filteredCategories.slice(startIndex, endIndex);

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterModule]);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <PageHeader title="Catégories des Modules" description="Gérer les catégories pour chaque module" />
          
          <Button onClick={() => setShowNewCategoryForm(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Créer Catégorie
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Folders className="h-5 w-5" />
              Répertoire des Catégories
            </CardTitle>
            <CardDescription>Rechercher et gérer les catégories de modules</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Rechercher par nom, module ou ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterModule} onValueChange={setFilterModule}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous les modules" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les modules</SelectItem>
                  {Array.from(new Set(categories.map((c) => c.moduleId))).map((moduleId) => {
                    const module = categories.find((c) => c.moduleId === moduleId);
                    return (
                      <SelectItem key={moduleId} value={moduleId.toString()}>
                        {module.moduleName}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Nom du Module</TableHead>
                    <TableHead>Nom de la Catégorie</TableHead>
                    <TableHead>Image</TableHead>
                    <TableHead>Questions</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentCategories.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                        Aucune catégorie trouvée
                      </TableCell>
                    </TableRow>
                  ) : (
                    currentCategories.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell className="font-mono text-sm">{c.id}</TableCell>
                        <TableCell className="font-medium">{c.moduleName}</TableCell>
                        <TableCell className="font-medium">{c.name}</TableCell>
                        <TableCell>
                          <div className="w-12 h-12 rounded-md overflow-hidden bg-slate-100 border">
                            <img src={c.imageUrl} alt={c.name} className="w-full h-full object-cover" />
                          </div>
                        </TableCell>
                        <TableCell>{c.totalQuestions}</TableCell>
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
              Affichage de {filteredCategories.length === 0 ? 0 : startIndex + 1} à{" "}
              {Math.min(endIndex, filteredCategories.length)} sur {filteredCategories.length} résultats
            </div>
            {renderPagination()}
          </CardFooter>
        </Card>
      </div>

      {showNewCategoryForm && (
        <NewCategoryForm setShowNewCategoryForm={setShowNewCategoryForm} modules={categories} />
      )}
    </div>
  );
};

export default CategoriesOfModules;
