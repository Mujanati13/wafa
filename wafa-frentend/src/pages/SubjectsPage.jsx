import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaArrowLeft, FaPlay, FaRedo, FaChevronDown } from "react-icons/fa";
import { IoCloseSharp } from "react-icons/io5";

const SubjectsPage = () => {
  const [showModel, setShowmodal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { courseId } = useParams();
  const navigate = useNavigate();

  // Course data with exam details
  const courseData = {
    "nephro-uro": {
      name: "Néphrologie/uro",
      image: "🫘",
      categories: [
        { id: "all", name: "Toutes les catégories" },
        { id: "biochemistry", name: "Les bases biochimiques" },
        { id: "clinical", name: "Clinique" },
        { id: "diagnostic", name: "Diagnostic" },
        { id: "treatment", name: "Traitement" },
      ],
      exams: [
        {
          id: "amylose",
          name: "Amylose",
          questions: 11,
          completed: 0,
          progress: 0,
          description: "Mai 2024 Q 28",
          category: "biochemistry",
        },
        {
          id: "intro-nephro",
          name: "Intro néphrologie",
          questions: 2,
          completed: 0,
          progress: 0,
          description: "Introduction course",
          category: "clinical",
        },
        {
          id: "nephro-hereditaire",
          name: "Nephro héréditaire",
          questions: 35,
          completed: 0,
          progress: 0,
          description: "Hereditary nephrology",
          category: "clinical",
        },
        {
          id: "nephro-diabetique",
          name: "Nephro diabétique",
          questions: 40,
          completed: 0,
          progress: 0,
          description: "Diabetic nephrology",
          category: "diagnostic",
        },
        {
          id: "nephro-lupique",
          name: "Nephro lupique",
          questions: 30,
          completed: 0,
          progress: 0,
          description: "Lupus nephrology",
          category: "diagnostic",
        },
        {
          id: "glomerulo",
          name: "Glomérulonéphrite extra capillaire",
          questions: 19,
          completed: 0,
          progress: 0,
          description: "Extracapillary glomerulonephritis",
          difficulty: "hard",
          category: "treatment",
        },
        {
          id: "lgm",
          name: "Lgm",
          questions: 20,
          completed: 0,
          progress: 0,
          description: "LGM course",
          difficulty: "medium",
          category: "biochemistry",
        },
        {
          id: "hsf",
          name: "HSF",
          questions: 20,
          completed: 0,
          progress: 0,
          description: "HSF course",
          difficulty: "easy",
          category: "biochemistry",
        },
      ],
    },
    "med-legal": {
      name: "Med legal-éthique-travail",
      image: "⚖️",
      categories: [
        { id: "all", name: "Toutes les catégories" },
        { id: "ethics", name: "Éthique" },
        { id: "legal", name: "Légal" },
        { id: "work", name: "Travail" },
      ],
      exams: [
        {
          id: "ethics",
          name: "Éthique médicale",
          questions: 25,
          completed: 0,
          progress: 0,
          difficulty: "medium",
          category: "ethics",
        },
        {
          id: "legal",
          name: "Médecine légale",
          questions: 30,
          completed: 0,
          progress: 0,
          difficulty: "hard",
          category: "legal",
        },
        {
          id: "work",
          name: "Médecine du travail",
          questions: 20,
          completed: 0,
          progress: 0,
          difficulty: "easy",
          category: "work",
        },
      ],
    },
    synthese: {
      name: "Synthèse thérapeutique",
      image: "💊",
      difficulty: "medium",
      categories: [
        { id: "all", name: "Toutes les catégories" },
        { id: "synthesis", name: "Synthèse" },
      ],
      exams: [
        {
          id: "synthesis",
          name: "Synthèse thérapeutique",
          questions: 35,
          completed: 0,
          progress: 0,
          difficulty: "medium",
          category: "synthesis",
        },
      ],
    },
    "sante-publique": {
      name: "Santé publique",
      image: "📊",
      difficulty: "medium",
      categories: [
        { id: "all", name: "Toutes les catégories" },
        { id: "public-health", name: "Santé publique" },
      ],
      exams: [
        {
          id: "public-health",
          name: "Santé publique",
          questions: 40,
          completed: 0,
          progress: 0,
          difficulty: "medium",
          category: "public-health",
        },
      ],
    },
  };

  const course = courseData[courseId];

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-6">
        <div className="text-gray-900 text-center">Course not found</div>
      </div>
    );
  }

  // Filter exams based on selected category
  const filteredExams = course.exams.filter(
    (exam) => selectedCategory === "all" || exam.category === selectedCategory
  );

  const handleExamStart = (examId) => {
    navigate(`/exam/${examId}`);
  };

  const handleReset = (examId) => {
    // Reset logic would go here
    console.log(`Reset exam: ${examId}`);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "hard":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const selectedCategoryName =
    course.categories.find((cat) => cat.id === selectedCategory)?.name ||
    "Toutes les catégories";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-6">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-blue-100 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-teal-100 rounded-full opacity-15 animate-pulse delay-1000"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 flex flex-col justify-between mb-8">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate("/dashboard/home")}
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            <FaArrowLeft className="text-xl" />
          </button>
          <div className="flex items-center space-x-3">
            <div className="text-3xl">{course.image}</div>

            <h1 className="text-3xl font-bold text-gray-900">{course.name}</h1>
          </div>
        </div>
        <div className="flex h-[80px] w-full bg-white/70 rounded-xl shadow-md mt-6 mb-4 overflow-hidden border border-blue-100">
          <button
            className="flex-1 flex flex-col items-center justify-center transition-all duration-200 hover:bg-blue-50 focus:bg-blue-100 group relative"
            onClick={() => {}}
          >
            <span className="text-blue-700 font-semibold text-lg flex items-center gap-2">
              Par examen
            </span>
            <span className="absolute bottom-0 left-0 w-full h-1 bg-blue-400 opacity-0 group-hover:opacity-100 transition-opacity"></span>
          </button>
          <div className="w-[1px] bg-blue-100 h-2/3 self-center"></div>
          <button
            className="flex-1 flex flex-col items-center justify-center transition-all duration-200 hover:bg-teal-50 focus:bg-teal-100 group relative"
            onClick={() => {}}
          >
            <span className="text-teal-700 font-semibold text-lg flex items-center gap-2">
              Par chapitre
            </span>
            <span className="absolute bottom-0 left-0 w-full h-1 bg-teal-400 opacity-0 group-hover:opacity-100 transition-opacity"></span>
          </button>
        </div>
      </div>

      {/* Category Dropdown */}
      <div className="relative z-10 mb-6">
        <div className="relative">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className=" mt-2 bg-white/90 backdrop-blur-sm border border-blue-200 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto grid grid-cols-3"
          >
            {course.categories.map((category) => (
              <button
                key={category.id}
                onClick={() => {
                  setSelectedCategory(category.id);
                  setIsDropdownOpen(false);
                }}
                className={`w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-blue-50 transition-colors duration-200 ${
                  selectedCategory === category.id
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-700"
                }`}
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center text-white text-sm font-semibold">
                  A
                </div>
                <span className="font-medium">{category.name}</span>
              </button>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        {/* Exam Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExams.map((exam, index) => (
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
                <span
                  className="absolute top-1 right-4 h-10 w-10 bg-blue-800 text-white rounded-full flex items-center justify-center text-[20px]  hover:rounded-2xl duration-500 cursor-pointer"
                  onClick={() => setShowmodal(true)}
                >
                  ?
                </span>
              </div>

              {/* Exam Content */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-gray-900 font-semibold">{exam.name}</h3>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(
                      exam.difficulty
                    )}`}
                  >
                    {exam.difficulty}
                  </span>
                </div>

                {exam.description && (
                  <div className="text-gray-600 text-sm mb-2">
                    {exam.description}
                  </div>
                )}

                {exam.correction && (
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mb-3">
                    Correction : {exam.correction}
                  </span>
                )}

                <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                  <span>
                    {exam.completed} / {exam.questions} Questions
                  </span>
                </div>

                {/* Progress */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-blue-600">
                      {exam.progress}% Complete
                    </span>
                  </div>
                  <div className="bg-blue-100 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${exam.progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      {showModel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl p-8 flex flex-col items-center"
          >
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors"
              onClick={() => setShowmodal(false)}
              aria-label="Fermer"
            >
              <IoCloseSharp size={28} />
            </button>
            <div className="flex flex-col items-center w-full">
              <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
                Information sur l'examen
              </h2>
              <p className="text-gray-600 text-center mb-6">
                Êtes-vous prêt à commencer cet examen&nbsp;? Assurez-vous
                d'avoir le temps nécessaire et d'être dans un environnement
                calme. Bonne chance&nbsp;!
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default SubjectsPage;
