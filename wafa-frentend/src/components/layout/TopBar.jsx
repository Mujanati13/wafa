import React from "react";
import { FaBell, FaSearch, FaUser } from "react-icons/fa";

const TopBar = () => {
  return (
    <div className="bg-white/80 backdrop-blur-sm border-b border-blue-200 px-6 py-4 shadow-sm z-10 w-full">
      <div className="flex items-center justify-between">
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-teal-500 to-blue-600"></span>
        {/* Right Side Icons */}
        <div className="flex items-center space-x-4">
          {/* Theme Toggle Icon */}
          <button
            className="p-2 rounded-full hover:bg-blue-100 transition-colors duration-200 focus:outline-none"
            title="Changer le thème"
            onClick={() => {
              // Simple theme toggle: toggles 'dark' class on <html>
              const html = document.documentElement;
              if (html.classList.contains("dark")) {
                html.classList.remove("dark");
                localStorage.setItem("theme", "light");
              } else {
                html.classList.add("dark");
                localStorage.setItem("theme", "dark");
              }
            }}
          >
            {/* Sun/Moon icon depending on theme */}
            {document.documentElement.classList.contains("dark") ? (
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
          <div className="flex items-center space-x-3">
            <p>az-eddine serhani</p>
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full flex items-center justify-center shadow-sm">
              <FaUser className="text-white text-sm" />
            </div>
          </div>
        </div>
      </div>  
    </div>
  );
};

export default TopBar;
