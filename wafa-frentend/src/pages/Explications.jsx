import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FaFileCircleQuestion } from "react-icons/fa6";
import { FiDownload, FiUserPlus, FiUsers } from "react-icons/fi";
import { AiOutlineDelete } from "react-icons/ai";
import { IoCheckmarkDoneCircle } from "react-icons/io5";
import { MdPlaylistAddCheck } from "react-icons/md";
const Explications = () => {
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  // Calculate pagination
  const totalPages = Math.ceil(explication.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentReports = explication.slice(startIndex, endIndex);

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
                  Total Reports
                </p>
                <p className="text-xl font-bold text-gray-900">
                  {explication.length}
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
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">
                    User
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">
                    Username
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">
                    Question
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
                      {report.name}
                    </td>
                    <td className="py-4 px-4 text-gray-700">
                      {report.username}
                    </td>
                    <td className="py-4 px-4 text-gray-700">
                      {report.question}
                    </td>
                    <td className="py-4 px-4 text-gray-700" style={{ minWidth: 120 }}>
                      {/^https?:\/\//.test(report.imageOrText) ? (
                        <img
                          src={report.imageOrText}
                          alt="detail"
                          className="max-h-16 max-w-xs rounded border cursor-pointer"
                          style={{ width: "100px", height: "auto", objectFit: "cover" }}
                        />
                      ) : (
                        report.imageOrText
                      )}
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
            Showing {startIndex + 1} to {Math.min(endIndex, explication.length)}{" "}
            of {explication.length} results
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

const explication = [
  {
    id: 1,
    username: "JohnDoe",
    name: "John Doe",
    question: "How do I upload a profile picture?",
    imageOrText:
      "https://cdn.pixabay.com/photo/2014/06/03/19/38/board-361516_640.jpg",
  },
  {
    id: 2,
    username: "JaneSmith",
    name: "Jane Smith",
    question: "Where can I find the invoice for my last order?",
    imageOrText: "Check your account dashboard under 'Billing History'.",
  },
  {
    id: 3,
    username: "MikeBrown",
    name: "Mike Brown",
    question: "How do I reset my password?",
    imageOrText:
      "https://cdn.pixabay.com/photo/2014/06/03/19/38/board-361516_640.jpg",
  },
  {
    id: 4,
    username: "SaraLee",
    name: "Sara Lee",
    question: "How do I share my project with a colleague?",
    imageOrText: "Open the project and click 'Share' in the top-right corner.",
  },
  {
    id: 5,
    username: "ChrisGreen",
    name: "Chris Green",
    question: "Can I import data from Excel?",
    imageOrText:
      "https://cdn.pixabay.com/photo/2014/06/03/19/38/board-361516_640.jpg",
  },
  {
    id: 6,
    username: "LindaWhite",
    name: "Linda White",
    question: "Where can I see the changelog?",
    imageOrText: "Visit the 'Updates' section in the help center.",
  },
  {
    id: 7,
    username: "DavidKing",
    name: "David King",
    question: "Is there a dark mode?",
    imageOrText:
      "https://cdn.pixabay.com/photo/2014/06/03/19/38/board-361516_640.jpg",
  },
  {
    id: 8,
    username: "EmilyClark",
    name: "Emily Clark",
    question: "How do I export my report as PDF?",
    imageOrText: "Open your report and click 'Export' → 'PDF'.",
  },
  {
    id: 9,
    username: "RobertHall",
    name: "Robert Hall",
    question: "Where do I update my payment method?",
    imageOrText:
      "https://cdn.pixabay.com/photo/2014/06/03/19/38/board-361516_640.jpg",
  },
  {
    id: 10,
    username: "OliviaYoung",
    name: "Olivia Young",
    question: "Can I add more team members to my plan?",
    imageOrText: "Yes, go to 'Team Settings' and click 'Add Member'.",
  },
];
