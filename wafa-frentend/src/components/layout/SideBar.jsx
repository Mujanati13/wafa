import React, { useState } from 'react'
import { FaHome, FaFileAlt, FaChartBar, FaTrophy, FaBook, FaCalendarAlt, FaUser, FaCog , FaSignOutAlt, FaStethoscope, FaMedkit, FaBrain, FaHeart} from 'react-icons/fa'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
const SideBar = () => {
    const [activeTab, setActiveTab] = useState('overview')
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const sidebarItems = [
        { id: 'overview', label: 'Dashboard', icon: FaHome, path: '/dashboard/home' },
        { id: 'nephro', label: 'Néphrologie/uro', icon: FaStethoscope, path: '/dashboard/subjects/nephro-uro' },
        { id: 'legal', label: 'Med Legal-éthique...', icon: FaFileAlt, path: '/dashboard/subjects/med-legal' },
        { id: 'synthese', label: 'Synthèse Thérap...', icon: FaMedkit, path: '/dashboard/subjects/synthese' },
        { id: 'sante', label: 'Santé Publique', icon: FaChartBar, path: '/dashboard/subjects/sante-publique' }
      ]
      const navigate = useNavigate()
  return (
            
     <motion.div 
     initial={{ x: -300 }}
     animate={{ x: 0 }}
     className={`relative z-10 ${sidebarOpen ? 'w-64' : 'w-20'} bg-white/80 backdrop-blur-sm border-r border-blue-200 shadow-lg transition-all duration-300 `}
   >
   

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
                  ? 'bg-gradient-to-r from-blue-500/20 to-blue-600/20 text-blue-700 border border-blue-300 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-blue-50'
              }`}
            >
              <item.icon className="text-xl flex-shrink-0" />
              {sidebarOpen && <span className="font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>


   </motion.div>
   
  )
}

export default SideBar