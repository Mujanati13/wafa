import React, { useMemo, useState } from "react";
import { Button } from "../components/ui/button";
import { Select } from "../components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { cn } from "../lib/utils";
import {
  FiChevronLeft,
  FiChevronRight,
  FiFilter,
  FiSearch,
  FiPlus,
  FiEdit,
  FiTrash2,
} from "react-icons/fi";
import NewCategoryForm from "../components/admin/NewCategoryForm";

const CategoriesOfModules = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewCategoryForm, setShowNewCategoryForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterModule, setFilterModule] = useState("all");
  const itemsPerPage = 8;

  // Sample data generator for categories
  const categories = useMemo(() => {
    const placeholderImage =
      "https://via.placeholder.com/150x150?text=Category";
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
      const numCategories = 2 + (module.id % 4); // 2-5 categories per module
      for (let i = 0; i < numCategories; i++) {
        const categoryType =
          categoryTypes[(module.id + i) % categoryTypes.length];
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
      const passesModule =
        filterModule === "all" || c.moduleId.toString() === filterModule;
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

  React.useEffect(() => {
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
        className="flex items-center gap-1"
      >
        <FiChevronLeft className="w-4 h-4" />
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
        className="flex flex-row items-center gap-1"
      >
        Next
        <FiChevronRight className="w-4 h-4" />
      </Button>
    );

    return <div className="flex items-center gap-2">{buttons}</div>;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="w-full space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Categories of Modules
            </h1>
            <p className="text-gray-600 mt-1">
              Manage categories for each module
            </p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <Button variant="outline" size="sm">
              <FiFilter className="w-4 h-4" />
              Filters
            </Button>
            <Button
              size="sm"
              className="bg-black text-white hover:bg-gray-800"
              onClick={() => setShowNewCategoryForm(true)}
            >
              <FiPlus className="w-4 h-4 mr-2" />
              Create Category
            </Button>
          </div>
        </div>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-bold">
              Category Directory
            </CardTitle>
            <CardDescription>
              Search and manage module categories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="relative flex-1">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by name, module, or id..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <Select
                  value={filterModule}
                  onChange={(e) => setFilterModule(e.target.value)}
                  className="w-full border-gray-300 focus:border-gray-400 focus:ring-gray-400"
                >
                  <option value="all">All modules</option>
                  {Array.from(new Set(categories.map((c) => c.moduleId))).map(
                    (moduleId) => {
                      const module = categories.find(
                        (c) => c.moduleId === moduleId
                      );
                      return (
                        <option key={moduleId} value={moduleId}>
                          {module.moduleName}
                        </option>
                      );
                    }
                  )}
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-bold">
              Categories of Modules ({filteredCategories.length})
            </CardTitle>
            <CardDescription>
              List of categories with their associated modules and metadata
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">
                      ID
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">
                      Module Name
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">
                      Categories of Modules Names
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">
                      Image
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">
                      Total of Questions
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">
                      Operate
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentCategories.map((c) => (
                    <tr
                      key={c.id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-4 px-4 text-gray-700">{c.id}</td>
                      <td className="py-4 px-4">
                        <span className="text-gray-900 font-medium">
                          {c.moduleName}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-gray-900 font-medium">
                        {c.name}
                      </td>
                      <td className="py-4 px-4">
                        <div className="w-12 h-12 rounded-md overflow-hidden bg-gray-100 border border-gray-200">
                          <img
                            src={c.imageUrl}
                            alt={c.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </td>
                      <td className="py-4 px-4 text-gray-700">
                        {c.totalQuestions}
                      </td>
                      <td className="py-4 px-4 text-gray-700 flex gap-2.5 items-center">
                        <FiEdit
                          className="text-blue-600 hover:text-blue-800 cursor-pointer"
                          size={18}
                        />
                        <FiTrash2
                          className="text-red-600 hover:text-red-800 cursor-pointer"
                          size={18}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-4 border-t bg-gray-50/50">
            <div className="text-sm text-gray-600">
              Showing {filteredCategories.length === 0 ? 0 : startIndex + 1} to{" "}
              {Math.min(endIndex, filteredCategories.length)} of{" "}
              {filteredCategories.length} results
            </div>
            {renderPagination()}
          </CardFooter>
        </Card>
      </div>

      {showNewCategoryForm && (
        <NewCategoryForm
          setShowNewCategoryForm={setShowNewCategoryForm}
          modules={categories}
        />
      )}
    </div>
  );
};

export default CategoriesOfModules;
