import { useMemo, useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, Filter, Search, Plus, Edit, Trash2, Layers, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

const CreateCategoriesForCourses = () => {
  const { t } = useTranslation(['admin', 'common']);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [moduleFilter, setModuleFilter] = useState("all");
  const itemsPerPage = 8;

  // Sample data representing categories for courses
  const categoriesForCourses = useMemo(() => {
    const placeholderImage =
      "https://via.placeholder.com/150x100/111827/FFFFFF?text=Image";
    const modules = [
      { id: 1, name: "Anatomie 1" },
      { id: 2, name: "Biophysique" },
      { id: 3, name: "Embryologie" },
      { id: 4, name: "Histologie" },
      { id: 5, name: "Physiologie 1" },
      { id: 6, name: "Biochimie 1" },
    ];

    const subModules = [
      "Système cardiovasculaire",
      "Système respiratoire",
      "Système digestif",
      "Système nerveux",
      "Système endocrinien",
    ];

    let id = 1;
    const list = [];

    modules.forEach((m) => {
      subModules.forEach((sm, idx) => {
        if (idx % 2 === m.id % 2) {
          list.push({
            id: id++,
            moduleId: m.id,
            moduleName: m.name,
            subModuleName: idx % 3 === 0 ? "-" : sm,
            imageUrl: placeholderImage,
            totalQuestions: 10 + ((id + idx) % 50),
          });
        }
      });
    });

    return list;
  }, []);

  const filtered = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return categoriesForCourses.filter((item) => {
      const passesModule =
        moduleFilter === "all" || String(item.moduleId) === moduleFilter;
      const passesSearch =
        item.moduleName.toLowerCase().includes(term) ||
        item.subModuleName.toLowerCase().includes(term) ||
        String(item.id).includes(term);
      return passesModule && passesSearch;
    });
  }, [searchTerm, moduleFilter, categoriesForCourses]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRows = filtered.slice(startIndex, endIndex);

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, moduleFilter]);

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
        className="flex items-center gap-1"
      >
        <ChevronLeft className="w-4 h-4" />
        Previous
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
        className="flex items-center gap-1"
      >
        Next
        <ChevronRight className="w-4 h-4" />
      </Button>
    );

    return <div className="flex items-center gap-2">{buttons}</div>;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Gradient Header */}

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Action Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
        >
          <div>
            <h2 className="text-2xl font-bold text-black mb-1">Course Categories</h2>
            <p className="text-gray-600">Total: <span className="font-semibold text-black">{filtered.length}</span> categories</p>
          </div>
          <Button
            size="lg"
            className="bg-black hover:bg-gray-900 text-white shadow-lg"
            onClick={() => setShowCreateForm(true)}
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Category
          </Button>
        </motion.div>

        {/* Filter Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="bg-white border-gray-200 shadow-md">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-black" />
                <div>
                  <CardTitle className="text-black">Search & Filter</CardTitle>
                  <CardDescription className="text-gray-600">Find categories by name, module, or ID</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Search by ID, module or sub-module..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-gray-50 border-gray-300 text-black placeholder:text-gray-500 focus:border-black focus:ring-black"
                  />
                </div>
                <Select value={moduleFilter} onValueChange={setModuleFilter}>
                  <SelectTrigger className="bg-gray-50 border-gray-300 text-black">
                    <SelectValue placeholder="Select module" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200">
                    <SelectItem value="all" className="text-black">All Modules</SelectItem>
                    {Array.from(new Set(categoriesForCourses.map((c) => c.moduleId))).map((moduleId) => {
                      const module = categoriesForCourses.find((c) => c.moduleId === moduleId);
                      return (
                        <SelectItem key={moduleId} value={String(moduleId)} className="text-black">
                          {module?.moduleName}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Data Table Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="bg-white border-gray-200 shadow-md overflow-hidden">
            <CardHeader className="pb-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-black text-xl">Categories List</CardTitle>
                  <CardDescription className="text-gray-600">
                    {filtered.length === 0 ? "No categories found" : `Showing ${Math.min(currentRows.length, itemsPerPage)} of ${filtered.length}`}
                  </CardDescription>
                </div>
                <Badge className="bg-gray-200 text-black border border-gray-300">
                  {filtered.length} Total
                </Badge>
              </div>
            </CardHeader>

            {currentRows.length > 0 ? (
              <>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200 bg-gray-50">
                          <th className="text-left py-4 px-6 font-semibold text-black">ID</th>
                          <th className="text-left py-4 px-6 font-semibold text-black">Module</th>
                          <th className="text-left py-4 px-6 font-semibold text-black">Sub-Module</th>
                          <th className="text-left py-4 px-6 font-semibold text-black">Image</th>
                          <th className="text-left py-4 px-6 font-semibold text-black">Questions</th>
                          <th className="text-left py-4 px-6 font-semibold text-black">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        <AnimatePresence>
                          {currentRows.map((row, idx) => (
                            <motion.tr
                              key={row.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              transition={{ duration: 0.3, delay: idx * 0.05 }}
                              className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                            >
                              <td className="py-4 px-6">
                                <Badge className="bg-gray-200 text-black border border-gray-300">
                                  #{row.id}
                                </Badge>
                              </td>
                              <td className="py-4 px-6 text-black font-medium">{row.moduleName}</td>
                              <td className="py-4 px-6 text-gray-700">{row.subModuleName}</td>
                              <td className="py-4 px-6">
                                <motion.div
                                  whileHover={{ scale: 1.05 }}
                                  className="w-12 h-12 rounded-lg overflow-hidden bg-gray-200 border border-gray-300 cursor-pointer"
                                >
                                  <img
                                    src={row.imageUrl}
                                    alt={row.subModuleName}
                                    className="w-full h-full object-cover"
                                  />
                                </motion.div>
                              </td>
                              <td className="py-4 px-6">
                                <Badge className="bg-gray-200 text-black border border-gray-300">
                                  {row.totalQuestions}
                                </Badge>
                              </td>
                              <td className="py-4 px-6">
                                <div className="flex gap-2 items-center">
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="p-2 text-blue-600 hover:text-blue-800 hover:bg-gray-100 rounded-lg transition-colors"
                                  >
                                    <Edit size={18} />
                                  </motion.button>
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="p-2 text-red-600 hover:text-red-800 hover:bg-gray-100 rounded-lg transition-colors"
                                  >
                                    <Trash2 size={18} />
                                  </motion.button>
                                </div>
                              </td>
                            </motion.tr>
                          ))}
                        </AnimatePresence>
                      </tbody>
                    </table>
                  </div>
                </CardContent>

                {/* Pagination Footer */}
                <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-gray-200 bg-gray-50 p-6">
                  <div className="text-sm text-gray-600">
                    Showing <span className="font-semibold text-black">{startIndex + 1}</span> to{" "}
                    <span className="font-semibold text-black">{Math.min(endIndex, filtered.length)}</span> of{" "}
                    <span className="font-semibold text-black">{filtered.length}</span> results
                  </div>
                  {renderPagination()}
                </CardFooter>
              </>
            ) : (
              <CardContent className="py-12">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center"
                >
                  <Layers className="w-12 h-12 text-gray-400 mx-auto mb-4 opacity-50" />
                  <p className="text-gray-700 text-lg">No categories found</p>
                  <p className="text-gray-500 text-sm">Try adjusting your search or filters</p>
                </motion.div>
              </CardContent>
            )}
          </Card>
        </motion.div>
      </div>

      {/* Create Category Dialog */}
      <AnimatePresence>
        {showCreateForm && (
          <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
            <DialogContent className="bg-white border-gray-200 text-black sm:max-w-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <DialogHeader>
                  <DialogTitle className="text-black text-xl">Create New Category</DialogTitle>
                  <DialogDescription className="text-gray-600">
                    Add a new category with module and sub-module information
                  </DialogDescription>
                </DialogHeader>

                <form className="space-y-4 py-4" onSubmit={(e) => e.preventDefault()}>
                  <div className="space-y-2">
                    <Label className="text-black">Category Name</Label>
                    <Input
                      placeholder="Enter category name"
                      className="bg-gray-50 border-gray-300 text-black placeholder:text-gray-500 focus:border-black focus:ring-black"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-black">Image URL</Label>
                    <Input
                      placeholder="https://..."
                      className="bg-gray-50 border-gray-300 text-black placeholder:text-gray-500 focus:border-black focus:ring-black"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-black">Select Module</Label>
                    <Select>
                      <SelectTrigger className="bg-gray-50 border-gray-300 text-black">
                        <SelectValue placeholder="Choose module" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-gray-200">
                        {Array.from(new Set(categoriesForCourses.map((c) => c.moduleId))).map((moduleId) => {
                          const module = categoriesForCourses.find((c) => c.moduleId === moduleId);
                          return (
                            <SelectItem key={moduleId} value={String(moduleId)} className="text-black">
                              {module?.moduleName}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-black">Sub-Module (Optional)</Label>
                    <Select defaultValue="none">
                      <SelectTrigger className="bg-gray-50 border-gray-300 text-black">
                        <SelectValue placeholder="Select a sub-module" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-gray-200">
                        <SelectItem value="none" className="text-black">None</SelectItem>
                        <SelectItem value="Système cardiovasculaire" className="text-black">Système cardiovasculaire</SelectItem>
                        <SelectItem value="Système respiratoire" className="text-black">Système respiratoire</SelectItem>
                        <SelectItem value="Système digestif" className="text-black">Système digestif</SelectItem>
                        <SelectItem value="Système nerveux" className="text-black">Système nerveux</SelectItem>
                        <SelectItem value="Système endocrinien" className="text-black">Système endocrinien</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <DialogFooter className="gap-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      className="border-gray-300 text-black hover:bg-gray-100 hover:text-black"
                      onClick={() => setShowCreateForm(false)}
                    >
                      Cancel
                    </Button>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        type="submit"
                        className="bg-black hover:bg-gray-900 text-white"
                      >
                        Create Category
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

export default CreateCategoriesForCourses;
