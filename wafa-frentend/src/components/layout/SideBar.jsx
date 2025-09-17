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
const SideBar = ({ sidebarOpen, setSidebarOpen, isMobile }) => {
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
    <>
      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          style={{ top: "4rem" }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <motion.div
        initial={{ x: isMobile ? -300 : 0 }}
        animate={{ x: isMobile && !sidebarOpen ? -300 : 0 }}
        className={`${isMobile ? "fixed" : "relative"} z-50 ${
          isMobile ? "h-[calc(100vh-4rem)]" : "h-screen"
        } flex flex-col ${
          sidebarOpen ? "w-64" : isMobile ? "w-64" : "w-20"
        } bg-white border-r border-gray-200 shadow-xl transition-all duration-300 left-0 ${
          isMobile ? "top-16" : "top-0"
        } overflow-hidden`}
      >
        {/* Navigation */}
        <nav
          className={`space-y-2 ${
            sidebarOpen ? "p-4 pt-4" : "p-2 pt-4"
          } flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100`}
        >
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
                  // Close sidebar on mobile after navigation
                  if (isMobile) {
                    setSidebarOpen(false);
                  }
                }}
                title={item.label}
                className={`w-full flex items-center ${
                  sidebarOpen
                    ? "space-x-3 justify-start px-4"
                    : "justify-center px-2"
                } py-3 rounded-xl transition-all duration-300 ${
                  activeTab === item.id
                    ? "bg-blue-600 text-white shadow-lg"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                <item.icon className="text-xl flex-shrink-0" />
                {sidebarOpen && (
                  <span className="font-medium">{item.label}</span>
                )}
              </button>
            ))
          )}
        </nav>
      </motion.div>
    </>
  );
};

export default SideBar;
