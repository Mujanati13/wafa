import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { cn } from "../../lib/utils";
import {
  Download,
  UserPlus,
  Search,
  Filter,
  Mail,
  Phone,
  Calendar,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Users,
  UserCheck,
  DollarSign,
  Gift,
  Crown,
  Edit,
  Trash2,
  Eye,
  FileSpreadsheet,
  FileText,
  Shield,
  CheckCircle,
  CreditCard,
  GraduationCap,
  X,
} from "lucide-react";
import { TableFilters } from "../shared";
import NewUserForm from "./NewUserForm";
import { userService } from "../../services/userService";
import { Badge } from "../ui/badge";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "sonner";

const studentYears = [
  { value: "1", label: "1ère année" },
  { value: "2", label: "2ème année" },
  { value: "3", label: "3ème année" },
  { value: "4", label: "4ème année" },
  { value: "5", label: "5ème année" },
  { value: "6", label: "6ème année" },
];

const UsersWithTabs = () => {
  const [activeTab, setActiveTab] = useState("free"); // "free" or "paying"
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showNewUserForm, setShowNewUserForm] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({});
  const [pagination, setPagination] = useState({});
  const [exporting, setExporting] = useState(false);

  // Dialog states
  const [selectedUser, setSelectedUser] = useState(null);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [actionLoading, setActionLoading] = useState(false);

  // New filter states
  const [studentYear, setStudentYear] = useState("all");
  const [startDate, setStartDate] = useState(undefined);
  const [endDate, setEndDate] = useState(undefined);
  const [paymentStartDate, setPaymentStartDate] = useState(undefined);
  const [paymentEndDate, setPaymentEndDate] = useState(undefined);

  // Fetch users based on active tab
  const fetchUsers = async () => {
    setLoading(true);
    try {
      let data;
      if (activeTab === "free") {
        data = await userService.getFreeUsers(currentPage, itemsPerPage);
      } else {
        data = await userService.getPayingUsers(currentPage, itemsPerPage);
      }

      if (data.success) {
        setUsers(data.data.users);
        setPagination(data.data.pagination);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch user statistics
  const fetchStats = async () => {
    try {
      const data = await userService.getUserStats();

      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [activeTab, currentPage]);

  useEffect(() => {
    fetchStats();
  }, []);

  // Export to CSV
  const handleExportCSV = async () => {
    setExporting(true);
    try {
      // Fetch all users for export
      const response = await userService.getAllUsers(1, 10000);
      if (!response.success) {
        throw new Error("Failed to fetch users");
      }

      const allUsers = response.data.users;
      const headers = ["Nom", "Email", "Plan", "Statut", "Date d'inscription"];
      const csvContent = [
        headers.join(","),
        ...allUsers.map((user) =>
          [
            `"${user.name || user.username || ""}"`,
            `"${user.email}"`,
            `"${user.plan || "Free"}"`,
            `"${user.isAactive ? "Actif" : "Inactif"}"`,
            `"${new Date(user.createdAt).toLocaleDateString("fr-FR")}"`,
          ].join(",")
        ),
      ].join("\n");

      const blob = new Blob(["\ufeff" + csvContent], {
        type: "text/csv;charset=utf-8;",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `utilisateurs_${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting CSV:", error);
      alert("Erreur lors de l'exportation CSV");
    } finally {
      setExporting(false);
    }
  };

  // Export to PDF
  const handleExportPDF = async () => {
    setExporting(true);
    try {
      // Fetch all users for export
      const response = await userService.getAllUsers(1, 10000);
      if (!response.success) {
        throw new Error("Failed to fetch users");
      }

      const allUsers = response.data.users;
      const doc = new jsPDF();

      // Title
      doc.setFontSize(20);
      doc.setTextColor(40, 40, 40);
      doc.text("Liste des Utilisateurs - WAFA", 14, 20);

      // Subtitle with date
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Généré le ${new Date().toLocaleDateString("fr-FR")} à ${new Date().toLocaleTimeString("fr-FR")}`, 14, 28);

      // Stats summary
      doc.setFontSize(11);
      doc.setTextColor(60);
      doc.text(`Total: ${allUsers.length} utilisateurs | Gratuit: ${allUsers.filter(u => u.plan === "Free").length} | Premium: ${allUsers.filter(u => u.plan !== "Free").length}`, 14, 36);

      // Table
      autoTable(doc, {
        startY: 42,
        head: [["Nom", "Email", "Plan", "Statut", "Date d'inscription"]],
        body: allUsers.map((user) => [
          user.name || user.username || "-",
          user.email,
          user.plan || "Free",
          user.isAactive ? "Actif" : "Inactif",
          new Date(user.createdAt).toLocaleDateString("fr-FR"),
        ]),
        styles: {
          fontSize: 9,
          cellPadding: 3,
        },
        headStyles: {
          fillColor: [99, 102, 241], // Indigo
          textColor: [255, 255, 255],
          fontStyle: "bold",
        },
        alternateRowStyles: {
          fillColor: [249, 250, 251],
        },
        columnStyles: {
          0: { cellWidth: 35 },
          1: { cellWidth: 55 },
          2: { cellWidth: 25 },
          3: { cellWidth: 20 },
          4: { cellWidth: 30 },
        },
      });

      // Footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(
          `Page ${i} sur ${pageCount}`,
          doc.internal.pageSize.getWidth() / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: "center" }
        );
      }

      doc.save(`utilisateurs_${new Date().toISOString().split("T")[0]}.pdf`);
    } catch (error) {
      console.error("Error exporting PDF:", error);
      alert("Erreur lors de l'exportation PDF");
    } finally {
      setExporting(false);
    }
  };

  const getPlanBadgeColor = (plan) => {
    switch (plan) {
      case "Premium":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "Enterprise":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "Student Discount":
        return "bg-green-100 text-green-800 border-green-200";
      case "Free":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  const getStatusBadgeColor = (isActive) => {
    return isActive
      ? "bg-green-100 text-green-800 border-green-200"
      : "bg-red-100 text-red-800 border-red-200";
  };

  // Filter users based on search term and filters
  const filteredUsers = users.filter((user) => {
    // Search filter
    const matchesSearch =
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());

    // Student year filter
    const matchesYear = studentYear === "all" || user.currentYear === studentYear;

    // Registration date filter
    const userRegDate = new Date(user.createdAt);
    const matchesRegDate =
      (!startDate || userRegDate >= startDate) &&
      (!endDate || userRegDate <= endDate);

    // Payment date filter (only for paying users)
    let matchesPaymentDate = true;
    if (activeTab === "paying" && user.paymentDate) {
      const userPayDate = new Date(user.paymentDate);
      matchesPaymentDate =
        (!paymentStartDate || userPayDate >= paymentStartDate) &&
        (!paymentEndDate || userPayDate <= paymentEndDate);
    }

    return matchesSearch && matchesYear && matchesRegDate && matchesPaymentDate;
  });

  const handleClearFilters = () => {
    setSearchTerm("");
    setStudentYear("all");
    setStartDate(undefined);
    setEndDate(undefined);
    setPaymentStartDate(undefined);
    setPaymentEndDate(undefined);
  };

  const activeFilterCount =
    (searchTerm ? 1 : 0) +
    (studentYear !== "all" ? 1 : 0) +
    (startDate || endDate ? 1 : 0) +
    (paymentStartDate || paymentEndDate ? 1 : 0);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  // View user details
  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowViewDialog(true);
  };

  // Open edit dialog
  const handleEditUser = (user) => {
    setSelectedUser(user);
    setEditFormData({
      name: user.name || "",
      email: user.email || "",
      username: user.username || "",
      currentYear: user.currentYear || "",
      plan: user.plan || "Free",
      isAactive: user.isAactive ?? true,
    });
    setShowEditDialog(true);
  };

  // Update user
  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    setActionLoading(true);
    try {
      await userService.updateUser(selectedUser._id, editFormData);
      toast.success("Utilisateur mis à jour avec succès");
      setShowEditDialog(false);
      setSelectedUser(null);
      fetchUsers(); // Refresh list
    } catch (error) {
      toast.error("Erreur lors de la mise à jour");
      console.error("Update error:", error);
    } finally {
      setActionLoading(false);
    }
  };

  // Open delete confirmation
  const handleDeleteClick = (user) => {
    setSelectedUser(user);
    setShowDeleteDialog(true);
  };

  // Confirm delete user
  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    setActionLoading(true);
    try {
      await userService.deleteUser(selectedUser._id);
      toast.success("Utilisateur supprimé avec succès");
      setShowDeleteDialog(false);
      setSelectedUser(null);
      fetchUsers(); // Refresh list
      fetchStats(); // Refresh stats
    } catch (error) {
      toast.error("Erreur lors de la suppression");
      console.error("Delete error:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const renderPaginationButtons = () => {
    if (!pagination.totalPages || pagination.totalPages <= 1) return null;

    const buttons = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(
      1,
      pagination.currentPage - Math.floor(maxVisiblePages / 2)
    );
    let endPage = Math.min(
      pagination.totalPages,
      startPage + maxVisiblePages - 1
    );

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Previous button
    buttons.push(
      <Button
        key="prev"
        variant="outline"
        size="sm"
        onClick={() => handlePageChange(pagination.currentPage - 1)}
        disabled={!pagination.hasPrevPage}
        className="flex items-center gap-1"
      >
        <ChevronLeft className="w-4 h-4" />
        Previous
      </Button>
    );

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <Button
          key={i}
          variant={pagination.currentPage === i ? "default" : "outline"}
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
        onClick={() => handlePageChange(pagination.currentPage + 1)}
        disabled={!pagination.hasNextPage}
        className="flex items-center gap-1"
      >
        Next
        <ChevronRight className="w-4 h-4" />
      </Button>
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
              User Management
            </h1>
            <p className="text-gray-600 mt-1">
              Manage user accounts, subscriptions, and access
            </p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" disabled={exporting}>
                  <Download className="w-4 h-4" />
                  {exporting ? "Exportation..." : "Export"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleExportCSV} className="gap-2 cursor-pointer">
                  <FileSpreadsheet className="w-4 h-4" />
                  Exporter en CSV
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleExportPDF} className="gap-2 cursor-pointer">
                  <FileText className="w-4 h-4" />
                  Exporter en PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              size="sm"
              className="bg-black text-white hover:bg-gray-800"
              onClick={() => setShowNewUserForm(!showNewUserForm)}
            >
              <UserPlus className="w-4 h-4" />
              Add
            </Button>
          </div>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Users Card */}
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Users
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.totalUsers || 0}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Free Users Card */}
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Free Users
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.freeUsers || 0}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {stats.totalUsers
                      ? ((stats.freeUsers / stats.totalUsers) * 100).toFixed(1)
                      : 0}
                    % of total
                  </p>
                </div>
                <div className="p-3 bg-gray-100 rounded-lg">
                  <Gift className="w-6 h-6 text-gray-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Paying Users Card */}
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Paying Users
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.payingUsers || 0}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {stats.totalUsers
                      ? ((stats.payingUsers / stats.totalUsers) * 100).toFixed(
                        1
                      )
                      : 0}
                    % of total
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active Users Card */}
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Active Users
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.activeUsers || 0}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {stats.totalUsers
                      ? ((stats.activeUsers / stats.totalUsers) * 100).toFixed(
                        1
                      )
                      : 0}
                    % of total
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <UserCheck className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tab Navigation */}
        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex space-x-1">
              <Button
                variant={activeTab === "free" ? "default" : "outline"}
                onClick={() => handleTabChange("free")}
                className="flex items-center gap-2"
              >
                <Gift className="w-4 h-4" />
                Free Users ({stats.freeUsers || 0})
              </Button>
              <Button
                variant={activeTab === "paying" ? "default" : "outline"}
                onClick={() => handleTabChange("paying")}
                className="flex items-center gap-2"
              >
                <DollarSign className="w-4 h-4" />
                Paying Users ({stats.payingUsers || 0})
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Search and Filter */}
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <TableFilters
              searchValue={searchTerm}
              onSearchChange={setSearchTerm}
              searchPlaceholder="Rechercher par nom, username ou email..."
              startDate={startDate}
              endDate={endDate}
              onDateChange={({ startDate: sd, endDate: ed }) => {
                setStartDate(sd);
                setEndDate(ed);
              }}
              showDateFilter={true}
              additionalFilters={[
                {
                  key: "studentYear",
                  label: "Année d'étude",
                  value: studentYear,
                  onChange: setStudentYear,
                  options: studentYears,
                },
                ...(activeTab === "paying" ? [{
                  key: "paymentDate",
                  label: "Date de paiement",
                  value: paymentStartDate ? "custom" : "all",
                  onChange: (val) => {
                    if (val === "all") {
                      setPaymentStartDate(undefined);
                      setPaymentEndDate(undefined);
                    }
                  },
                  options: [
                    { value: "last7days", label: "7 derniers jours" },
                    { value: "last30days", label: "30 derniers jours" },
                    { value: "last90days", label: "90 derniers jours" },
                  ],
                }] : [])
              ]}
              onClearFilters={handleClearFilters}
              activeFilterCount={activeFilterCount}
            />
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-bold">
              {activeTab === "free" ? "Free Users" : "Paying Users"} (
              {filteredUsers.length})
            </CardTitle>
            <CardDescription>
              {activeTab === "free"
                ? "Users with free plan access"
                : "Users with premium subscriptions"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px]">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">
                        Utilisateur
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">
                        Contact
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">
                        <div className="flex items-center gap-1">
                          <GraduationCap className="w-4 h-4" />
                          Année
                        </div>
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">
                        Statut
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">
                        Semestre
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">
                        Inscription
                      </th>
                      {activeTab === "paying" && (
                        <>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">
                            <div className="flex items-center gap-1">
                              <CheckCircle className="w-4 h-4 text-green-600" />
                              Approbation
                            </div>
                          </th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">
                            <div className="flex items-center gap-1">
                              <CreditCard className="w-4 h-4 text-blue-600" />
                              Paiement
                            </div>
                          </th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">
                            <div className="flex items-center gap-1">
                              <CreditCard className="w-4 h-4 text-purple-600" />
                              Mode de paiement
                            </div>
                          </th>
                        </>
                      )}
                      <th className="text-left py-3 px-4 font-medium text-gray-700">
                        <div className="flex items-center gap-1">
                          <Shield className="w-4 h-4 text-purple-600" />
                          CGU
                        </div>
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr
                        key={user._id}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-gray-600 font-medium text-sm">
                                {user.name
                                  ? user.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                  : user.username?.charAt(0).toUpperCase() ||
                                  "U"}
                              </span>
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="font-medium text-gray-900 truncate">
                                {user.name || user.username}
                              </div>
                              <div className="text-sm text-gray-500">
                                @{user.username}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="text-gray-400 flex-shrink-0 w-3.5 h-3.5" />
                              <span className="text-gray-700 truncate">
                                {user.email}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            {user.currentYear ? `${user.currentYear}ème` : '-'}
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          <span
                            className={cn(
                              "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
                              getStatusBadgeColor(user.isAactive)
                            )}
                          >
                            {user.isAactive ? "Actif" : "Inactif"}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-sm text-gray-700">
                            {user.semesters?.map((s) => s).join(", ") || "N/A"}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="text-gray-400 flex-shrink-0 w-3.5 h-3.5" />
                            <span className="text-gray-700 text-sm">
                              {new Date(user.createdAt).toLocaleDateString("fr-FR")}
                            </span>
                          </div>
                        </td>
                        {activeTab === "paying" && (
                          <>
                            <td className="py-4 px-4">
                              {user.approvalDate ? (
                                <div className="flex items-center gap-2">
                                  <CheckCircle className="text-green-500 w-4 h-4" />
                                  <span className="text-sm text-gray-700">
                                    {new Date(user.approvalDate).toLocaleDateString("fr-FR")}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-sm text-gray-400">-</span>
                              )}
                            </td>
                            <td className="py-4 px-4">
                              {user.paymentDate ? (
                                <div className="flex items-center gap-2">
                                  <CreditCard className="text-blue-500 w-4 h-4" />
                                  <span className="text-sm text-gray-700">
                                    {new Date(user.paymentDate).toLocaleDateString("fr-FR")}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-sm text-gray-400">-</span>
                              )}
                            </td>
                            <td className="py-4 px-4">
                              {user.paymentMethod ? (
                                <Badge
                                  variant="outline"
                                  className={
                                    user.paymentMethod === 'PayPal'
                                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                                      : user.paymentMethod === 'Bank Transfer'
                                        ? 'bg-green-50 text-green-700 border-green-200'
                                        : 'bg-purple-50 text-purple-700 border-purple-200'
                                  }
                                >
                                  {user.paymentMethod}
                                </Badge>
                              ) : (
                                <span className="text-sm text-gray-400">-</span>
                              )}
                            </td>
                          </>
                        )}
                        <td className="py-4 px-4">
                          {user.consentAcceptedAt ? (
                            <Badge className="bg-green-100 text-green-700 border-green-200 gap-1">
                              <Shield className="w-3 h-3" />
                              Accepté
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-gray-400 gap-1">
                              <Shield className="w-3 h-3" />
                              Non
                            </Badge>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="text-gray-400 hover:text-gray-600 transition-colors">
                                <MoreVertical className="w-4 h-4" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                className="flex items-center gap-2 cursor-pointer"
                                onClick={() => handleViewUser(user)}
                              >
                                <Eye className="w-4 h-4" />
                                Voir
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="flex items-center gap-2 cursor-pointer"
                                onClick={() => handleEditUser(user)}
                              >
                                <Edit className="w-4 h-4" />
                                Modifier
                              </DropdownMenuItem>
                              {user.consentAcceptedAt && (
                                <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                                  <FileText className="w-4 h-4" />
                                  Voir consentement
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="flex items-center gap-2 text-red-600 cursor-pointer"
                                onClick={() => handleDeleteClick(user)}
                              >
                                <Trash2 className="w-4 h-4" />
                                Supprimer
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>

          {/* Pagination Footer */}
          {pagination.totalPages > 1 && (
            <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-4 border-t bg-gray-50/50">
              <div className="text-sm text-gray-600">
                Showing {(pagination.currentPage - 1) * itemsPerPage + 1} to{" "}
                {Math.min(
                  pagination.currentPage * itemsPerPage,
                  pagination.totalUsers
                )}{" "}
                of {pagination.totalUsers} results
              </div>
              <div className="flex items-center gap-2">
                {renderPaginationButtons()}
              </div>
            </CardFooter>
          )}
        </Card>
      </div>

      {showNewUserForm && (
        <NewUserForm setShowNewUserForm={setShowNewUserForm} />
      )}

      {/* View User Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Détails de l'utilisateur
            </DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-500">Nom</Label>
                  <p className="font-medium">{selectedUser.name || selectedUser.username || "-"}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Username</Label>
                  <p className="font-medium">@{selectedUser.username}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Email</Label>
                  <p className="font-medium">{selectedUser.email}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Plan</Label>
                  <Badge className={getPlanBadgeColor(selectedUser.plan)}>
                    {selectedUser.plan || "Free"}
                  </Badge>
                </div>
                <div>
                  <Label className="text-gray-500">Statut</Label>
                  <Badge className={getStatusBadgeColor(selectedUser.isAactive)}>
                    {selectedUser.isAactive ? "Actif" : "Inactif"}
                  </Badge>
                </div>
                <div>
                  <Label className="text-gray-500">Année d'étude</Label>
                  <p className="font-medium">{selectedUser.currentYear ? `${selectedUser.currentYear}ème année` : "-"}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Date d'inscription</Label>
                  <p className="font-medium">{new Date(selectedUser.createdAt).toLocaleDateString("fr-FR")}</p>
                </div>
                <div>
                  <Label className="text-gray-500">CGU accepté</Label>
                  <p className="font-medium">{selectedUser.consentAcceptedAt ? "Oui" : "Non"}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowViewDialog(false)}>Fermer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5" />
              Modifier l'utilisateur
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Nom</Label>
              <Input
                id="edit-name"
                value={editFormData.name || ""}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={editFormData.email || ""}
                onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-plan">Plan</Label>
              <select
                id="edit-plan"
                className="w-full p-2 border rounded-md"
                value={editFormData.plan || "Free"}
                onChange={(e) => setEditFormData({ ...editFormData, plan: e.target.value })}
              >
                <option value="Free">Free</option>
                <option value="Premium">Premium</option>
                <option value="Enterprise">Enterprise</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="edit-active"
                checked={editFormData.isAactive ?? true}
                onChange={(e) => setEditFormData({ ...editFormData, isAactive: e.target.checked })}
              />
              <Label htmlFor="edit-active">Actif</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>Annuler</Button>
            <Button onClick={handleUpdateUser} disabled={actionLoading}>
              {actionLoading ? "Mise à jour..." : "Enregistrer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="w-5 h-5" />
              Confirmer la suppression
            </DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer l'utilisateur <strong>{selectedUser?.name || selectedUser?.username}</strong> ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Annuler</Button>
            <Button variant="destructive" onClick={handleDeleteUser} disabled={actionLoading}>
              {actionLoading ? "Suppression..." : "Supprimer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsersWithTabs;
