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
import { cn } from "../../lib/utils";
import {
  FiDownload,
  FiUserPlus,
  FiSearch,
  FiFilter,
  FiMail,
  FiPhone,
  FiCalendar,
  FiMoreVertical,
  FiChevronLeft,
  FiChevronRight,
  FiUsers,
  FiUserCheck,
  FiDollarSign,
  FiGift,
} from "react-icons/fi";
import { FaCrown } from "react-icons/fa6";
import NewUserForm from "./NewUserForm";
import { userService } from "../../services/userService";

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

  // Test API connection
  const testConnection = async () => {
    try {
      const result = await userService.testConnection();
      console.log("API connection test:", result);
    } catch (error) {
      console.error("API connection test failed:", error);
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

  // Filter users based on search term
  const filteredUsers = users.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
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
        <FiChevronLeft className="w-4 h-4" />
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
        <FiChevronRight className="w-4 h-4" />
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
            <Button variant="outline" size="sm" onClick={testConnection}>
              Test API
            </Button>
            <Button variant="outline" size="sm">
              <FiDownload className="w-4 h-4" />
              Export
            </Button>
            <Button
              size="sm"
              className="bg-black text-white hover:bg-gray-800"
              onClick={() => setShowNewUserForm(!showNewUserForm)}
            >
              <FiUserPlus className="w-4 h-4" />
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
                  <FiUsers className="w-6 h-6 text-blue-600" />
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
                  <FiGift className="w-6 h-6 text-gray-600" />
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
                  <FiDollarSign className="w-6 h-6 text-green-600" />
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
                  <FiUserCheck className="w-6 h-6 text-green-600" />
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
                <FiGift className="w-4 h-4" />
                Free Users ({stats.freeUsers || 0})
              </Button>
              <Button
                variant={activeTab === "paying" ? "default" : "outline"}
                onClick={() => handleTabChange("paying")}
                className="flex items-center gap-2"
              >
                <FiDollarSign className="w-4 h-4" />
                Paying Users ({stats.payingUsers || 0})
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Search and Filter */}
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search users by name, username or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <Button variant="outline" className="sm:w-auto">
                <FiFilter className="w-4 h-4" />
                Filters
              </Button>
            </div>
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
                <table className="w-full min-w-[800px]">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">
                        User
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">
                        Contact
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">
                        Plan
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">
                        Semester
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">
                        Register Date
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
                                ID: {user._id}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm">
                              <FiMail className="text-gray-400 flex-shrink-0 w-3.5 h-3.5" />
                              <span className="text-gray-700 truncate">
                                {user.email}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span
                            className={cn(
                              "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
                              getPlanBadgeColor(user.plan)
                            )}
                          >
                            {user.plan}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span
                            className={cn(
                              "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
                              getStatusBadgeColor(user.isAactive)
                            )}
                          >
                            {user.isAactive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-sm text-gray-700">
                            {user.semester || "N/A"}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <FiCalendar className="text-gray-400 flex-shrink-0 w-3.5 h-3.5" />
                            <span className="text-gray-700">
                              {new Date(user.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <button className="text-gray-400 hover:text-gray-600 transition-colors">
                            <FiMoreVertical className="w-4 h-4" />
                          </button>
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
    </div>
  );
};

export default UsersWithTabs;
