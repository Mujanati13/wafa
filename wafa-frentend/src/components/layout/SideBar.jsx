import React, { useEffect, useState } from "react";
import * as Icons from "lucide-react";
import {
  FaHome,
  FaFileAlt,
  FaChartBar,
  FaTrophy,
  FaBook,
  FaCalendarAlt,
  FaUser,
  FaCog,
  FaSignOutAlt,
  FaStethoscope,
  FaMedkit,
  FaBrain,
  FaHeart,
} from "react-icons/fa";
import { RiAdminFill } from "react-icons/ri";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { moduleService } from "@/services/moduleService";
const SideBar = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchModules = async () => {
      try {
        setLoading(true);
        const { data } = await moduleService.getAllmodules();
        setModules(data.data || []);
        localStorage.setItem("modules", JSON.stringify(data.data));
      } catch (error) {
        console.error("Error fetching modules:", error);
        // Fallback to localStorage if API fails
        const storedModules = localStorage.getItem("modules");
        if (storedModules) {
          setModules(JSON.parse(storedModules));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchModules();
  }, []);

  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Static sidebar items (Dashboard and Admin)
  const staticSidebarItems = [
    {
      id: "overview",
      label: "Dashboard",
      icon: FaHome,
      path: "/dashboard/home",
    },
    {
      id: "playlist",
      label: "My playlist",
      icon: Icons.SquareLibrary,
      path: "/dashboard/playlist",
    },
    {
      id: "note",
      label: "My note",
      icon: Icons.NotebookIcon,
      path: "/dashboard/note",
    },
  ];

  // Dynamic module items based on fetched modules
  const moduleSidebarItems = modules.map((module) => ({
    id: module._id,
    label: module.name,
    icon: FaBook, // Default icon for modules
    path: `/dashboard/subjects/${module._id}`,
  }));

  // Combine static and dynamic items
  const sidebarItems = [...staticSidebarItems, ...moduleSidebarItems];
  const navigate = useNavigate();
  return (
    <motion.div
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      className={`relative z-10 ${
        sidebarOpen ? "w-64" : "w-20"
      } bg-white/80 backdrop-blur-sm border-r border-blue-200 shadow-lg transition-all duration-300 `}
    >
      {/* Header / Toggle */}
      <div className="flex items-center justify-between p-4 border-b border-blue-200">
        {sidebarOpen && (
          <span className="text-sm font-semibold text-gray-700">Menu</span>
        )}
        <button
          onClick={() => setSidebarOpen((prev) => !prev)}
          className="p-2 rounded-lg hover:bg-blue-50 text-gray-600 hover:text-gray-900"
          aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          title={sidebarOpen ? "Collapse" : "Expand"}
        >
          {sidebarOpen ? (
            <Icons.ChevronsLeft className="h-5 w-5" />
          ) : (
            <Icons.ChevronsRight className="h-5 w-5" />
          )}
        </button>
      </div>
      {/* Navigation */}
      <nav className={`space-y-2 ${sidebarOpen ? "p-4" : "p-2"}`}>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            {sidebarOpen && (
              <span className="ml-2 text-gray-600">Loading modules...</span>
            )}
          </div>
        ) : (
          sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                navigate(item.path);
              }}
              title={item.label}
              className={`w-full flex items-center ${
                sidebarOpen
                  ? "space-x-3 justify-start px-4"
                  : "justify-center px-2"
              } py-3 rounded-xl transition-all duration-300 ${
                activeTab === item.id
                  ? "bg-gradient-to-r from-blue-500/20 to-blue-600/20 text-blue-700 border border-blue-300 shadow-sm"
                  : "text-gray-600 hover:text-gray-900 hover:bg-blue-50"
              }`}
            >
              <item.icon className="text-xl flex-shrink-0" />
              {sidebarOpen && <span className="font-medium">{item.label}</span>}
            </button>
          ))
        )}
      </nav>
    </motion.div>
  );
};

export default SideBar;
