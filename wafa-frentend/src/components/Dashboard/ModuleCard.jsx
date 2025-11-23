import React from "react";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import { api } from "@/lib/utils";
import { moduleService } from "@/services/moduleService";
import { Lock } from "lucide-react";

// Color schemes for modules (based on https://e-qe.online/dashboard)
const moduleColors = [
  { gradient: "from-blue-500 to-indigo-600", bg: "bg-blue-50", border: "border-blue-200", ring: "ring-blue-300" },
  { gradient: "from-purple-500 to-pink-600", bg: "bg-purple-50", border: "border-purple-200", ring: "ring-purple-300" },
  { gradient: "from-green-500 to-teal-600", bg: "bg-green-50", border: "border-green-200", ring: "ring-green-300" },
  { gradient: "from-orange-500 to-red-600", bg: "bg-orange-50", border: "border-orange-200", ring: "ring-orange-300" },
  { gradient: "from-cyan-500 to-blue-600", bg: "bg-cyan-50", border: "border-cyan-200", ring: "ring-cyan-300" },
  { gradient: "from-pink-500 to-rose-600", bg: "bg-pink-50", border: "border-pink-200", ring: "ring-pink-300" },
  { gradient: "from-yellow-500 to-orange-600", bg: "bg-yellow-50", border: "border-yellow-200", ring: "ring-yellow-300" },
  { gradient: "from-indigo-500 to-purple-600", bg: "bg-indigo-50", border: "border-indigo-200", ring: "ring-indigo-300" },
];

const ModuleCard = ({ course, handleCourseClick, index }) => {
  const colorScheme = moduleColors[index % moduleColors.length];
  const progress = course.progress || 0;
  const totalQuestions = course.totalQuestions || 0;
  const completedQuestions = Math.round((progress / 100) * totalQuestions);

  return (
    <motion.div
      key={course._id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.03, y: -5 }}
      className={`relative bg-white backdrop-blur-sm rounded-2xl border-2 ${colorScheme.border} shadow-lg p-4 sm:p-5 cursor-pointer hover:shadow-2xl hover:ring-2 ${colorScheme.ring} transition-all duration-300 overflow-hidden group`}
      onClick={() => handleCourseClick(course._id)}
    >
      {/* Animated background gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${colorScheme.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
      
      {/* Course Image with gradient overlay */}
      <div className="relative mb-4 overflow-hidden rounded-xl">
        <img
          src={course.imageUrl}
          alt={course.name}
          className="w-full h-32 sm:h-40 object-cover transform group-hover:scale-110 transition-transform duration-500"
        />
        <div className={`absolute inset-0 bg-gradient-to-t ${colorScheme.gradient} opacity-30 group-hover:opacity-20 transition-opacity duration-300`}></div>
        
        {/* Progress badge on image */}
        <div className="absolute top-2 right-2">
          <motion.div 
            className="bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 shadow-lg"
            whileHover={{ scale: 1.1 }}
          >
            <span className={`text-xs font-bold bg-gradient-to-r ${colorScheme.gradient} text-transparent bg-clip-text`}>
              {progress}%
            </span>
          </motion.div>
        </div>
      </div>

      {/* Course Title */}
      <h3 className="relative text-base sm:text-lg font-bold text-gray-900 mb-3 line-clamp-2 min-h-[2.5rem] group-hover:text-gray-700 transition-colors">
        {course.name}
      </h3>

      {/* Progress Bar */}
      <div className="relative mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-medium text-gray-600">Progression</span>
          <span className="text-xs font-bold text-gray-700">{progress}%</span>
        </div>
        <div className="relative w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
          <motion.div
            className={`absolute h-full bg-gradient-to-r ${colorScheme.gradient} rounded-full`}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: "easeOut", delay: index * 0.1 }}
          >
            <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
          </motion.div>
        </div>
      </div>

      {/* Course Stats */}
      <div className="relative flex items-center justify-between pt-3 border-t border-gray-200">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${colorScheme.gradient} animate-pulse`}></div>
          <span className="text-xs sm:text-sm text-gray-600 font-medium">
            <span className="font-bold text-gray-800">{completedQuestions}</span> / {totalQuestions} Questions
          </span>
        </div>

        <motion.button
          className={`px-3 py-1.5 rounded-lg bg-gradient-to-r ${colorScheme.gradient} text-white text-xs font-semibold shadow-md hover:shadow-lg transition-shadow`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={(e) => {
            e.stopPropagation();
            handleCourseClick(course._id);
          }}
        >
          Commencer
        </motion.button>
      </div>
    </motion.div>
  );
};

export default ModuleCard;
