import React, { useState } from "react";
import {
  FaHome,
  FaFileAlt,
  FaChartBar,
  FaStethoscope,
  FaMedkit,
  FaUsers,
} from "react-icons/fa";
import { MdOutlineLeaderboard } from "react-icons/md";
import { FaBook } from "react-icons/fa6";
import { RiAdminFill } from "react-icons/ri";
import { MdOutlineAnalytics } from "react-icons/md";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LuNotebook } from "react-icons/lu";
import { SlCreditCard } from "react-icons/sl";
import { FaFileCircleQuestion } from "react-icons/fa6";
import { MdPlaylistAddCheck } from "react-icons/md";
import { MdOutlinePayments } from "react-icons/md";
import {
  GraduationCap,
  Component,
  ChartColumnStacked,
  BookOpenCheck,
  FileDown 
} from "lucide-react";
const SideBarAdmin = () => {
  const [activeTab, setActiveTab] = useState("analytics");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const sidebarItems = [
    {
      id: "analytics",
      label: "Analytics",
      icon: MdOutlineAnalytics,
      path: "/admin/analytics",
    },
    {
      id: "FreeUsers",
      label: "Free Users",
      icon: FaUsers,
      path: "/admin/usersFree",
    },
    {
      id: "PayUsers",
      label: "Paying Users",
      icon: FaUsers,
      path: "/admin/usersPaying",
    },

    {
      id: "subscription",
      label: "Subscription Plans",
      icon: SlCreditCard,
      path: "/admin/subscription",
    },
    {
      id: "reportQuestions",
      label: "Report questions",
      icon: FaFileCircleQuestion,
      path: "/admin/report-questions",
    },
    {
      id: "explications",
      label: "Explications ",
      icon: MdPlaylistAddCheck,
      path: "/admin/explications ",
    },
    {
      id: "resumes",
      label: "Resumes ",
      icon: FaBook,
      path: "/admin/resumes",
    },
    {
      id: "demandesDePayements",
      label: "Demandes de Paiements",
      icon: MdOutlinePayments,
      path: "/admin/demandes-de-paiements",
    },
    {
      id: "leaderboard",
      label: "Leaderboard",
      icon: MdOutlineLeaderboard,
      path: "/admin/leaderboard",
    },
    {
      id: "semesters",
      label: "Semesters",
      icon: GraduationCap,
      path: "/admin/semesters",
    },
    {
      id: "module",
      label: "Module",
      icon: Component,
      path: "/admin/module",
    },
    {
      id: "categoriesOfModules",
      label: "Categories of Modules",
      icon: ChartColumnStacked,
      path: "/admin/categoriesOfModules",
    },
    {
      id: "examParYears",
      label: "Exam par years",
      icon: BookOpenCheck,
      path: "/admin/examParYears",
    },
    {
      id: "examCourses",
      label: "Exam par course",
      icon: BookOpenCheck,
      path: "/admin/examCourses",
    },
    {
      id: "importExamParYears",
      label: "Import exam par years",
      icon: FileDown,
      path: "/admin/importExamParYears",
    },
  ];

  const navigate = useNavigate();
  return (
    <motion.div
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      className={`relative z-10 ${
        sidebarOpen ? "w-64" : "w-20"
      } bg-white/80 backdrop-blur-sm border-r border-blue-200 shadow-lg transition-all duration-300 `}
    >
      {/* Navigation */}
      <nav className="p-4 space-y-2">
        {sidebarItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setActiveTab(item.id);
              navigate(item.path);
            }}
            className={`w-full flex items-center space-x-3 px-4 py-2 rounded-xl transition-all duration-300 ${
              activeTab === item.id
                ? "bg-gradient-to-r from-blue-500/20 to-blue-600/20 text-blue-700 border border-blue-300 shadow-sm"
                : "text-gray-600 hover:text-gray-900 hover:bg-blue-50"
            }`}
          >
            <item.icon className="text-xl flex-shrink-0" />
            {sidebarOpen && (
              <span className="font-medium text-left">{item.label}</span>
            )}
          </button>
        ))}
      </nav>
    </motion.div>
  );
};

export default SideBarAdmin;
