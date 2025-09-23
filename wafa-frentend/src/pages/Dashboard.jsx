import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import { api } from "@/lib/utils";
import { moduleService } from "@/services/moduleService";
import { Lock } from "lucide-react";
import ModuleCard from "@/components/Dashboard/ModuleCard";

const Dashboard = () => {
  const navigate = useNavigate();
  const [semester, setSemester] = useState("S1");
  const [coursesData, setCoursesData] = useState();
  const semesters = [
    { name: "S1", isOpen: true },
    { name: "S2", isOpen: false },
    { name: "S3", isOpen: false },
    { name: "S4", isOpen: false },
    { name: "S5", isOpen: false },
    { name: "S6", isOpen: false },
    { name: "S7", isOpen: false },
    { name: "S8", isOpen: false },
    { name: "S9", isOpen: false },
    { name: "S10", isOpen: false },
  ];
  useEffect(() => {
    const fetchData = async () => {
      const { data } = await moduleService.getAllmodules();
      localStorage.setItem("modules", JSON.stringify(data.data));
      setCoursesData(data.data);
    };
    fetchData();
  }, []);
  // Course data based on the uploaded images
  const courses = [
    {
      id: "nephro-uro",
      name: "Néphrologie/uro",
      img: "https://res.cloudinary.com/void-elsan/image/upload/f_auto/q_90/v1/inline-images/nephrologie-%28personnalise%29.jpg?_a=BAAAV6Bs", // kidney emoji
      difficulty: "hard",
      progress: 0,
      color: "from-blue-500 to-indigo-500",
      bgColor: "bg-blue-600",
      exams: [
        { name: "Amylose", questions: 11, completed: 0 },
        { name: "Intro néphrologie", questions: 2, completed: 0 },
        { name: "Nephro héréditaire", questions: 35, completed: 0 },
        { name: "Nephro diabétique", questions: 40, completed: 0 },
        { name: "Nephro lupique", questions: 30, completed: 0 },
        {
          name: "Glomérulonéphrite extra capillaire",
          questions: 19,
          completed: 0,
        },
        { name: "Lgm", questions: 20, completed: 0 },
        { name: "HSF", questions: 20, completed: 0 },
      ],
    },
    {
      id: "med-legal",
      name: "Med legal-éthique-travail-...",
      img: "https://medecinelegale.com/wp-content/uploads/2021/09/Me%CC%81decin-et-marteau-_1047750205-scaled.jpg", // scales emoji
      difficulty: "medium",
      progress: 0,
      color: "from-teal-500 to-blue-500",
      bgColor: "bg-teal-600",
    },
    {
      id: "synthese",
      name: "Synthèse thérapeutique",
      img: "💊", // pill emoji
      difficulty: "medium",
      progress: 0,
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-500",
    },
    {
      id: "sante-publique",
      name: "Santé publique",
      img: "📊", // chart emoji
      difficulty: "medium",
      progress: 0,
      color: "from-indigo-500 to-purple-500",
      bgColor: "bg-indigo-600",
    },
  ];

  // Leaderboard data based on uploaded images
  const leaderboard = [
    {
      rank: 1,
      user: "Tired",
      level: "Level 707",
      percentage: 80,
      points: 70680,
    },
    { rank: 2, user: "N.A", level: "Level 527", percentage: 0, points: 52600 },
    {
      rank: 3,
      user: "scarface",
      level: "Level 507",
      percentage: 30,
      points: 50630,
    },
    {
      rank: 4,
      user: "we r cheating",
      level: "Level 506",
      percentage: 80,
      points: 50580,
    },
    {
      rank: 5,
      user: "objectif validation",
      level: "Level 398",
      percentage: 90,
      points: 39790,
    },
  ];

  const handleCourseClick = (courseId) => {
    navigate(`/dashboard/subjects/${courseId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-3 sm:p-4 md:p-6">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64 bg-blue-100 rounded-full opacity-30 animate-pulse"></div>
        <div className="absolute bottom-1/4 left-1/4 w-40 h-40 sm:w-60 sm:h-60 md:w-80 md:h-80 bg-teal-100 rounded-full opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 bg-blue-200 rounded-full opacity-25 animate-pulse delay-500"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 bg-white/70 backdrop-blur-md rounded-xl shadow-md border border-blue-100 px-3 py-2 sm:px-4 sm:py-3 md:px-6 w-full">
        {/* Left: Welcome & Info */}
        <div className="flex flex-col max-w-full lg:max-w-xl">
          <h1 className="text-base sm:text-lg md:text-xl font-extrabold text-gray-900 mb-1.5 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
            <span className="inline-block bg-gradient-to-r from-blue-500 via-teal-400 to-blue-600 text-transparent bg-clip-text">
              Bienvenue
            </span>
            <span className="inline-block text-blue-600 text-xs sm:text-sm md:text-base">
              Az-eddine serhani
            </span>
          </h1>
          <p className="text-gray-600 text-xs sm:text-sm leading-snug mt-0.5">
            Bienvenue dans votre interface WAFA,{" "}
            <span className="font-semibold text-blue-600">
              Az-eddine serhani
            </span>
            .<br className="hidden sm:inline" />
            <span className="text-gray-500 block sm:inline mt-0.5 sm:mt-0">
              Si vous avez des questions ou souhaitez en savoir plus, n'hésitez
              pas à nous{" "}
              <a className="text-blue-500 cursor-pointer hover:underline">
                contacter.
              </a>{" "}
            </span>
          </p>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-2">
          <div className="flex flex-row flex-wrap gap-1.5">
            {semesters.map((item, index) => (
              <button
                key={item.name}
                disabled={!item.isOpen}
                onClick={() => setSemester(item.name)}
                className={`px-2 sm:px-2 md:px-3 py-1 sm:py-1.5 rounded-full font-medium transition-all duration-200 border text-xs sm:text-xs flex items-center gap-1 sm:gap-2
                  ${
                    semester === item.name
                      ? "bg-gradient-to-r from-blue-500 to-teal-400 text-white border-blue-500 shadow-md scale-105"
                      : "bg-white text-blue-600 border-blue-200 hover:bg-blue-50 hover:scale-105"
                  }
                `}
                style={{
                  minWidth: 40,
                }}
              >
                {item.name}
                {item.isOpen === false && <Lock className="w-3 sm:w-4" />}
              </button>
            ))}
          </div>
          <div className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-full font-medium transition-all duration-200 border bg-white">
            <span className="font-medium text-xs tracking-wide text-gray-700">
              Plan Gratuit
            </span>
          </div>
        </div>
      </div>

      <div className="relative z-10 flex flex-col gap-4 sm:gap-6">
        <div className="">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            Dashboard <span className="text-blue-600">{semester}</span>
          </h2>
          <div className="bg-blue-600 h-1 w-8 sm:w-10 mt-1"></div>
        </div>

        {/* Courses Section */}
        <div className="w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {coursesData &&
              coursesData?.map((course) => (
                <ModuleCard key={course.id} course={course} handleCourseClick={handleCourseClick} />
              ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
