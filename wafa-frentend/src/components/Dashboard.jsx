import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  FaHome, FaUser, FaBook, FaChartBar, FaCog, FaSignOutAlt, 
  FaBell, FaSearch, FaTrophy, FaClock, FaPlay, FaUsers,
  FaGraduationCap, FaCalendarAlt, FaFileAlt, FaComment
} from 'react-icons/fa'

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const sidebarItems = [
    { id: 'overview', label: 'Aperçu', icon: FaHome },
    { id: 'courses', label: 'Mes Cours', icon: FaBook },
    { id: 'progress', label: 'Progression', icon: FaChartBar },
    { id: 'certificates', label: 'Certificats', icon: FaTrophy },
    { id: 'calendar', label: 'Calendrier', icon: FaCalendarAlt },
    { id: 'assignments', label: 'Devoirs', icon: FaFileAlt },
    { id: 'discussions', label: 'Discussions', icon: FaComment },
    { id: 'profile', label: 'Profil', icon: FaUser },
    { id: 'settings', label: 'Paramètres', icon: FaCog },
  ]

  const stats = [
    { label: 'Cours en cours', value: '3', icon: FaBook, color: 'from-purple-500 to-pink-500' },
    { label: 'Cours terminés', value: '12', icon: FaGraduationCap, color: 'from-blue-500 to-purple-500' },
    { label: 'Heures d\'étude', value: '87h', icon: FaClock, color: 'from-pink-500 to-red-500' },
    { label: 'Certificats obtenus', value: '5', icon: FaTrophy, color: 'from-green-500 to-blue-500' },
  ]

  const recentCourses = [
    { id: 1, title: 'Intelligence Artificielle Avancée', progress: 75, instructor: 'Dr. Marie Dubois', nextLesson: 'Deep Learning' },
    { id: 2, title: 'Développement Web Full Stack', progress: 60, instructor: 'Jean-Pierre Martin', nextLesson: 'React Hooks' },
    { id: 3, title: 'Data Science et Analytics', progress: 40, instructor: 'Sophie Laurent', nextLesson: 'Machine Learning' },
  ]

  const upcomingTasks = [
    { id: 1, title: 'Projet IA - Rendu final', dueDate: '2024-02-15', course: 'Intelligence Artificielle' },
    { id: 2, title: 'Quiz - Algorithmes', dueDate: '2024-02-12', course: 'Data Science' },
    { id: 3, title: 'Présentation - Architecture Web', dueDate: '2024-02-18', course: 'Développement Web' },
  ]

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300 group"
                >
                  <div className={`absolute inset-0 bg-gradient-to-r ${stat.color} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-300`}></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color} bg-opacity-20`}>
                        <stat.icon className="text-xl text-white" />
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-white">{stat.value}</div>
                      </div>
                    </div>
                    <div className="text-gray-300 text-sm">{stat.label}</div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Recent Courses */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden"
            >
              <div className="p-6 border-b border-gray-700/50">
                <h2 className="text-2xl font-bold text-white flex items-center">
                  <FaBook className="mr-3 text-purple-400" />
                  Cours en cours
                </h2>
              </div>
              <div className="p-6 space-y-4">
                {recentCourses.map((course) => (
                  <div key={course.id} className="bg-gray-800/30 rounded-xl p-4 hover:bg-gray-800/50 transition-colors duration-300">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold text-white">{course.title}</h3>
                      <button className="text-purple-400 hover:text-purple-300 transition-colors duration-300">
                        <FaPlay />
                      </button>
                    </div>
                    <div className="flex items-center text-gray-400 text-sm mb-3">
                      <FaUser className="mr-2" />
                      {course.instructor}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex-1 mr-4">
                        <div className="flex items-center justify-between text-sm text-gray-400 mb-1">
                          <span>Progression</span>
                          <span>{course.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <motion.div 
                            className="h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${course.progress}%` }}
                            transition={{ duration: 1, delay: 0.5 }}
                          ></motion.div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-400">
                        Prochain: <span className="text-purple-400">{course.nextLesson}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Upcoming Tasks */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden"
            >
              <div className="p-6 border-b border-gray-700/50">
                <h2 className="text-2xl font-bold text-white flex items-center">
                  <FaCalendarAlt className="mr-3 text-pink-400" />
                  Tâches à venir
                </h2>
              </div>
              <div className="p-6 space-y-4">
                {upcomingTasks.map((task) => (
                  <div key={task.id} className="bg-gray-800/30 rounded-xl p-4 hover:bg-gray-800/50 transition-colors duration-300">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-1">{task.title}</h3>
                        <p className="text-gray-400 text-sm">{task.course}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-pink-400 font-semibold">{task.dueDate}</div>
                        <div className="text-gray-400 text-xs">Échéance</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )
      
      case 'courses':
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white">Mes Cours</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentCourses.map((course) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden hover:border-purple-500/50 transition-all duration-300"
                >
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-white mb-2">{course.title}</h3>
                    <p className="text-gray-400 mb-4">{course.instructor}</p>
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm text-gray-400 mb-1">
                        <span>Progression</span>
                        <span>{course.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className="h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                          style={{ width: `${course.progress}%` }}
                        ></div>
                      </div>
                    </div>
                    <button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300">
                      Continuer le cours
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )
      
      default:
        return (
          <div className="text-center py-12">
            <h1 className="text-3xl font-bold text-white mb-4">Section en développement</h1>
            <p className="text-gray-400">Cette section sera bientôt disponible.</p>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0A0F] via-[#111015] to-[#1A1625] flex">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse delay-1000"></div>
      </div>

      {/* Sidebar */}
      <motion.div 
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        className={`relative z-10 ${sidebarOpen ? 'w-64' : 'w-20'} bg-gray-900/50 backdrop-blur-sm border-r border-gray-700/50 transition-all duration-300`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-gray-700/50">
          <Link to="/" className="flex items-center space-x-3">
            <div className="text-2xl font-bold tracking-tight">
              <span className="text-white">WA</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400">FA</span>
            </div>
            {sidebarOpen && <span className="text-white font-semibold">Dashboard</span>}
          </Link>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                activeTab === item.id
                  ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white border border-purple-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              <item.icon className="text-xl flex-shrink-0" />
              {sidebarOpen && <span className="font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Toggle Sidebar Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute -right-3 top-1/2 transform -translate-y-1/2 bg-gray-800 border border-gray-600 rounded-full p-2 hover:bg-gray-700 transition-colors duration-300"
        >
          <motion.div
            animate={{ rotate: sidebarOpen ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </motion.div>
        </button>

        {/* User Profile */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-700/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <FaUser className="text-white" />
            </div>
            {sidebarOpen && (
              <div className="flex-1">
                <div className="text-white font-semibold">Utilisateur</div>
                <div className="text-gray-400 text-sm">Étudiant</div>
              </div>
            )}
            <button className="text-gray-400 hover:text-red-400 transition-colors duration-300">
              <FaSignOutAlt />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 relative z-10">
        {/* Top Bar */}
        <div className="bg-gray-900/30 backdrop-blur-sm border-b border-gray-700/50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Tableau de bord</h1>
              <p className="text-gray-400">Bienvenue dans votre espace d'apprentissage</p>
            </div>
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  className="pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              {/* Notifications */}
              <button className="relative p-2 text-gray-400 hover:text-white transition-colors duration-300">
                <FaBell className="text-xl" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {renderContent()}
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard 