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
  // Collapsible section open states (all collapsed by default)
  const [openGroups, setOpenGroups] = useState({
    dashboard: false,
    modules: false,
    analysis: false,
    library: false,
  });

  const toggleGroup = (groupKey) =>
    setOpenGroups((prev) => ({ ...prev, [groupKey]: !prev[groupKey] }));

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

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && isMobile && sidebarOpen) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMobile, sidebarOpen, setSidebarOpen]);

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

  const navigate = useNavigate();
  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
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
        } flex flex-col min-h-0 bg-white border-r border-gray-200 shadow-xl left-0 ${
          isMobile ? "top-16" : "top-0"
        } ${isMobile ? "lg:relative lg:top-0" : ""} overflow-hidden`}
      >
        {/* Navigation */}
        <nav
          className={`space-y-1.5 ${
            sidebarOpen ? "p-4 pt-4" : "p-2 pt-4"
          } flex-1 min-h-0 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100`}
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
              <CollapsibleSection
                id="dashboard"
                title="Tableau de bord"
                isOpen={openGroups.dashboard}
                forceOpen={!sidebarOpen}
                onToggle={() => toggleGroup("dashboard")}
                sidebarOpen={sidebarOpen}
              >
                <SidebarItem
                  item={dashboardItem}
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                  navigate={navigate}
                  isMobile={isMobile}
                  sidebarOpen={sidebarOpen}
                  setSidebarOpen={setSidebarOpen}
                />
              </CollapsibleSection>

              {/* Group: Modules */}
              <CollapsibleSection
                id="modules"
                title="Modules"
                isOpen={openGroups.modules}
                forceOpen={!sidebarOpen}
                onToggle={() => toggleGroup("modules")}
                sidebarOpen={sidebarOpen}
              >
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
              </CollapsibleSection>

              {/* Group: Analyse */}
              <CollapsibleSection
                id="analysis"
                title="Analyse"
                isOpen={openGroups.analysis}
                forceOpen={!sidebarOpen}
                onToggle={() => toggleGroup("analysis")}
                sidebarOpen={sidebarOpen}
              >
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
              </CollapsibleSection>

              {/* Group: Bibliothèque */}
              <CollapsibleSection
                id="library"
                title="Bibliothèque"
                isOpen={openGroups.library}
                forceOpen={!sidebarOpen}
                onToggle={() => toggleGroup("library")}
                sidebarOpen={sidebarOpen}
              >
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
              </CollapsibleSection>
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
        sidebarOpen ? "space-x-3 justify-start px-3.5" : "justify-center px-2"
      } py-2.5 rounded-lg transition-colors duration-200 ${
        activeTab === item.id
          ? "bg-blue-600 text-white shadow-lg"
          : "text-gray-700 hover:text-blue-700 hover:bg-blue-50"
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
            className="font-medium text-left text-[15px]"
          >
            {item.label}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
};

// Collapsible section wrapper with header and chevron toggle
const CollapsibleSection = ({
  id,
  title,
  isOpen,
  onToggle,
  sidebarOpen,
  children,
  forceOpen = false,
}) => {
  const showChildren = forceOpen || isOpen;
  return (
    <div key={`section-${id}`} className="mt-1">
      <AnimatePresence initial={false}>
        {sidebarOpen && (
          <motion.button
            type="button"
            key={`header-${id}`}
            onClick={onToggle}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="w-full px-3.5 py-2 flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-gray-500 hover:text-blue-700"
            title={title}
          >
            <span>{title}</span>
            <Icons.ChevronDown
              className={`h-4 w-4 transition-transform duration-200 ${
                showChildren ? "rotate-180" : "rotate-0"
              }`}
            />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence initial={false}>
        {showChildren && (
          <motion.div
            key={`content-${id}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className={sidebarOpen ? "space-y-1" : "space-y-0"}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SideBar;
