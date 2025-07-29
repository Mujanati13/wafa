import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaArrowLeft, FaPlay, FaRedo } from "react-icons/fa";

const SubjectsPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  // Course data with exam details
  const courseData = {
    "nephro-uro": {
      name: "Néphrologie/uro",
      icon: "🫘",
      difficulty: "hard",
      exams: [
        { 
          id: "amylose", 
          name: "Amylose", 
          questions: 11, 
          completed: 0, 
          progress: 0,
          description: "Mai 2024 Q 28",
          
        },
        { 
          id: "intro-nephro", 
          name: "Intro néphrologie", 
          questions: 2, 
          completed: 0, 
          progress: 0,
          description: "Introduction course"
        },
        { 
          id: "nephro-hereditaire", 
          name: "Nephro héréditaire", 
          questions: 35, 
          completed: 0, 
          progress: 0,
          description: "Hereditary nephrology"
        },
        { 
          id: "nephro-diabetique", 
          name: "Nephro diabétique", 
          questions: 40, 
          completed: 0, 
          progress: 0,
          description: "Diabetic nephrology"
        },
        { 
          id: "nephro-lupique", 
          name: "Nephro lupique", 
          questions: 30, 
          completed: 0, 
          progress: 0,
          description: "Lupus nephrology"
        },
        { 
          id: "glomerulo", 
          name: "Glomérulonéphrite extra capillaire", 
          questions: 19, 
          completed: 0, 
          progress: 0,
          description: "Extracapillary glomerulonephritis"
        },
        { 
          id: "lgm", 
          name: "Lgm", 
          questions: 20, 
          completed: 0, 
          progress: 0,
          description: "LGM course"
        },
        { 
          id: "hsf", 
          name: "HSF", 
          questions: 20, 
          completed: 0, 
          progress: 0,
          description: "HSF course"
        }
      ]
    },
    "med-legal": {
      name: "Med legal-éthique-travail",
      icon: "⚖️",
      difficulty: "medium",
      exams: [
        { id: "ethics", name: "Éthique médicale", questions: 25, completed: 0, progress: 0 },
        { id: "legal", name: "Médecine légale", questions: 30, completed: 0, progress: 0 },
        { id: "work", name: "Médecine du travail", questions: 20, completed: 0, progress: 0 }
      ]
    },
    "synthese": {
      name: "Synthèse thérapeutique",
      icon: "💊",
      difficulty: "medium",
      exams: [
        { id: "synthesis", name: "Synthèse thérapeutique", questions: 35, completed: 0, progress: 0 }
      ]
    },
    "sante-publique": {
      name: "Santé publique",
      icon: "📊",
      difficulty: "medium",
      exams: [
        { id: "public-health", name: "Santé publique", questions: 40, completed: 0, progress: 0 }
      ]
    }
  };

  const course = courseData[courseId];

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-6">
        <div className="text-gray-900 text-center">Course not found</div>
      </div>
    );
  }

  const handleExamStart = (examId) => {
    navigate(`/exam/${examId}`);
  };

  const handleReset = (examId) => {
    // Reset logic would go here
    console.log(`Reset exam: ${examId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-6">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-blue-100 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-teal-100 rounded-full opacity-15 animate-pulse delay-1000"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/dashboard/home')}
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            <FaArrowLeft className="text-xl" />
          </button>
          <div className="flex items-center space-x-3">
            <div className="text-3xl">{course.icon}</div>
            <h1 className="text-3xl font-bold text-gray-900">{course.name}</h1>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-gray-900 font-semibold">YK</div>
        </div>
      </div>

      {/* Course Header with Collapsible Section */}
      <div className="relative z-10 mb-8">
        <div className="flex items-center space-x-2 mb-4">
          <div className="text-2xl">{course.icon}</div>
          <h2 className="text-xl font-bold text-gray-900">Néphrologie</h2>
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {/* Exam Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {course.exams.map((exam, index) => (
            <motion.div
              key={exam.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl border border-blue-100 shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
            >
              {/* Exam Image Placeholder */}
              <div className="h-32 bg-gradient-to-br from-blue-400 to-teal-500 flex items-center justify-center">
                <div className="text-white text-4xl">🫘</div>
              </div>

              {/* Exam Content */}
              <div className="p-4">
                <h3 className="text-gray-900 font-semibold mb-2">{exam.name}</h3>
                
                {exam.description && (
                  <div className="text-gray-600 text-sm mb-2">{exam.description}</div>
                )}
                
                {exam.correction && (
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mb-3">
                    Correction : {exam.correction}
                  </span>
                )}

                <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                  <span>{exam.completed} / {exam.questions} Questions</span>
                </div>

                {/* Progress */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-blue-600">{exam.progress}% Complete</span>
                  </div>
                  <div className="bg-blue-100 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${exam.progress}%` }}
                    ></div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => handleExamStart(exam.id)}
                    className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm shadow-sm"
                  >
                    <FaPlay className="text-xs" />
                    <span>Start</span>
                  </button>
                  
                  <button
                    onClick={() => handleReset(exam.id)}
                    className="bg-pink-500 hover:bg-pink-600 text-white px-3 py-2 rounded-lg transition-colors text-sm shadow-sm"
                  >
                    reset
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SubjectsPage; 