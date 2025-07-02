import React, { useState } from 'react'
import { FaHome, FaFileAlt, FaChartBar, FaTrophy, FaBook, FaCalendarAlt, FaUser, FaCog , FaSignOutAlt} from 'react-icons/fa'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
const SideBar = () => {
    const [activeTab, setActiveTab] = useState('overview')
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const sidebarItems = [
        { id: 'overview', label: 'Aperçu', icon: FaHome, path: '/dashboard/home' },
        { id: 'exams', label: 'Examens QCM', icon: FaFileAlt, path: '/dashboard/exams' },
        { id: 'results', label: 'Mes Résultats', icon: FaChartBar, path: '/dashboard/results' },
        { id: 'progress', label: 'Progression', icon: FaTrophy, path: '/dashboard/progress' },
        { id: 'subjects', label: 'Matières', icon: FaBook, path: '/dashboard/subjects' },
        { id: 'calendar', label: 'Planning', icon: FaCalendarAlt, path: '/dashboard/calendar' },
        { id: 'profile', label: 'Profil', icon: FaUser, path: '/dashboard/profile' },
        { id: 'settings', label: 'Paramètres', icon: FaCog, path: '/dashboard/settings' },
      ]
      const navigate = useNavigate()
  return (
            
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
              onClick={() => {
                setActiveTab(item.id)
                navigate(item.path)
              }}
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
   
  )
}

export default SideBar