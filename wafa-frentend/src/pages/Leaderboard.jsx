import React, { useState } from "react";
import {
  FiSearch,
  FiFilter,
  FiArrowUp,
  FiArrowDown,
  FiAward,
  FiUsers,
  FiTrendingUp,
} from "react-icons/fi";

const leaderboardData = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  username: `user${i + 1}`,
  name: `Name ${i + 1}`,
  points: 1000 - i * 23 + (i % 3) * 50,
  bluePoints: 200 + ((i * 7) % 100),
  rank: i + 1,
  year: ["2025", "2024", "2023"][i % 3],
  studentYear: ["1st", "2nd", "3rd", "4th"][i % 4],
  period: ["All", "Monthly", "Daily"][i % 3],
}));

const years = ["2025", "2024", "2023"];
const studentYears = ["1st", "2nd", "3rd", "4th"];
const periods = ["All", "Monthly", "Daily"];

const Leaderboard = () => {
  const [filter, setFilter] = useState("All");
  const [year, setYear] = useState("All");
  const [studentYear, setStudentYear] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  // Filter logic
  const filteredData = leaderboardData.filter(
    (user) =>
      (filter === "All" || user.period === filter) &&
      (year === "All" || user.year === year) &&
      (studentYear === "All" || user.studentYear === studentYear) &&
      (user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Analytics
  const totalUsers = leaderboardData.length;
  const topPoints = Math.max(...leaderboardData.map((u) => u.points));
  const avgPoints = Math.round(
    leaderboardData.reduce((acc, u) => acc + u.points, 0) /
      leaderboardData.length
  );
  const bluePointsSum = leaderboardData.reduce(
    (acc, u) => acc + u.bluePoints,
    0
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="w-full space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Leaderboard</h1>
            <p className="text-gray-600 mt-1">
              View top students and their achievements
            </p>
          </div>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="shadow-sm bg-white rounded-lg p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{totalUsers}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <FiUsers className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="shadow-sm bg-white rounded-lg p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Top Points</p>
              <p className="text-2xl font-bold text-gray-900">{topPoints}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <FiAward className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="shadow-sm bg-white rounded-lg p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg. Points</p>
              <p className="text-2xl font-bold text-gray-900">{avgPoints}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <FiTrendingUp className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        {/* Search & Filter Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by name or username..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-3 py-2 rounded-lg border border-gray-300 bg-gray-50"
              >
                {periods.map((tab) => (
                  <option key={tab} value={tab}>
                    {tab}
                  </option>
                ))}
              </select>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="px-3 py-2 rounded-lg border border-gray-300 bg-gray-50"
              >
                <option value="All">All Years</option>
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
              <select
                value={studentYear}
                onChange={(e) => setStudentYear(e.target.value)}
                className="px-3 py-2 rounded-lg border border-gray-300 bg-gray-50"
              >
                <option value="All">All Student Years</option>
                {studentYears.map((sy) => (
                  <option key={sy} value={sy}>
                    {sy}
                  </option>
                ))}
              </select>
              <button className="px-3 py-2 rounded-lg border border-gray-300 bg-gray-50 flex items-center gap-2 text-gray-600">
                <FiFilter className="w-4 h-4" /> Filters
              </button>
            </div>
          </div>
        </div>

        {/* Leaderboard Table Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">
                    Id
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">
                    User Name
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">
                    Name
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">
                    Points
                  </th>
                  
                  <th className="text-left py-3 px-4 font-medium text-gray-700">
                    Rank
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-500">
                      No data found.
                    </td>
                  </tr>
                ) : (
                  filteredData.map((user) => (
                    <tr
                      key={user.id}
                      className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                        user.rank === 1 ? "bg-blue-50" : ""
                      }`}
                    >
                      <td className="py-4 px-4 text-gray-700 font-medium">
                        {user.id}
                      </td>
                      <td className="py-4 px-4 text-blue-700 font-semibold">
                        {user.username}
                      </td>
                      <td className="py-4 px-4">{user.name}</td>
                      <td className="py-4 px-4 font-bold text-gray-900">
                        {user.points}
                      </td>
                      
                      <td className="py-4 px-4 font-bold text-gray-900">
                        {user.rank}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
