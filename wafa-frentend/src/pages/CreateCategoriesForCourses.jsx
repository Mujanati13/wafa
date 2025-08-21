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
import {
  FiChevronLeft,
  FiChevronRight,
  FiFilter,
  FiSearch,
  FiPlus,
  FiEdit,
  FiTrash2,
} from "react-icons/fi";

const CreateCategoriesForCourses = () => {
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

  React.useEffect(() => {
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
        className="flex items-center gap-1"
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
              Create categories for courses
            </h1>
            <p className="text-gray-600 mt-1">
              Create a category for a course and browse existing ones
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
              onClick={() => setShowCreateForm(true)}
            >
              <FiPlus className="w-4 h-4 mr-2" />
              Create
            </Button>
          </div>
        </div>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-bold">
              Categories filter
            </CardTitle>
            <CardDescription>Search and filter by module</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="relative flex-1">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by id, module or sub module..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <Select
                  value={moduleFilter}
                  onChange={(e) => setModuleFilter(e.target.value)}
                  className="w-full border-gray-300 focus:border-gray-400 focus:ring-gray-400"
                >
                  <option value="all">All modules</option>
                  {Array.from(
                    new Set(categoriesForCourses.map((c) => c.moduleId))
                  ).map((moduleId) => {
                    const module = categoriesForCourses.find(
                      (c) => c.moduleId === moduleId
                    );
                    return (
                      <option key={moduleId} value={moduleId}>
                        {module?.moduleName}
                      </option>
                    );
                  })}
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-bold">
              Categories of courses ({filtered.length})
            </CardTitle>
            <CardDescription>
              Id | module name | sous module name | Image | total of questions |
              operate
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px]">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">
                      Id
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">
                      Module name
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">
                      Sous module name
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">
                      Image
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">
                      Total of questions
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">
                      Operate
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentRows.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-4 px-4 text-gray-700">{row.id}</td>
                      <td className="py-4 px-4 text-gray-900 font-medium">
                        {row.moduleName}
                      </td>
                      <td className="py-4 px-4 text-gray-900 font-medium">
                        {row.subModuleName}
                      </td>
                      <td className="py-4 px-4">
                        <div className="w-12 h-12 rounded-md overflow-hidden bg-gray-100 border border-gray-200">
                          <img
                            src={row.imageUrl}
                            alt={row.subModuleName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </td>
                      <td className="py-4 px-4 text-gray-700">
                        {row.totalQuestions}
                      </td>
                      <td className="py-4 px-4 text-gray-700 flex gap-2 items-center">
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
              Showing {filtered.length === 0 ? 0 : startIndex + 1} to{" "}
              {Math.min(endIndex, filtered.length)} of {filtered.length} results
            </div>
            {renderPagination()}
          </CardFooter>
        </Card>
      </div>

      {showCreateForm && (
        <div className="flex justify-center items-center min-h-screen bg-black/50 p-4 z-[99999999999] absolute top-0 left-0 w-full h-full">
          <div className="w-full max-w-md bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="mb-6">
              <h1 className="text-xl font-semibold text-gray-900 mb-1">
                Create category for course
              </h1>
              <p className="text-sm text-gray-600">
                Name, image, and module with optional sub module
              </p>
            </div>

            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Name
                </label>
                <input
                  type="text"
                  placeholder="Category name"
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Image URL
                </label>
                <input
                  type="text"
                  placeholder="https://..."
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Select module
                </label>
                <Select className="mt-1 w-full border-gray-300 focus:border-gray-400 focus:ring-gray-400">
                  <option value="" disabled>
                    Choose module
                  </option>
                  {Array.from(
                    new Set(categoriesForCourses.map((c) => c.moduleId))
                  ).map((moduleId) => {
                    const module = categoriesForCourses.find(
                      (c) => c.moduleId === moduleId
                    );
                    return (
                      <option key={moduleId} value={moduleId}>
                        {module?.moduleName}
                      </option>
                    );
                  })}
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Sous module which is in (optional)
                </label>
                <Select className="mt-1 w-full border-gray-300 focus:border-gray-400 focus:ring-gray-400">
                  <option value="">None</option>
                  <option value="Système cardiovasculaire">
                    Système cardiovasculaire
                  </option>
                  <option value="Système respiratoire">
                    Système respiratoire
                  </option>
                  <option value="Système digestif">Système digestif</option>
                  <option value="Système nerveux">Système nerveux</option>
                  <option value="Système endocrinien">
                    Système endocrinien
                  </option>
                </Select>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  className="text-gray-700 hover:text-gray-900"
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-gray-800 hover:bg-gray-900 text-white"
                >
                  Create
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateCategoriesForCourses;
