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
  FiPlus,
} from "react-icons/fi";
import { IoCheckmarkDoneCircle } from "react-icons/io5";
import { Trash, Edit, Eye } from "lucide-react";
import NewExamForm from "../components/admin/NewExamForm";

const ExamParYears = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [moduleFilter, setModuleFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");

  // Sample data generator for exams by years
  const examsByYears = useMemo(() => {
    const placeholderImage =
      "https://via.placeholder.com/150x100/4F46E5/FFFFFF?text=Exam";
    const modules = [
      "Anatomie 1",
      "Biophysique",
      "Embryologie",
      "Histologie",
      "Physiologie 1",
      "Biochimie 1",
      "Biostatistiques 1",
      "Génétique",
      "Sémiologie 1",
      "Microbiologie 1",
      "Immunologie",
      "Hématologie",
    ];
    const years = ["2020", "2021", "2022", "2023", "2024"];

    let id = 1;
    const list = [];

    modules.forEach((module, moduleIdx) => {
      years.forEach((year, yearIdx) => {
        if (Math.random() > 0.3) {
          // 70% chance to create an exam
          list.push({
            id: id++,
            moduleName: module,
            examName: `${module} - ${year}`,
            year: year,
            imageUrl: placeholderImage,
            totalQuestions: 30 + ((id + moduleIdx + yearIdx) % 50),
            helpText: `Informations et explications pour ${module} ${year}`,
            status: Math.random() > 0.5 ? "active" : "draft",
          });
        }
      });
    });

    return list.sort((a, b) => b.year.localeCompare(a.year));
  }, []);

  const filteredExams = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return examsByYears.filter((exam) => {
      const passesModule =
        moduleFilter === "all" || exam.moduleName === moduleFilter;
      const passesYear = yearFilter === "all" || exam.year === yearFilter;
      const passesSearch =
        exam.examName.toLowerCase().includes(term) ||
        exam.moduleName.toLowerCase().includes(term) ||
        exam.year.includes(term) ||
        String(exam.id).includes(term);

      return passesModule && passesYear && passesSearch;
    });
  }, [searchTerm, moduleFilter, yearFilter, examsByYears]);

  const totalPages = Math.ceil(filteredExams.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentExams = filteredExams.slice(startIndex, endIndex);

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  React.useEffect(() => {
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

  // Get unique modules and years for the form
  const uniqueModules = Array.from(
    new Set(examsByYears.map((e) => e.moduleName))
  );
  const uniqueYears = Array.from(new Set(examsByYears.map((e) => e.year))).sort(
    (a, b) => b - a
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="w-full space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Exam par Years</h1>
            <p className="text-gray-600 mt-1">
              Manage exams organized by years
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
              Create Exam par Years
            </Button>
          </div>
        </div>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Exam Directory</CardTitle>
            <CardDescription>Search and manage exams by years</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="relative flex-1">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by name, module, or year..."
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
                    new Set(examsByYears.map((e) => e.moduleName))
                  ).map((module) => (
                    <option key={module} value={module}>
                      {module}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Select
                  value={yearFilter}
                  onChange={(e) => setYearFilter(e.target.value)}
                  className="w-full border-gray-300 focus:border-gray-400 focus:ring-gray-400"
                >
                  <option value="all">All years</option>
                  {Array.from(new Set(examsByYears.map((e) => e.year)))
                    .sort((a, b) => b - a)
                    .map((year) => (
                      <option key={year} value={year}>
                        {year}
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
              All Exams par Years ({filteredExams.length})
            </CardTitle>
            <CardDescription>
              List of exams organized by years with module information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px]">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">
                      ID
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">
                      Module Name
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">
                      Exam par Years Name
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">
                      Year
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">
                      Image
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">
                      Help Text "?"
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">
                      Total Questions
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">
                      Operate
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentExams.map((exam) => (
                    <tr
                      key={exam.id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-4 px-4 text-gray-700">{exam.id}</td>
                      <td className="py-4 px-4 text-gray-900 font-medium">
                        {exam.moduleName}
                      </td>
                      <td className="py-4 px-4 text-gray-900 font-medium">
                        {exam.examName}
                      </td>
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-green-50 text-green-700 border-green-200">
                          {exam.year}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="w-16 h-12 rounded-md overflow-hidden bg-gray-100 border border-gray-200">
                          <img
                            src={exam.imageUrl}
                            alt={exam.examName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </td>
                      <td
                        className="py-4 px-4 text-gray-600 max-w-[300px] truncate"
                        title={exam.helpText}
                      >
                        {exam.helpText}
                      </td>
                      <td className="py-4 px-4 text-gray-700">
                        {exam.totalQuestions}
                      </td>
                      <td className="py-4 px-4 text-gray-700 flex gap-2 items-center">
                        <Eye
                          size={18}
                          className="text-blue-600 hover:text-blue-800 cursor-pointer"
                        />
                        <Edit
                          size={18}
                          className="text-green-600 hover:text-green-800 cursor-pointer"
                        />
                        <Trash
                          size={18}
                          className="text-red-600 hover:text-red-800 cursor-pointer"
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
              Showing {filteredExams.length === 0 ? 0 : startIndex + 1} to{" "}
              {Math.min(endIndex, filteredExams.length)} of{" "}
              {filteredExams.length} results
            </div>
            {renderPagination()}
          </CardFooter>
        </Card>
      </div>

      {showCreateForm && (
        <NewExamForm
          setShowNewExamForm={setShowCreateForm}
          modules={uniqueModules}
          years={uniqueYears}
        />
      )}
    </div>
  );
};

export default ExamParYears;
