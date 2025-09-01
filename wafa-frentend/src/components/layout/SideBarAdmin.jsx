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
  FileDown,
  ChevronDown,
  ChevronRight,
  FileQuestionMark,
  ImagePlus,
  Blocks,
} from "lucide-react";
const SideBarAdmin = () => {
  const [activeTab, setActiveTab] = useState("analytics");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [openCategories, setOpenCategories] = useState({
    overview: false,
    users: false,
    content: false,
    payments: false,
    exams: false,
  });

  const sidebarCategories = [
    {
      id: "overview",
      label: "Overview",
      icon: MdOutlineAnalytics,
      items: [
        {
          id: "analytics",
          label: "Analytics",
          icon: MdOutlineAnalytics,
          path: "/admin/analytics",
        },
        {
          id: "leaderboard",
          label: "Leaderboard",
          icon: MdOutlineLeaderboard,
          path: "/admin/leaderboard",
        },
      ],
    },
    {
      id: "users",
      label: "Users",
      icon: FaUsers,
      items: [
        
        {
          id: "Users",
          label: "Users",
          icon: FaUsers,
          path: "/admin/users",
        },
      ],
    },
    {
      id: "content",
      label: "Content",
      icon: FaBook,
      items: [
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
          id: "importResumes",
          label: "Import Resumes ",
          icon: FileDown,
          path: "/admin/importResumes",
        },
        {
          id: "importExplications",
          label: "Import Explications ",
          icon: FileDown,
          path: "/admin/importExplications",
        },
        {
          id: "importImages",
          label: "Import Images ",
          icon: ImagePlus,
          path: "/admin/importImages",
        },
      ],
    },
    {
      id: "payments",
      label: "Payments",
      icon: SlCreditCard,
      items: [
        {
          id: "subscription",
          label: "Subscription Plans",
          icon: SlCreditCard,
          path: "/admin/subscription",
        },
        {
          id: "demandesDePayements",
          label: "Demandes de Paiements",
          icon: MdOutlinePayments,
          path: "/admin/demandes-de-paiements",
        },
      ],
    },
    {
      id: "exams",
      label: "Exams",
      icon: BookOpenCheck,
      items: [
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
          id: "createCategoriesForCourses",
          label: "Create Categories For Courses",
          icon: Blocks,
          path: "/admin/createCategoriesForCourses",
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
        {
          id: "importExamParCourse",
          label: "Import exam par course",
          icon: FileDown,
          path: "/admin/importExamParCourse",
        },
        {
          id: "addQuestions",
          label: "Add Questions",
          icon: FileQuestionMark,
          path: "/admin/addQuestions",
        },
      ],
    },
  ];

  const toggleCategory = (categoryId) => {
    setOpenCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  const navigate = useNavigate();
  return (
    <motion.div
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      className={`relative z-10 ${
        sidebarOpen ? "w-64" : "w-20"
      } bg-white/80 backdrop-blur-sm border-r border-blue-200 shadow-lg transition-all duration-300 overflow-y-scroll `}
    >
      {/* Navigation */}
      <nav className="p-4 space-y-2">
        {sidebarCategories.map((category) => (
          <div key={category.id}>
            <button
              onClick={() => toggleCategory(category.id)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-gray-700 hover:text-gray-900 hover:bg-blue-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <category.icon className="text-lg flex-shrink-0" />
                {sidebarOpen && (
                  <span className="text-sm font-semibold uppercase tracking-wide">
                    {category.label}
                  </span>
                )}
              </div>
              {sidebarOpen &&
                (openCategories[category.id] ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                ))}
            </button>
            {openCategories[category.id] && (
              <div className="mt-1 ml-2 border-l border-blue-100 pl-2 space-y-1">
                {category.items.map((item) => (
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
                      <span className="font-medium text-left">
                        {item.label}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </motion.div>
  );
};

export default SideBarAdmin;
