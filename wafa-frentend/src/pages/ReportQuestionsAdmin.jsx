import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import React, { useState } from "react";
import { FaFileCircleQuestion } from "react-icons/fa6";
import { FiDownload, FiUserPlus, FiUsers } from "react-icons/fi";
import { AiOutlineDelete } from "react-icons/ai";
import { IoCheckmarkDoneCircle } from "react-icons/io5";

const ReportQuestionsAdmin = () => {
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  // Calculate pagination
  const totalPages = Math.ceil(reportQuestionsByUser.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentReports = reportQuestionsByUser.slice(startIndex, endIndex);

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
                  {reportQuestionsByUser.length}
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
            {Math.min(endIndex, reportQuestionsByUser.length)} of{" "}
            {reportQuestionsByUser.length} results
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

const reportQuestionsByUser = [
  {
    id: 1,
    username: "JohnDoe",
    name: "John Doe",
    question: "How can I reset my account password?",
    text: "I tried the reset link but it didn’t work.",
  },
  {
    id: 2,
    username: "JaneSmith",
    name: "Jane Smith",
    question: "Why is my order delayed?",
    text: "My package was supposed to arrive yesterday.",
  },
  {
    id: 3,
    username: "MikeBrown",
    name: "Mike Brown",
    question: "Can I change my subscription plan?",
    text: "I want to switch from monthly to yearly billing.",
  },
  {
    id: 4,
    username: "SaraLee",
    name: "Sara Lee",
    question: "Is there a refund policy?",
    text: "I bought the wrong product by mistake.",
  },
  {
    id: 5,
    username: "ChrisGreen",
    name: "Chris Green",
    question: "How do I update my profile picture?",
    text: "I can’t find the upload button.",
  },
  {
    id: 6,
    username: "LindaWhite",
    name: "Linda White",
    question: "Can I have multiple accounts?",
    text: "I want separate accounts for personal and work.",
  },
  {
    id: 7,
    username: "DavidKing",
    name: "David King",
    question: "Is there a mobile app?",
    text: "I can’t find it on the app store.",
  },
  {
    id: 8,
    username: "EmilyClark",
    name: "Emily Clark",
    question: "How do I delete my account?",
    text: "I want to remove all my data permanently.",
  },
  {
    id: 9,
    username: "RobertHall",
    name: "Robert Hall",
    question: "Why am I not receiving notifications?",
    text: "I’ve checked my settings but still nothing.",
  },
  {
    id: 10,
    username: "OliviaYoung",
    name: "Olivia Young",
    question: "Can I use your service abroad?",
    text: "I will be traveling to Europe next month.",
  },
];
