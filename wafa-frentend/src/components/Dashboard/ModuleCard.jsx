import React from "react";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, HelpCircle, X, BookOpen, Info, CheckCircle } from "lucide-react";

import { api } from "@/lib/utils";
import { moduleService } from "@/services/moduleService";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
  const [showHelpModal, setShowHelpModal] = useState(false);
  const colorScheme = moduleColors[index % moduleColors.length];
  const progress = course.progress || 0;
  const totalQuestions = course.totalQuestions || 0;
  const questionsAttempted = course.questionsAttempted || Math.round((progress / 100) * totalQuestions);
  const correctAnswers = course.correctAnswers || 0;
  const wrongAnswers = questionsAttempted - correctAnswers;
  
  // Use custom color from module if available
  const moduleColor = course.color || null;
  const customStyle = moduleColor ? { 
    background: `linear-gradient(135deg, ${moduleColor}, ${adjustColor(moduleColor, -30)})` 
  } : null;

  // Helper function to darken/lighten color
  function adjustColor(color, amount) {
    const hex = color.replace('#', '');
    const num = parseInt(hex, 16);
    const r = Math.max(0, Math.min(255, (num >> 16) + amount));
    const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amount));
    const b = Math.max(0, Math.min(255, (num & 0x0000FF) + amount));
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
  }

  return (
    <>
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
        
        {/* Help Button - Top Left */}
        {(course.helpContent || course.infoText) && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute top-2 left-2 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm shadow-md flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-white transition-all"
            onClick={(e) => {
              e.stopPropagation();
              setShowHelpModal(true);
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <HelpCircle className="w-4 h-4" />
          </motion.button>
        )}
        
        {/* Course Image with gradient overlay */}
        <div className="relative mb-4 overflow-hidden rounded-xl">
          {course.imageUrl ? (
            <img
              src={course.imageUrl}
              alt={course.name}
              className="w-full h-32 sm:h-40 object-cover transform group-hover:scale-110 transition-transform duration-500"
              onError={(e) => {
                // Hide broken image and show gradient background
                e.target.style.display = 'none';
              }}
            />
          ) : null}
          
          {/* Gradient background - always visible as fallback */}
          <div 
            className={`${course.imageUrl ? 'absolute' : 'relative'} inset-0 w-full h-32 sm:h-40 ${!customStyle ? `bg-gradient-to-br ${colorScheme.gradient}` : ''}`}
            style={customStyle ? { 
              background: `linear-gradient(135deg, ${course.color}40, ${course.color}20)`,
            } : undefined}
          >
            {/* Module name overlay for no-image cards */}
            {!course.imageUrl && (
              <div className="absolute inset-0 flex items-center justify-center p-4">
                <span className="text-gray-600 text-sm font-medium text-center opacity-60">
                  {course.name}
                </span>
              </div>
            )}
          </div>
          
          {/* Image overlay gradient */}
          {course.imageUrl && (
            <div 
              className={`absolute inset-0 opacity-30 group-hover:opacity-20 transition-opacity duration-300 ${!customStyle ? `bg-gradient-to-t ${colorScheme.gradient}` : ''}`}
              style={customStyle ? { background: `linear-gradient(to top, ${course.color}99, transparent)` } : undefined}
            ></div>
          )}
          
          {/* Progress badge on image */}
          <div className="absolute top-2 right-2">
            <motion.div 
              className="bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 shadow-lg"
              whileHover={{ scale: 1.1 }}
            >
              <span 
                className={`text-xs font-bold ${!customStyle ? `bg-gradient-to-r ${colorScheme.gradient} text-transparent bg-clip-text` : ''}`}
                style={customStyle ? { color: course.color } : undefined}
              >
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
              className={`absolute h-full rounded-full ${!customStyle ? `bg-gradient-to-r ${colorScheme.gradient}` : ''}`}
              style={customStyle || undefined}
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
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold text-green-600">{correctAnswers}</span>
              <span className="text-xs text-gray-400">/</span>
              <span className="text-xs font-bold text-red-500">{wrongAnswers}</span>
              <span className="text-xs text-gray-400">/</span>
              <span className="text-xs text-gray-600">{totalQuestions}</span>
            </div>
            <span className="text-xs text-gray-500">Questions</span>
          </div>

          <motion.button
            className={`px-3 py-1.5 rounded-lg text-white text-xs font-semibold shadow-md hover:shadow-lg transition-shadow ${!customStyle ? `bg-gradient-to-r ${colorScheme.gradient}` : ''}`}
            style={customStyle || undefined}
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

      {/* Help Modal */}
      <Dialog open={showHelpModal} onOpenChange={setShowHelpModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div 
                className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${!customStyle ? `bg-gradient-to-r ${colorScheme.gradient}` : ''}`}
                style={customStyle || undefined}
              >
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <span className="block">{course.name}</span>
                <span className="text-sm font-normal text-gray-500">Guide du module</span>
              </div>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            {/* Module Info */}
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="gap-1">
                <Info className="w-3 h-3" />
                {course.semester || "N/A"}
              </Badge>
              <Badge variant="outline" className="gap-1">
                <CheckCircle className="w-3 h-3" />
                {totalQuestions} Questions
              </Badge>
              <Badge 
                className="gap-1 text-white"
                style={customStyle || undefined}
              >
                {progress}% Complété
              </Badge>
            </div>

            {/* Short Description */}
            {course.infoText && (
              <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  En bref
                </h4>
                <p className="text-sm text-blue-700">{course.infoText}</p>
              </div>
            )}

            {/* Detailed Help Content */}
            {course.helpContent && (
              <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl">
                <h4 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4" />
                  Guide détaillé
                </h4>
                <div className="text-sm text-gray-600 whitespace-pre-wrap">
                  {course.helpContent}
                </div>
              </div>
            )}

            {/* No content fallback */}
            {!course.infoText && !course.helpContent && (
              <div className="text-center py-8 text-gray-500">
                <HelpCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Aucune information d'aide disponible pour ce module.</p>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={() => setShowHelpModal(false)}>
              Fermer
            </Button>
            <Button 
              className="text-white"
              style={customStyle || undefined}
              onClick={() => {
                setShowHelpModal(false);
                handleCourseClick(course._id);
              }}
            >
              Commencer le module
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ModuleCard;
