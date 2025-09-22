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
import { motion, AnimatePresence } from "framer-motion";
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

  // Base items
  const dashboardItem = {
    id: "overview",
    label: "Tableau de bord",
    icon: FaHome,
    path: "/dashboard/home",
  };

  // Dynamic module items based on fetched modules
  const moduleSidebarItems = modules.map((module) => ({
    id: module._id,
    label: module.name,
    icon: FaBook, // Default icon for modules
    path: `/dashboard/subjects/${module._id}`,
  }));

  // Other grouped items
  const analysisItems = [
    {
      id: "leaderboard",
      label: "Classement",
      icon: Icons.Trophy,
      path: "/dashboard/leaderboard",
    },
  ];

  const libraryItems = [
    {
      id: "playlist",
      label: "Mes playlists",
      icon: Icons.SquareLibrary,
      path: "/dashboard/playlist",
    },
    {
      id: "note",
      label: "Mes notes",
      icon: Icons.NotebookIcon,
      path: "/dashboard/note",
    },
  ];

  const accountItems = [
    {
      id: "settings",
      label: "Paramètres",
      icon: Icons.Settings,
      path: "/dashboard/settings",
    },
  ];
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
        initial={{
          x: isMobile ? -300 : 0,
          width: isMobile ? 256 : 256,
        }}
        animate={{
          x: isMobile && !sidebarOpen ? -300 : 0,
          width: isMobile ? 256 : sidebarOpen ? 256 : 80,
        }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        className={`${isMobile ? "fixed" : "relative"} z-50 ${
          isMobile ? "h-[calc(100vh-4rem)]" : "h-screen"
        } flex flex-col bg-white border-r border-gray-200 shadow-xl left-0 ${
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
            <>
              {/* Group: Dashboard */}
              <AnimatePresence initial={false}>
                {sidebarOpen && (
                  <motion.div
                    key="title-dashboard"
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.15 }}
                    className="px-4 pt-1 pb-1 text-[10px] font-semibold uppercase tracking-wider text-gray-400"
                  >
                    Tableau de bord
                  </motion.div>
                )}
              </AnimatePresence>
              <SidebarItem
                item={dashboardItem}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                navigate={navigate}
                isMobile={isMobile}
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
              />

              {/* Group: Modules */}
              <AnimatePresence initial={false}>
                {sidebarOpen && (
                  <motion.div
                    key="title-modules"
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.15 }}
                    className="px-4 mt-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-gray-400"
                  >
                    Modules
                  </motion.div>
                )}
              </AnimatePresence>
              {moduleSidebarItems.map((item) => (
                <SidebarItem
                  key={item.id}
                  item={item}
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                  navigate={navigate}
                  isMobile={isMobile}
                  sidebarOpen={sidebarOpen}
                  setSidebarOpen={setSidebarOpen}
                  extraClassName={sidebarOpen ? "pl-2" : ""}
                />
              ))}

              <AnimatePresence initial={false}>
                {sidebarOpen && (
                  <motion.div
                    key="sep-1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="my-2 border-t border-gray-200"
                  />
                )}
              </AnimatePresence>

              {/* Group: Analyse */}
              <AnimatePresence initial={false}>
                {sidebarOpen && (
                  <motion.div
                    key="title-analyse"
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.15 }}
                    className="px-4 pb-1 text-[10px] font-semibold uppercase tracking-wider text-gray-400"
                  >
                    Analyse
                  </motion.div>
                )}
              </AnimatePresence>
              {analysisItems.map((item) => (
                <SidebarItem
                  key={item.id}
                  item={item}
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                  navigate={navigate}
                  isMobile={isMobile}
                  sidebarOpen={sidebarOpen}
                  setSidebarOpen={setSidebarOpen}
                />
              ))}

              <AnimatePresence initial={false}>
                {sidebarOpen && (
                  <motion.div
                    key="sep-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="my-2 border-t border-gray-200"
                  />
                )}
              </AnimatePresence>

              {/* Group: Bibliothèque */}
              <AnimatePresence initial={false}>
                {sidebarOpen && (
                  <motion.div
                    key="title-library"
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.15 }}
                    className="px-4 pb-1 text-[10px] font-semibold uppercase tracking-wider text-gray-400"
                  >
                    Bibliothèque
                  </motion.div>
                )}
              </AnimatePresence>
              {libraryItems.map((item) => (
                <SidebarItem
                  key={item.id}
                  item={item}
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                  navigate={navigate}
                  isMobile={isMobile}
                  sidebarOpen={sidebarOpen}
                  setSidebarOpen={setSidebarOpen}
                />
              ))}

              <AnimatePresence initial={false}>
                {sidebarOpen && (
                  <motion.div
                    key="sep-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="my-2 border-t border-gray-200"
                  />
                )}
              </AnimatePresence>

              {/* Group: Compte */}
              <AnimatePresence initial={false}>
                {sidebarOpen && (
                  <motion.div
                    key="title-account"
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.15 }}
                    className="px-4 pb-1 text-[10px] font-semibold uppercase tracking-wider text-gray-400"
                  >
                    Compte
                  </motion.div>
                )}
              </AnimatePresence>
              {accountItems.map((item) => (
                <SidebarItem
                  key={item.id}
                  item={item}
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                  navigate={navigate}
                  isMobile={isMobile}
                  sidebarOpen={sidebarOpen}
                  setSidebarOpen={setSidebarOpen}
                />
              ))}
            </>
          )}
        </nav>
      </motion.div>
    </>
  );
};

// Reusable item component to keep rendering consistent
const SidebarItem = ({
  item,
  activeTab,
  setActiveTab,
  navigate,
  isMobile,
  sidebarOpen,
  setSidebarOpen,
  extraClassName = "",
}) => {
  return (
    <button
      key={item.id}
      onClick={() => {
        setActiveTab(item.id);
        navigate(item.path);
        if (isMobile) {
          setSidebarOpen(false);
        }
      }}
      title={item.label}
      className={`w-full flex items-center ${
        sidebarOpen ? "space-x-3 justify-start px-4" : "justify-center px-2"
      } py-3 rounded-xl transition-colors duration-200 ${
        activeTab === item.id
          ? "bg-blue-600 text-white shadow-lg"
          : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
      } ${extraClassName}`}
    >
      <item.icon className="text-xl flex-shrink-0" />
      <AnimatePresence initial={false}>
        {sidebarOpen && (
          <motion.span
            key={`${item.id}-label`}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -6 }}
            transition={{ duration: 0.15 }}
            className="font-medium"
          >
            {item.label}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
};

export default SideBar;
