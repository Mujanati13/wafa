import React from "react";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import { api } from "@/lib/utils";
import { moduleService } from "@/services/moduleService";
import { Lock } from "lucide-react";

const ModuleCard = ({ course, handleCourseClick }) => {
  return (
    <motion.div
      key={course._id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className="bg-white/80 backdrop-blur-sm rounded-2xl border border-blue-100 shadow-lg p-4 sm:p-6 cursor-pointer hover:shadow-xl hover:border-blue-300 transition-all duration-300"
      onClick={() => handleCourseClick(course._id)}
    >
      {/* Course Icon and Header - Hidden on mobile */}
      <div className="hidden sm:flex items-start justify-between mb-3 sm:mb-4">
        <img
          src={course.imageUrl}
          alt={course.name}
          className="w-full h-32 sm:h-40 md:h-48 lg:h-50 object-cover rounded-lg"
        />
      </div>

      {/* Course Title */}
      <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 line-clamp-2">
        {course.name}
      </h3>

      {/* Progress */}
      <div className="flex items-center space-x-2 mb-3 sm:mb-4">
        <div className="flex-1 bg-blue-100 rounded-full h-2">
          <div
            className={`bg-gradient-to-r ${
              course.color || "from-blue-500 to-teal-400"
            } h-2 rounded-full transition-all duration-300`}
            style={{ width: `${course.progress || 0}%` }}
          ></div>
        </div>
        <span className="text-gray-600 text-xs sm:text-sm">
          {course.progress || 0}%
        </span>
      </div>

      {/* Course Stats */}
      <div className="flex items-center justify-between">
        <div className="text-gray-600 text-xs sm:text-sm">
          0 / {course.exams ? course.totalQuestions : 8} Questions
        </div>

        <span className="text-blue-600 font-bold h-8 w-8 sm:h-10 sm:w-10 flex items-center justify-center rounded-full bg-blue-100 text-sm sm:text-base">
          ?
        </span>
      </div>
    </motion.div>
  );
};

export default ModuleCard;
