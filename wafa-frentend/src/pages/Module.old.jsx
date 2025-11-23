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
  FiMoreVertical,
  FiSearch,
} from "react-icons/fi";
import NewModuleForm from "../components/admin/NewModuleForm";
import EditModuleForm from "../components/admin/EditModuleForm";
import { IoCheckmarkDoneCircle } from "react-icons/io5";
import { Trash, Edit } from "lucide-react";
import { api } from "../lib/utils";

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

  React.useEffect(() => {
    const fetchModules = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data } = await api.get("/modules");
        console.log(data);

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
        setError("Failed to load modules");
      } finally {
        setLoading(false);
      }
    };
    fetchModules();
  }, [showNewModuleForm, showEditForm]);

  const handleEditModule = (module) => {
    setSelectedModule(module);
    setShowEditForm(true);
  };

  const handleModuleUpdated = () => {
    // This will trigger the useEffect to refetch modules
    setShowEditForm(false);
    setSelectedModule(null);
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

  const totalPages = Math.ceil(filteredModules.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentModules = filteredModules.slice(startIndex, endIndex);

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, semesterFilter]);

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
            <h1 className="text-3xl font-bold text-gray-900">Modules</h1>
            <p className="text-gray-600 mt-1">Manage modules by semester</p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <Button variant="outline" size="sm">
              <FiFilter className="w-4 h-4" />
              Filters
            </Button>
            <Button
              size="sm"
              className="bg-black text-white hover:bg-gray-800"
              onClick={() => setShowNewModuleForm(true)}
            >
              + Add Module
            </Button>
          </div>
        </div>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-bold">
              Module Directory
            </CardTitle>
            <CardDescription>Search and manage modules</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="relative flex-1">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by name, semester, or id..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <Select
                  value={semesterFilter}
                  onChange={(e) => setSemesterFilter(e.target.value)}
                  className="w-full border-gray-300 focus:border-gray-400 focus:ring-gray-400"
                >
                  <option value="all">All semesters</option>
                  {Array.from({ length: 10 }, (_, i) => `S${i + 1}`)
                    .reverse()
                    .map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-bold">
              All Modules ({filteredModules.length})
            </CardTitle>
            <CardDescription>
              List of modules with semester and metadata
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading && (
              <div className="text-sm text-gray-600">Loading modules...</div>
            )}
            {error && <div className="text-sm text-red-600">{error}</div>}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">
                      ID
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">
                      Semester
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">
                      Module
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">
                      Image
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">
                      Total Questions
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">
                      Help Text "?"
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentModules.map((m) => (
                    <tr
                      key={m.id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-4 px-4 text-gray-700">{m.id}</td>
                      <td className="py-4 px-4">
                        <span
                          className={cn(
                            "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-blue-50 text-blue-700 border-blue-200"
                          )}
                        >
                          {m.semester}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-gray-900 font-medium">
                        {m.name}
                      </td>
                      <td className="py-4 px-4">
                        <div className="w-12 h-12 rounded-md overflow-hidden bg-gray-100 border border-gray-200">
                          <img
                            src={m.imageUrl}
                            alt={m.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </td>
                      <td className="py-4 px-4 text-gray-700">
                        {m.totalQuestions}
                      </td>
                      <td
                        className="py-4 px-4 text-gray-600 max-w-[360px] truncate"
                        title={m.helpText}
                      >
                        {m.helpText}
                      </td>
                      <td className="py-4 px-4 text-gray-700 flex gap-2.5 items-center ">
                        <Edit
                          size={18}
                          className="text-blue-600 hover:text-blue-800 cursor-pointer"
                          onClick={() => handleEditModule(m)}
                          title="Edit module"
                        />
                      
                        <Trash
                          size={18}
                          className="hover:text-red-500 cursor-pointer"
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
              Showing {filteredModules.length === 0 ? 0 : startIndex + 1} to{" "}
              {Math.min(endIndex, filteredModules.length)} of{" "}
              {filteredModules.length} results
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
