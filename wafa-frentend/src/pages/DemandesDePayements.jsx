import { useState } from "react";
import { motion } from "framer-motion";
import { Trash2, Check, CreditCard, ChevronLeft, ChevronRight, CheckCircle2, Clock, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PageHeader } from "@/components/shared";

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
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50 to-slate-100 p-6">
      <div className="w-full space-y-6">
        {/* Header with gradient background */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-lg bg-gradient-to-r from-amber-600 to-orange-500 p-6 text-white shadow-lg"
        >
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Demandes de Payements
            </h1>
            <p className="text-amber-100">
              Gérez et traitez les demandes de paiement des utilisateurs
            </p>
          </div>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {/* Total Requests */}
          <Card className="shadow-lg border-0 hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase">
                    Total Demandes
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {demandes.length}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Payment requests
                  </p>
                </div>
                <Clock className="w-8 h-8 text-amber-600" />
              </div>
            </CardContent>
          </Card>

          {/* Pending Requests */}
          <Card className="shadow-lg border-0 hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase">
                    En attente
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {demandes.length}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Awaiting approval
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          {/* Total Users */}
          <Card className="shadow-lg border-0 hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase">
                    Utilisateurs
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {new Set(demandes.map((d) => d.username)).size}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Unique users
                  </p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Table Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 border-b">
              <CardTitle className="text-2xl font-bold text-gray-900">
                Liste des Demandes
              </CardTitle>
              <CardDescription className="text-gray-600">
                Tableau des demandes de paiement des utilisateurs
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left py-4 px-6 font-semibold text-gray-700">
                        Utilisateur
                      </th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-700">
                        Email
                      </th>
                      <th className="text-center py-4 px-6 font-semibold text-gray-700">
                        Enregistré
                      </th>
                      <th className="text-center py-4 px-6 font-semibold text-gray-700">
                        Mode de Paiement
                      </th>
                      <th className="text-center py-4 px-6 font-semibold text-gray-700">
                        Semestres
                      </th>
                      <th className="text-right py-4 px-6 font-semibold text-gray-700">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentDemandes.map((d, index) => (
                      <motion.tr
                        key={d.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="border-b border-gray-100 hover:bg-amber-50/50 transition-colors"
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={d.profileImg} alt={d.name} />
                              <AvatarFallback>
                                {d.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold text-gray-900">
                                {d.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                @{d.username}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-gray-600">{d.email}</td>
                        <td className="py-4 px-6 text-center">
                          <Badge variant="outline" className="text-xs">
                            {d.registered}
                          </Badge>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <Badge className="bg-blue-100 text-blue-800 border-0">
                            <CreditCard className="w-3 h-3 mr-1" />
                            {d.paymentMode}
                          </Badge>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <div className="flex flex-wrap gap-1 justify-center">
                            {d.semesters.map((s, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {s}
                              </Badge>
                            ))}
                          </div>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <CheckCircle2 className="h-4 w-4 text-green-600 hover:text-green-700" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem className="flex items-center gap-2">
                                  <Check className="h-4 w-4" />
                                  Approver
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4 text-gray-600 hover:text-red-600" />
                            </Button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>

            {/* Pagination Footer */}
            {totalPages > 1 && (
              <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-4 border-t bg-gradient-to-r from-amber-50 to-orange-50 py-4">
                <div className="text-sm text-gray-600 font-medium">
                  Affichage {startIndex + 1} à{" "}
                  {Math.min(endIndex, demandes.length)} sur {demandes.length}
                </div>
                <div className="flex items-center gap-1">
                  {renderPaginationButtons()}
                </div>
              </CardFooter>
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default DemandesDePayements;
