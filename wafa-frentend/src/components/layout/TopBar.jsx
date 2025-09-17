import React, { useState } from "react";
import { FaBell, FaSearch, FaUser } from "react-icons/fa";
import * as Icons from "lucide-react";
import ProfileMenu from "../profile/ProfileMenu";

const TopBar = ({ sidebarOpen, setSidebarOpen, isMobile }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  return (
    <div className="bg-white/80 backdrop-blur-sm border-b border-blue-200 px-6 py-4 shadow-sm  w-full z-1000 cursor-pointer h-16">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Sidebar Toggle Button */}
          <button
            onClick={() => setSidebarOpen((prev) => !prev)}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors"
            aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            title={sidebarOpen ? "Collapse" : "Expand"}
          >
            {sidebarOpen ? (
              <Icons.ChevronsLeft className="h-5 w-5" />
            ) : (
              <Icons.ChevronsRight className="h-5 w-5" />
            )}
          </button>

          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-teal-500 to-blue-600 text-2xl font-bold">
            WAFA
          </span>
        </div>
        {/* Right Side Icons */}
        <div className="flex items-center space-x-4">
          {/* Theme Toggle Icon */}
          <button
            className="p-2 rounded-full hover:bg-blue-100 transition-colors duration-200 focus:outline-none"
            title="Changer le thème"
            onClick={() => {
              setDarkMode(!darkMode);
            }}
          >
            {/* Sun/Moon icon depending on theme */}
            {darkMode ? (
              // Sun icon for light mode
              <svg
                className="w-5 h-5 text-yellow-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M10 15a5 5 0 100-10 5 5 0 000 10zm0 2a7 7 0 100-14 7 7 0 000 14zm0-18a1 1 0 011 1v2a1 1 0 11-2 0V0a1 1 0 011-1zm0 18a1 1 0 011 1v2a1 1 0 11-2 0v-2a1 1 0 011-1zm10-8a1 1 0 01-1 1h-2a1 1 0 110-2h2a1 1 0 011 1zM2 10a1 1 0 01-1 1H0a1 1 0 110-2h1a1 1 0 011 1zm15.071-7.071a1 1 0 010 1.414l-1.414 1.414a1 1 0 11-1.414-1.414l1.414-1.414a1 1 0 011.414 0zM4.343 15.657a1 1 0 010 1.414l-1.414 1.414a1 1 0 11-1.414-1.414l1.414-1.414a1 1 0 011.414 0zm12.728 0a1 1 0 00-1.414 0l-1.414 1.414a1 1 0 101.414 1.414l1.414-1.414a1 1 0 000-1.414zM4.343 4.343a1 1 0 00-1.414 0L1.515 5.757a1 1 0 101.414 1.414l1.414-1.414a1 1 0 000-1.414z" />
              </svg>
            ) : (
              // Moon icon for dark mode
              <svg
                className="w-5 h-5 text-blue-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            )}
          </button>

          {/* User Info */}
          <div className="flex items-center space-x-3 cursor-pointer">
            <ProfileMenu isOpen={isOpen} setIsOpen={setIsOpen} />
          </div>
        </div>
      </div>
      {isOpen && (
        <div
          className="absolute h-screen w-screen top-0 left-0 "
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default TopBar;
