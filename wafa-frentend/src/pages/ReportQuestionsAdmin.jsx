import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import React, { useEffect, useState } from "react";
import { FaFileCircleQuestion } from "react-icons/fa6";
import { FiDownload, FiUserPlus, FiUsers } from "react-icons/fi";
import { AiOutlineDelete } from "react-icons/ai";
import { IoCheckmarkDoneCircle } from "react-icons/io5";
import { FilePenLine } from "lucide-react";
import { api } from "@/lib/utils";

const ReportQuestionsAdmin = () => {
  // Data state
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data } = await api.get("/report-questions/all");
        const list = (data?.data || []).map((r) => ({
          id: r?._id,
          name: r?.username || r?.userId?.username || "—",
          username: r?.username || r?.userId?.username || "—",
          question: r?.questionTitle || r?.questionId?.text || "—",
          text: r?.details || "",
          date: (r?.createdAt || r?.updatedAt || "").slice(0, 10),
        }));
        setReports(list);
      } catch (e) {
        setError("Failed to load reports");
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  // Calculate pagination
  const totalPages = Math.ceil(reports.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentReports = reports.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const renderPaginationButtons = () => {
    const buttons = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Previous button
    buttons.push(
      <Button
        key="prev"
        variant="outline"
        size="sm"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex items-center gap-1"
      >
        <span className="sr-only">Previous</span>
        &#8592;
      </Button>
    );

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <Button
          key={i}
          variant={currentPage === i ? "default" : "outline"}
          size="sm"
          onClick={() => handlePageChange(i)}
          className="min-w-[40px]"
        >
          {i}
        </Button>
      );
    }

    // Next button
    buttons.push(
      <Button
        key="next"
        variant="outline"
        size="sm"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex items-center gap-1"
      >
        <span className="sr-only">Next</span>
        &#8594;
      </Button>
    );

    return buttons;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            User Report Questions Management
          </h1>
          <p className="text-gray-600 mt-1">Manage user reports</p>
        </div>
      </div>
      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Reports
                </p>
                <p className="text-xl font-bold text-gray-900">
                  {reports.length}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <FaFileCircleQuestion className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">
                    Id
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">
                    Username
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">
                    Question
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">
                    Date
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">
                    Details
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentReports.map((report) => (
                  <tr
                    key={report.id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-4 px-4 font-medium text-gray-900">
                      {report.id}
                    </td>
                    <td className="py-4 px-4 text-gray-700">
                      {report.username}
                    </td>
                    <td className="py-4 px-4 text-gray-700">
                      {report.question}
                    </td>
                    <td className="py-4 px-4 text-gray-700">
                      {report.date || "—"}
                    </td>
                    <td className="py-4 px-4 text-gray-700">{report.text}</td>
                    <td className="py-4 px-4 text-gray-700 flex gap-2.5">
                      <IoCheckmarkDoneCircle
                        className="text-green-600 hover:text-green-300 cursor-pointer"
                        fontSize={20}
                      />
                      <AiOutlineDelete
                        className="hover:text-red-500 cursor-pointer"
                        fontSize={20}
                      />
                      <FilePenLine
                        className="hover:text-blue-500 cursor-pointer"
                        size={20}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      {/* Pagination Footer */}
      {reports.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-t bg-gray-50/50 px-6 py-3">
          <div className="text-sm text-gray-600">
            {loading && "Loading..."}
            {!loading && !error && (
              <>
                Showing {startIndex + 1} to {Math.min(endIndex, reports.length)}{" "}
                of {reports.length} results
              </>
            )}
            {!loading && error && <span className="text-red-600">{error}</span>}
          </div>
          <div className="flex items-center gap-2">
            {renderPaginationButtons()}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportQuestionsAdmin;
