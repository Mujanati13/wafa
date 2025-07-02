import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaHome,
  FaUser,
  FaBook,
  FaChartBar,
  FaCog,
  FaSignOutAlt,
  FaBell,
  FaSearch,
  FaTrophy,
  FaClock,
  FaPlay,
  FaUsers,
  FaGraduationCap,
  FaCalendarAlt,
  FaFileAlt,
  FaComment,
  FaStethoscope,
  FaMedkit,
  FaBrain,
  FaHeart,
  FaEye,
  FaBone,
  FaCheck,
  FaTimes,
  FaStar,
  FaArrowUp,
  FaArrowDown,
  FaMinus,
  FaBookOpen,
  FaPercentage,
  FaChartLine,
  FaFilter,
  FaDownload,
} from "react-icons/fa";
import StatsCard from "../components/Dashboard/StatsCard";
import SemesterCard from "../components/Dashboard/SemesterCard";
import ExamsBySeesterCard from "../components/Dashboard/ExamsBySeesterCard";
import RecentResultsCard from "../components/Dashboard/RecentResultsCard";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");

  const [selectedSemester, setSelectedSemester] = useState("S1");
  const navigate = useNavigate();

  // Results page state
  const [examResults, setExamResults] = useState([]);

  const [selectedExam, setSelectedExam] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const stats = [
    {
      label: "Examens passés",
      value: "24",
      icon: FaFileAlt,
      color: "from-blue-500 to-purple-500",
    },
    {
      label: "Moyenne générale",
      value: "15.2/20",
      icon: FaStar,
      color: "from-green-500 to-blue-500",
    },
    {
      label: "Temps d'étude",
      value: "142h",
      icon: FaClock,
      color: "from-purple-500 to-pink-500",
    },
    {
      label: "Taux de réussite",
      value: "87%",
      icon: FaTrophy,
      color: "from-pink-500 to-red-500",
    },
  ];

  const semesters = [
    { id: "S1", name: "Semestre 1", year: "1ère Année" },
    { id: "S2", name: "Semestre 2", year: "1ère Année" },
    { id: "S3", name: "Semestre 3", year: "2ème Année" },
    { id: "S4", name: "Semestre 4", year: "2ème Année" },
    { id: "S5", name: "Semestre 5", year: "3ème Année" },
    { id: "S6", name: "Semestre 6", year: "3ème Année" },
  ];

  const examsBySeester = {
    S1: [
      {
        id: 1,
        subject: "Anatomie Générale",
        icon: FaBone,
        questions: 50,
        duration: "90 min",
        difficulty: "Moyen",
        lastScore: "16/20",
        available: true,
      },
      {
        id: 2,
        subject: "Biologie Cellulaire",
        icon: FaMedkit,
        questions: 40,
        duration: "75 min",
        difficulty: "Facile",
        lastScore: "14/20",
        available: true,
      },
      {
        id: 3,
        subject: "Physiologie Humaine",
        icon: FaHeart,
        questions: 45,
        duration: "80 min",
        difficulty: "Difficile",
        lastScore: null,
        available: true,
      },
      {
        id: 4,
        subject: "Histologie",
        icon: FaEye,
        questions: 35,
        duration: "60 min",
        difficulty: "Moyen",
        lastScore: "17/20",
        available: false,
      },
    ],
    S2: [
      {
        id: 5,
        subject: "Anatomie Systémique",
        icon: FaBone,
        questions: 60,
        duration: "100 min",
        difficulty: "Difficile",
        lastScore: "15/20",
        available: true,
      },
      {
        id: 6,
        subject: "Physiologie Cardio-Vasculaire",
        icon: FaHeart,
        questions: 45,
        duration: "85 min",
        difficulty: "Difficile",
        lastScore: null,
        available: true,
      },
      {
        id: 7,
        subject: "Neuroanatomie",
        icon: FaBrain,
        questions: 50,
        duration: "90 min",
        difficulty: "Très Difficile",
        lastScore: "13/20",
        available: true,
      },
      {
        id: 8,
        subject: "Embryologie",
        icon: FaMedkit,
        questions: 40,
        duration: "70 min",
        difficulty: "Moyen",
        lastScore: "16/20",
        available: true,
      },
    ],
    S3: [
      {
        id: 9,
        subject: "Pathologie Générale",
        icon: FaStethoscope,
        questions: 55,
        duration: "95 min",
        difficulty: "Difficile",
        lastScore: "14/20",
        available: true,
      },
      {
        id: 10,
        subject: "Pharmacologie",
        icon: FaMedkit,
        questions: 50,
        duration: "85 min",
        difficulty: "Moyen",
        lastScore: null,
        available: true,
      },
      {
        id: 11,
        subject: "Microbiologie",
        icon: FaEye,
        questions: 45,
        duration: "80 min",
        difficulty: "Moyen",
        lastScore: "15/20",
        available: false,
      },
    ],
    S4: [
      {
        id: 12,
        subject: "Pathologie Systémique",
        icon: FaStethoscope,
        questions: 60,
        duration: "100 min",
        difficulty: "Très Difficile",
        lastScore: "16/20",
        available: true,
      },
      {
        id: 13,
        subject: "Sémiologie Médicale",
        icon: FaHeart,
        questions: 40,
        duration: "75 min",
        difficulty: "Difficile",
        lastScore: null,
        available: true,
      },
      {
        id: 14,
        subject: "Imagerie Médicale",
        icon: FaEye,
        questions: 35,
        duration: "65 min",
        difficulty: "Moyen",
        lastScore: "17/20",
        available: true,
      },
    ],
    S5: [
      {
        id: 15,
        subject: "Médecine Interne",
        icon: FaStethoscope,
        questions: 70,
        duration: "120 min",
        difficulty: "Très Difficile",
        lastScore: "15/20",
        available: true,
      },
      {
        id: 16,
        subject: "Chirurgie Générale",
        icon: FaMedkit,
        questions: 50,
        duration: "90 min",
        difficulty: "Difficile",
        lastScore: null,
        available: true,
      },
      {
        id: 17,
        subject: "Pédiatrie",
        icon: FaHeart,
        questions: 45,
        duration: "80 min",
        difficulty: "Moyen",
        lastScore: "18/20",
        available: true,
      },
    ],
    S6: [
      {
        id: 18,
        subject: "Gynécologie-Obstétrique",
        icon: FaHeart,
        questions: 55,
        duration: "95 min",
        difficulty: "Difficile",
        lastScore: "16/20",
        available: true,
      },
      {
        id: 19,
        subject: "Psychiatrie",
        icon: FaBrain,
        questions: 40,
        duration: "75 min",
        difficulty: "Moyen",
        lastScore: null,
        available: true,
      },
      {
        id: 20,
        subject: "Médecine Légale",
        icon: FaFileAlt,
        questions: 35,
        duration: "60 min",
        difficulty: "Facile",
        lastScore: "19/20",
        available: false,
      },
    ],
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "Facile":
        return "text-green-400";
      case "Moyen":
        return "text-yellow-400";
      case "Difficile":
        return "text-orange-400";
      case "Très Difficile":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  const handleStartExam = (examId) => {
    navigate(`/exam/${examId}`);
  };

  // Load exam results from localStorage
  useEffect(() => {
    const savedResults = JSON.parse(
      localStorage.getItem("examResults") || "[]"
    );
    // Add some sample data if no results exist
    if (savedResults.length === 0) {
      const sampleResults = [
        {
          examId: 1,
          subject: "Anatomie Générale",
          score: "16.0",
          correctAnswers: 8,
          totalQuestions: 10,
          timeSpent: 2400,
          date: "2024-02-10",
          semester: "S1",
          answers: {},
        },
        {
          examId: 2,
          subject: "Biologie Cellulaire",
          score: "14.5",
          correctAnswers: 7,
          totalQuestions: 10,
          timeSpent: 2700,
          date: "2024-02-08",
          semester: "S1",
          answers: {},
        },
        {
          examId: 3,
          subject: "Physiologie Humaine",
          score: "17.5",
          correctAnswers: 9,
          totalQuestions: 10,
          timeSpent: 2100,
          date: "2024-02-05",
          semester: "S1",
          answers: {},
        },
        {
          examId: 4,
          subject: "Pathologie Générale",
          score: "15.0",
          correctAnswers: 8,
          totalQuestions: 10,
          timeSpent: 2600,
          date: "2024-01-28",
          semester: "S3",
          answers: {},
        },
        {
          examId: 5,
          subject: "Pharmacologie",
          score: "18.0",
          correctAnswers: 9,
          totalQuestions: 10,
          timeSpent: 1980,
          date: "2024-01-25",
          semester: "S3",
          answers: {},
        },
      ];
      setExamResults(sampleResults);
      localStorage.setItem("examResults", JSON.stringify(sampleResults));
    } else {
      setExamResults(savedResults);
    }
  }, []);

  const getScoreColor = (score) => {
    const numScore = parseFloat(score);
    if (numScore >= 16) return "text-green-400";
    if (numScore >= 12) return "text-yellow-400";
    if (numScore >= 10) return "text-orange-400";
    return "text-red-400";
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}min`;
    }
    return `${minutes}min`;
  };

  const recentResults = [
    {
      subject: "Anatomie Générale",
      score: "16/20",
      date: "2024-02-10",
      semester: "S1",
    },
    {
      subject: "Physiologie Cardio-Vasculaire",
      score: "15/20",
      date: "2024-02-08",
      semester: "S2",
    },
    {
      subject: "Pathologie Générale",
      score: "14/20",
      date: "2024-02-05",
      semester: "S3",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0A0F] via-[#111015] to-[#1A1625] flex">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse delay-1000"></div>
      </div>

      {/* Main Content */}
      <div className="flex-1 relative z-10">
        {/* Content Area */}
        <div className="p-6">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="space-y-8">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                  <StatsCard stat={stat} index={index} />
                ))}
              </div>

              {/* Semester Selection */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden"
              >
                <div className="p-6 border-b border-gray-700/50">
                  <h2 className="text-2xl font-bold text-white flex items-center">
                    <FaGraduationCap className="mr-3 text-blue-400" />
                    Choisir un semestre
                  </h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {semesters.map((semester) => (
                      <SemesterCard
                        semester={semester}
                        selectedSemester={selectedSemester}
                        setSelectedSemester={setSelectedSemester}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Available Exams for Selected Semester */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden"
              >
                <div className="p-6 border-b border-gray-700/50">
                  <h2 className="text-2xl font-bold text-white flex items-center">
                    <FaFileAlt className="mr-3 text-purple-400" />
                    Examens disponibles -{" "}
                    {semesters.find((s) => s.id === selectedSemester)?.name}
                  </h2>
                </div>
                <div className="p-6 space-y-4">
                  {examsBySeester[selectedSemester]?.map((exam) => (
                    <ExamsBySeesterCard
                      exam={exam}
                      handleStartExam={handleStartExam}
                    />
                  ))}
                </div>
              </motion.div>
              {/* Recent Results */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden"
              >
                <div className="p-6 border-b border-gray-700/50">
                  <h2 className="text-2xl font-bold text-white flex items-center">
                    <FaChartBar className="mr-3 text-green-400" />
                    Résultats récents
                  </h2>
                </div>
                <div className="p-6 space-y-4">
                  {recentResults.map((result, index) => (
                    <RecentResultsCard result={result} index={index} />
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
