import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaUser,
  FaTrophy,
  FaClock,
  FaPlay,
  FaUsers,
  FaGraduationCap,
  FaCalendarAlt,
  FaFileAlt,
  FaStethoscope,
  FaMedkit,
  FaBrain,
  FaHeart,
  FaEye,
  FaBone,
  FaCheck,
  FaStar,
  FaChartLine,
  FaFilter,
  FaDownload,
} from "react-icons/fa";

const Dashboard = () => {
  const navigate = useNavigate();

  // Course data based on the uploaded images
  const courses = [
    {
      id: "nephro-uro",
      name: "Néphrologie/uro",
      img: "https://res.cloudinary.com/void-elsan/image/upload/f_auto/q_90/v1/inline-images/nephrologie-%28personnalise%29.jpg?_a=BAAAV6Bs", // kidney emoji
      difficulty: "hard",
      progress: 0,
      color: "from-blue-500 to-indigo-500",
      bgColor: "bg-blue-600",
      exams: [
        { name: "Amylose", questions: 11, completed: 0 },
        { name: "Intro néphrologie", questions: 2, completed: 0 },
        { name: "Nephro héréditaire", questions: 35, completed: 0 },
        { name: "Nephro diabétique", questions: 40, completed: 0 },
        { name: "Nephro lupique", questions: 30, completed: 0 },
        {
          name: "Glomérulonéphrite extra capillaire",
          questions: 19,
          completed: 0,
        },
        { name: "Lgm", questions: 20, completed: 0 },
        { name: "HSF", questions: 20, completed: 0 },
      ],
    },
    {
      id: "med-legal",
      name: "Med legal-éthique-travail-...",
      img: "⚖️", // scales emoji
      difficulty: "medium",
      progress: 0,
      color: "from-teal-500 to-blue-500",
      bgColor: "bg-teal-600",
    },
    {
      id: "synthese",
      name: "Synthèse thérapeutique",
      img: "💊", // pill emoji
      difficulty: "medium",
      progress: 0,
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-500",
    },
    {
      id: "sante-publique",
      name: "Santé publique",
      img: "📊", // chart emoji
      difficulty: "medium",
      progress: 0,
      color: "from-indigo-500 to-purple-500",
      bgColor: "bg-indigo-600",
    },
  ];

  // Leaderboard data based on uploaded images
  const leaderboard = [
    {
      rank: 1,
      user: "Tired",
      level: "Level 707",
      percentage: 80,
      points: 70680,
    },
    { rank: 2, user: "N.A", level: "Level 527", percentage: 0, points: 52600 },
    {
      rank: 3,
      user: "scarface",
      level: "Level 507",
      percentage: 30,
      points: 50630,
    },
    {
      rank: 4,
      user: "we r cheating",
      level: "Level 506",
      percentage: 80,
      points: 50580,
    },
    {
      rank: 5,
      user: "objectif validation",
      level: "Level 398",
      percentage: 90,
      points: 39790,
    },
  ];

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "hard":
        return "bg-red-500 text-white";
      case "medium":
        return "bg-blue-500 text-white";
      case "easy":
        return "bg-green-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const handleCourseClick = (courseId) => {
    navigate(`/dashboard/subjects/${courseId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-6">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-blue-100 rounded-full opacity-30 animate-pulse"></div>
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-teal-100 rounded-full opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-blue-200 rounded-full opacity-25 animate-pulse delay-500"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 flex justify-between items-center mb-8">
        <div className="flex items-center space-x-4">
          <h1 className="text-3xl font-bold text-gray-900">
            Dashboard <span className="text-blue-600">S10 med</span>
          </h1>
        </div>
        <div className="flex items-center space-x-4">
          <select className="bg-white text-gray-900 px-4 py-2 rounded-lg border border-blue-200 shadow-sm">
            <option>S10 med</option>
          </select>
          <div className="text-gray-900 font-semibold">YK</div>
        </div>
      </div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-3 space-y-8">
          {/* Courses Section */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-6">Courses</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {courses.map((course) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.02 }}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl border border-blue-100 shadow-lg p-6 cursor-pointer hover:shadow-xl hover:border-blue-300 transition-all duration-300"
                  onClick={() => handleCourseClick(course.id)}
                >
                  {/* Course Icon and Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={`w-16 h-16 ${course.bgColor} rounded-2xl flex items-center justify-center text-2xl shadow-lg`}
                    >
                      <img src={course.img} alt={course.name} className="w-16 h-16" />
                      {course.img}
                    </div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(
                          course.difficulty
                        )}`}
                      >
                        {course.difficulty}
                      </span>
                    </div>
                  </div>

                  {/* Course Title */}
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {course.name}
                  </h3>

                  {/* Progress */}
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="flex-1 bg-blue-100 rounded-full h-2">
                      <div
                        className={`bg-gradient-to-r ${course.color} h-2 rounded-full transition-all duration-300`}
                        style={{ width: `${course.progress}%` }}
                      ></div>
                    </div>
                    <span className="text-gray-600 text-sm">
                      {course.progress}%
                    </span>
                  </div>

                  {/* Course Stats */}
                  <div className="text-gray-600 text-sm">
                    0 / {course.exams ? course.exams.length : 8} Questions
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Rankers Section */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-blue-100 shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Rankers</h2>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-gray-600 text-sm border-b border-blue-100">
                    <th className="text-left py-3">Rank</th>
                    <th className="text-left py-3">User</th>
                    <th className="text-left py-3">Level Percentage</th>
                    <th className="text-left py-3">Points</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((player) => (
                    <tr key={player.rank} className="border-b border-blue-50">
                      <td className="py-4 text-gray-900 font-semibold">
                        {player.rank}.
                      </td>
                      <td className="py-4">
                        <div>
                          <div className="text-gray-900 font-semibold">
                            {player.user}
                          </div>
                          <div className="text-gray-600 text-sm">
                            {player.level}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 text-gray-900">
                        {player.percentage}%
                      </td>
                      <td className="py-4">
                        <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                          {player.points.toLocaleString()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
