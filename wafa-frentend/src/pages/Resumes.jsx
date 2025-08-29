import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FaFileCircleQuestion } from "react-icons/fa6";
import { FiDownload, FiUserPlus, FiUsers } from "react-icons/fi";
import { AiOutlineDelete } from "react-icons/ai";
import { IoCheckmarkDoneCircle } from "react-icons/io5";
import { MdPlaylistAddCheck } from "react-icons/md";
import { FaBook } from "react-icons/fa";
import { api } from "@/lib/utils";
const Resumes = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [resumes, setResumes] = useState([]);
  const [uploadFile, setUploadFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchResumes = async () => {
      try {
        setLoading(true);
        setError("");
        const { data } = await api.get("/resumes");
        const list = Array.isArray(data?.data) ? data.data : [];
        const mapped = list.map((item) => ({
          id: item?._id,
          username: item?.userId?.email || "—",
          name: item?.userId?.name || "—",
          title: item?.title || "—",
          pdf: item?.pdfUrl || "",
          approved: String(item?.status || "").toLowerCase() === "approved",
          date: item?.createdAt
            ? new Date(item.createdAt).toISOString().slice(0, 10)
            : "—",
        }));
        setResumes(mapped);
      } catch (e) {
        setError("Failed to load resumes");
      } finally {
        setLoading(false);
      }
    };
    fetchResumes();
  }, []);

  // Pagination logic
  const totalPages = Math.ceil(resumes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentResumes = resumes.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleApprove = async (id) => {
    try {
      await api.patch(`/resumes/${id}/status`, { status: "approved" });
      setResumes((prev) =>
        prev.map((resume) =>
          resume.id === id ? { ...resume, approved: true } : resume
        )
      );
    } catch (e) {
      // noop: keep current state if request fails
    }
  };

  const handleSeePDF = (pdfUrl) => {
    window.open(pdfUrl, "_blank");
  };

  const handleFileChange = (e) => {
    setUploadFile(e.target.files[0]);
  };

  const handleUpload = () => {
    if (!uploadFile) return;
    // Simulate upload: create a new resume entry
    const newResume = {
      id: resumes.length + 1,
      username: "DemoUser",
      name: "Demo User",
      title: uploadFile.name,
      pdf: URL.createObjectURL(uploadFile),
      approved: false,
      date: new Date().toISOString().slice(0, 10),
    };
    setResumes([newResume, ...resumes]);
    setUploadFile(null);
  };

  const renderPaginationButtons = () => {
    const buttons = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
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
            User Resumes Management
          </h1>
          <p className="text-gray-600 mt-1">
            Manage user uploaded resumes, approve them, and view PDF files.
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Resumes
                </p>
                <p className="text-xl font-bold text-gray-900">
                  {resumes.length}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <FaBook className="w-6 h-6 text-blue-600" />
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
                    Resume Title
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">
                    PDF
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">
                    Date
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentResumes.map((resume) => (
                  <tr
                    key={resume.id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-4 px-4 font-medium text-gray-900">
                      {resume.id}
                    </td>
                    <td className="py-4 px-4 text-gray-700">
                      {resume.username}
                    </td>
                    <td className="py-4 px-4 text-gray-700">{resume.title}</td>
                    <td
                      className="py-4 px-4 text-gray-700"
                      style={{ minWidth: 120 }}
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSeePDF(resume.pdf)}
                      >
                        See PDF
                      </Button>
                    </td>
                    <td className="py-4 px-4 text-gray-700">
                      {resume.date || "—"}
                    </td>
                    <td className="py-4 px-4 text-gray-700">
                      {resume.approved ? (
                        <span className="text-green-600 font-semibold">
                          Approved
                        </span>
                      ) : (
                        <span className="text-yellow-600 font-semibold">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-gray-700 flex gap-2.5">
                      <IoCheckmarkDoneCircle
                        className="text-green-600 hover:text-green-300 cursor-pointer"
                        fontSize={20}
                        onClick={() => handleApprove(resume.id)}
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
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-t bg-gray-50/50 px-6 py-3">
          <div className="text-sm text-gray-600">
            Showing {startIndex + 1} to {Math.min(endIndex, resumes.length)} of{" "}
            {resumes.length} results
          </div>
          <div className="flex items-center gap-2">
            {renderPaginationButtons()}
          </div>
        </div>
      )}
    </div>
  );
};

export default Resumes;
