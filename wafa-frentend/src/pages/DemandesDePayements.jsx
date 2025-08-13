import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../components/ui/card";
import { AiOutlineDelete } from "react-icons/ai";
import { IoCheckmarkDoneCircle } from "react-icons/io5";

const DemandesDePayements = () => {
  // Sample data for demonstration
  const demandes = [
    {
      id: 1,
      profileImg: "https://randomuser.me/api/portraits/women/1.jpg",
      username: "sarahj",
      name: "Dr. Sarah Johnson",
      email: "sarah.johnson@email.com",
      registered: "2024-01-10",
      paymentMode: "Credit Card",
      semesters: ["Spring 2024", "Fall 2024"],
    },
    {
      id: 2,
      profileImg: "https://randomuser.me/api/portraits/men/2.jpg",
      username: "mikec",
      name: "Michael Chen",
      email: "michael.chen@email.com",
      registered: "2024-02-05",
      paymentMode: "PayPal",
      semesters: ["Spring 2024"],
    },
    {
      id: 3,
      profileImg: "https://randomuser.me/api/portraits/women/3.jpg",
      username: "emilyr",
      name: "Dr. Emily Rodriguez",
      email: "emily.rodriguez@email.com",
      registered: "2024-03-12",
      paymentMode: "Bank Transfer",
      semesters: ["Fall 2024"],
    },
    {
      id: 4,
      profileImg: "https://randomuser.me/api/portraits/women/1.jpg",
      username: "sarahj",
      name: "Dr. Sarah Johnson",
      email: "sarah.johnson@email.com",
      registered: "2024-01-10",
      paymentMode: "Credit Card",
      semesters: ["Spring 2024", "Fall 2024"],
    },
    {
      id: 5,
      profileImg: "https://randomuser.me/api/portraits/men/2.jpg",
      username: "mikec",
      name: "Michael Chen",
      email: "michael.chen@email.com",
      registered: "2024-02-05",
      paymentMode: "PayPal",
      semesters: ["Spring 2024"],
    },
    {
      id: 6,
      profileImg: "https://randomuser.me/api/portraits/women/3.jpg",
      username: "emilyr",
      name: "Dr. Emily Rodriguez",
      email: "emily.rodriguez@email.com",
      registered: "2024-03-12",
      paymentMode: "Bank Transfer",
      semesters: ["Fall 2024"],
    },
  ];

  // Pagination logic
  const [currentPage, setCurrentPage] = React.useState(1);
  const [itemsPerPage] = React.useState(5);
  const totalPages = Math.ceil(demandes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentDemandes = demandes.slice(startIndex, endIndex);

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
      <button
        key="prev"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex items-center gap-1 px-3 py-1 border rounded text-sm bg-white hover:bg-gray-100 disabled:opacity-50"
      >
        &lt; Prev
      </button>
    );
    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`min-w-[40px] px-3 py-1 border rounded text-sm ${
            currentPage === i
              ? "bg-black text-white"
              : "bg-white hover:bg-gray-100"
          }`}
        >
          {i}
        </button>
      );
    }
    // Next button
    buttons.push(
      <button
        key="next"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex items-center gap-1 px-3 py-1 border rounded text-sm bg-white hover:bg-gray-100 disabled:opacity-50"
      >
        Next &gt;
      </button>
    );
    return buttons;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="w-full space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Demandes de Payements
            </h1>
            <p className="text-gray-600 mt-1">
              Liste des demandes de payement des utilisateurs
            </p>
          </div>
        </div>

        {/* Table Section in Card */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Demandes</CardTitle>
            <CardDescription>Tableau des demandes de payement</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="py-3 px-4 text-left font-medium text-gray-700">
                      Id
                    </th>
                    <th className="py-3 px-4 text-left font-medium text-gray-700">
                      Image profile
                    </th>
                    <th className="py-3 px-4 text-left font-medium text-gray-700">
                      User name
                    </th>
                    <th className="py-3 px-4 text-left font-medium text-gray-700">
                      Name
                    </th>
                    <th className="py-3 px-4 text-left font-medium text-gray-700">
                      Email
                    </th>
                    <th className="py-3 px-4 text-left font-medium text-gray-700">
                      Registered date
                    </th>
                    <th className="py-3 px-4 text-left font-medium text-gray-700">
                      Mode de payement utilisé
                    </th>
                    <th className="py-3 px-4 text-left font-medium text-gray-700">
                      Semestres wanted
                    </th>
                    <th className="py-3 px-4 text-left font-medium text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentDemandes.map((d) => (
                    <tr
                      key={d.id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-4 px-4">{d.id}</td>
                      <td className="py-4 px-4">
                        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
                          <img
                            src={d.profileImg}
                            alt={d.name}
                            className="w-10 h-10 object-cover"
                          />
                        </div>
                      </td>
                      <td className="py-4 px-4 font-medium text-gray-900">
                        {d.username}
                      </td>
                      <td className="py-4 px-4 text-gray-700">{d.name}</td>
                      <td className="py-4 px-4 text-gray-700">{d.email}</td>
                      <td className="py-4 px-4 text-gray-700">
                        {d.registered}
                      </td>
                      <td className="py-4 px-4 text-gray-700">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-blue-100 text-blue-800 border-blue-200">
                          {d.paymentMode}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-gray-700">
                        {d.semesters.map((s, i) => (
                          <span
                            key={i}
                            className="inline-block bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs mr-1 mb-1"
                          >
                            {s}
                          </span>
                        ))}
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
          {/* Pagination Footer */}
          {totalPages > 1 && (
            <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-4 border-t bg-gray-50/50">
              <div className="text-sm text-gray-600">
                Showing {startIndex + 1} to{" "}
                {Math.min(endIndex, demandes.length)} of {demandes.length}{" "}
                results
              </div>
              <div className="flex items-center gap-2">
                {renderPaginationButtons()}
              </div>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
};

export default DemandesDePayements;
