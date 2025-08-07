import React, { useState } from "react";
import {
  FaHome,
  FaFileAlt,
  FaChartBar,
  FaStethoscope,
  FaMedkit,
  FaUsers,
} from "react-icons/fa";
import { RiAdminFill } from "react-icons/ri";
import { MdOutlineAnalytics } from "react-icons/md";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LuNotebook } from "react-icons/lu";
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
      id: "users",
      label: "User Management",
      icon: FaUsers,
      path: "/admin/users",
    },

    {
      id: "subscription",
      label: "Subscription Plans",
      icon: LuNotebook,
      path: "/admin/subscription",
    },
    {
      id: "exam",
      label: "Exam Management",
      icon: LuNotebook,
      path: "/admin/exam",
    },
  ];

  //
  //
  // Content Library
  // Analytics
  // Reports
  // Settings
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
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
              activeTab === item.id
                ? "bg-gradient-to-r from-blue-500/20 to-blue-600/20 text-blue-700 border border-blue-300 shadow-sm"
                : "text-gray-600 hover:text-gray-900 hover:bg-blue-50"
            }`}
          >
            <item.icon className="text-xl flex-shrink-0" />
            {sidebarOpen && <span className="font-medium">{item.label}</span>}
          </button>
        ))}
      </nav>
    </motion.div>
  );
};

export default SideBarAdmin;
