import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FaFileCircleQuestion } from "react-icons/fa6";
import { FiDownload, FiUserPlus, FiUsers } from "react-icons/fi";
import { AiOutlineDelete } from "react-icons/ai";
import { IoCheckmarkDoneCircle } from "react-icons/io5";
import { MdPlaylistAddCheck } from "react-icons/md";
import { api } from "@/lib/utils";
const Explications = () => {
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [explanations, setExplanations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");
        const { data } = await api.get("/explanations");
        const list = Array.isArray(data?.data) ? data.data : [];
        const mapped = list.map((item) => ({
          id: item?._id,
          username: item?.userId?.email || "—",
          name: item?.userId?.name || "—",
          question: item?.questionId?.text || "—",
          explicationTitle: item?.title || "—",
          date: item?.createdAt
            ? new Date(item.createdAt).toISOString().slice(0, 10)
            : "—",
          images: item?.imageUrl ? [item.imageUrl] : [],
          text: item?.contentText || "",
        }));
        setExplanations(mapped);
      } catch (e) {
        setError("Failed to load explanations");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Calculate pagination
  const totalPages = Math.max(1, Math.ceil(explanations.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentReports = explanations.slice(startIndex, endIndex);

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
    <div className="p-6 space-y-6 min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            User Explication Questions Management
          </h1>
          <p className="text-gray-600 mt-1">
            Manage user explication questions
          </p>
        </div>
      </div>
      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Explanations
                </p>
                <p className="text-xl font-bold text-gray-900">
                  {explanations.length}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <MdPlaylistAddCheck className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent>
          {loading && (
            <div className="py-8 text-center text-gray-600">Loading…</div>
          )}
          {error && !loading && (
            <div className="py-3 px-4 mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}
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
                    Title
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
                      {report.explicationTitle || "—"}
                    </td>
                    <td className="py-4 px-4 text-gray-700">
                      {report.date || "—"}
                    </td>
                    <td
                      className="py-4 px-4 text-gray-700 align-top"
                      style={{ minWidth: 160 }}
                    >
                      {(() => {
                        const images = Array.isArray(report?.images)
                          ? report.images.filter(Boolean)
                          : [];
                        if (!images.length && report?.image) {
                          images.push(report.image);
                        }
                        if (
                          !images.length &&
                          typeof report?.imageOrText === "string" &&
                          /^https?:\/\//.test(report.imageOrText)
                        ) {
                          images.push(report.imageOrText);
                        }

                        const text =
                          typeof report?.text === "string" && report.text.trim()
                            ? report.text
                            : typeof report?.imageOrText === "string" &&
                              !/^https?:\/\//.test(report.imageOrText)
                            ? report.imageOrText
                            : "";

                        return (
                          <div className="flex flex-col gap-2">
                            {images.length > 0 && (
                              <div className="grid grid-cols-2 gap-2 max-w-[220px]">
                                {images.map((src, idx) => (
                                  <button
                                    key={`${src}-${idx}`}
                                    type="button"
                                    className="relative aspect-video w-full overflow-hidden rounded-md border border-gray-200 bg-gray-50"
                                    onClick={() =>
                                      window.open(
                                        src,
                                        "_blank",
                                        "noopener,noreferrer"
                                      )
                                    }
                                    title="Open image in new tab"
                                  >
                                    <img
                                      src={src}
                                      alt={`detail ${idx + 1}`}
                                      className="h-full w-full object-cover"
                                      loading="lazy"
                                    />
                                  </button>
                                ))}
                              </div>
                            )}
                            {text && (
                              <div className="text-sm text-gray-800 whitespace-pre-line max-w-xs">
                                {text}
                              </div>
                            )}
                            {!images.length && !text && (
                              <span className="text-gray-400 text-sm">
                                No details provided
                              </span>
                            )}
                          </div>
                        );
                      })()}
                    </td>
                    <td className="py-4 px-4 text-gray-700 flex gap-2.5">
                      <IoCheckmarkDoneCircle
                        className="text-green-600 hover:text-green-300 cursor-pointer"
                        fontSize={20}
                      />
                      <AiOutlineDelete
                        className="hover:text-red-500 cursor-pointer"
                        fontSize={20}
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
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-t bg-gray-50/50 px-6 py-3">
          <div className="text-sm text-gray-600">
            Showing {startIndex + 1} to{" "}
            {Math.min(endIndex, explanations.length)} of {explanations.length}{" "}
            results
          </div>
          <div className="flex items-center gap-2">
            {renderPaginationButtons()}
          </div>
        </div>
      )}
    </div>
  );
};

export default Explications;

// dummy data removed; using API data
