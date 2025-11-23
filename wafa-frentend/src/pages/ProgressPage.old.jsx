import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FaTrophy,
  FaBook,
  FaStar,
  FaClock,
  FaFire, 
  FaMedal,
  FaGraduationCap,
  FaArrowUp,
  FaArrowDown,
  FaEquals,
  FaCheck,
  FaLock
} from 'react-icons/fa';

const ProgressPage = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedSubject, setSelectedSubject] = useState('all');

  const overallStats = [
    { label: 'Score Moyen', value: '16.8/20', change: '+0.5', trend: 'up', icon: FaStar, color: 'from-yellow-400 to-orange-500' },
    { label: 'Temps d\'Étude Total', value: '1,240h', change: '+45h', trend: 'up', icon: FaClock, color: 'from-blue-400 to-purple-500' },
    { label: 'Examens Complétés', value: '145', change: '+12', trend: 'up', icon: FaBook, color: 'from-green-400 to-blue-500' },
    { label: 'Série Actuelle', value: '18 jours', change: '+3', trend: 'up', icon: FaFire, color: 'from-red-400 to-pink-500' }
  ];

  const subjectProgress = [
    { name: 'Anatomie', progress: 85, score: '17.2/20', completed: 24, total: 30, color: 'bg-blue-500' },
    { name: 'Physiologie', progress: 78, score: '15.8/20', completed: 19, total: 25, color: 'bg-green-500' },
    { name: 'Pharmacologie', progress: 92, score: '18.1/20', completed: 22, total: 24, color: 'bg-purple-500' },
    { name: 'Pathologie', progress: 67, score: '14.5/20', completed: 12, total: 18, color: 'bg-pink-500' },
    { name: 'Microbiologie', progress: 71, score: '15.2/20', completed: 15, total: 21, color: 'bg-yellow-500' }
  ];

  const weeklyActivity = [
    { day: 'Lun', studied: 4.5, exams: 3 },
    { day: 'Mar', studied: 3.2, exams: 2 },
    { day: 'Mer', studied: 5.1, exams: 4 },
    { day: 'Jeu', studied: 2.8, exams: 2 },
    { day: 'Ven', studied: 4.0, exams: 3 },
    { day: 'Sam', studied: 6.2, exams: 5 },
    { day: 'Dim', studied: 3.5, exams: 3 }
  ];

  const achievements = [
    { 
      icon: FaTrophy, 
      title: 'Premier de la Classe', 
      description: 'Classé #1 en Anatomie', 
      unlocked: true, 
      date: '15 Nov 2024',
      rarity: 'legendary',
      color: 'from-yellow-400 to-orange-500' 
    },
    { 
      icon: FaMedal, 
      title: 'Marathon de l\'Étude', 
      description: '100 heures d\'étude ce mois', 
      unlocked: true, 
      date: '10 Nov 2024',
      rarity: 'epic',
      color: 'from-purple-400 to-pink-500' 
    },
    { 
      icon: FaFire, 
      title: 'Série Parfaite', 
      description: '30 jours consécutifs d\'étude', 
      unlocked: false, 
      progress: 18,
      total: 30,
      rarity: 'rare',
      color: 'from-red-400 to-orange-500' 
    },
    { 
      icon: FaGraduationCap, 
      title: 'Expert en Tout', 
      description: 'Score > 15/20 dans toutes les matières', 
      unlocked: false, 
      progress: 4,
      total: 5,
      rarity: 'epic',
      color: 'from-blue-400 to-purple-500' 
    }
  ];

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up': return <FaArrowUp className="text-green-400" />;
      case 'down': return <FaArrowDown className="text-red-400" />;
      default: return <FaEquals className="text-gray-400" />;
    }
  };

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'legendary': return 'border-yellow-400';
      case 'epic': return 'border-purple-400';
      case 'rare': return 'border-blue-400';
      default: return 'border-gray-400';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-white mb-2">Progression</h1>
        <p className="text-gray-400">Suivez vos progrès et accomplissements d'apprentissage</p>
      </motion.div>

      {/* Overall Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        {overallStats.map((stat, index) => (
          <div
            key={index}
            className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color} bg-opacity-20`}>
                <stat.icon className="text-xl text-white" />
              </div>
              <div className="flex items-center space-x-1 text-sm">
                {getTrendIcon(stat.trend)}
                <span className={stat.trend === 'up' ? 'text-green-400' : stat.trend === 'down' ? 'text-red-400' : 'text-gray-400'}>
                  {stat.change}
                </span>
              </div>
            </div>
            <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
            <div className="text-gray-300 text-sm">{stat.label}</div>
          </div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Subject Progress */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50"
        >
          <h2 className="text-xl font-semibold text-white mb-6">Progression par Matière</h2>
          <div className="space-y-4">
            {subjectProgress.map((subject, index) => (
              <div key={index} className="p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white font-medium">{subject.name}</h3>
                  <div className="text-right">
                    <div className="text-white font-semibold">{subject.score}</div>
                    <div className="text-gray-400 text-sm">{subject.completed}/{subject.total} examens</div>
                  </div>
                </div>
                <div className="relative">
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className={`${subject.color} h-2 rounded-full transition-all duration-500`}
                      style={{ width: `${subject.progress}%` }}
                    />
                  </div>
                  <span className="absolute right-0 -top-6 text-white text-sm font-medium">
                    {subject.progress}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Weekly Activity */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50"
        >
          <h2 className="text-xl font-semibold text-white mb-6">Activité de la Semaine</h2>
          <div className="space-y-4">
            {weeklyActivity.map((day, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-gray-300 w-8">{day.day}</span>
                <div className="flex-1 mx-4">
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                        style={{ width: `${(day.studied / 7) * 100}%` }}
                      />
                    </div>
                    <span className="text-white text-sm w-8">{day.studied}h</span>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <FaBook className="text-gray-400 text-xs" />
                  <span className="text-gray-300 text-sm">{day.exams}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Achievements */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-8 bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50"
      >
        <h2 className="text-xl font-semibold text-white mb-6">Accomplissements</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {achievements.map((achievement, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className={`relative p-4 bg-gray-800/50 rounded-lg border-2 ${getRarityColor(achievement.rarity)} ${
                achievement.unlocked ? 'opacity-100' : 'opacity-60'
              } hover:bg-gray-800/70 transition-all duration-300`}
            >
              {!achievement.unlocked && (
                <div className="absolute top-2 right-2">
                  <FaLock className="text-gray-500 text-sm" />
                </div>
              )}
              
              <div className={`w-12 h-12 bg-gradient-to-r ${achievement.color} rounded-lg flex items-center justify-center mb-3`}>
                <achievement.icon className="text-white text-xl" />
              </div>
              
              <h3 className="text-white font-medium mb-1">{achievement.title}</h3>
              <p className="text-gray-400 text-sm mb-3">{achievement.description}</p>
              
              {achievement.unlocked ? (
                <div className="flex items-center space-x-2">
                  <FaCheck className="text-green-400" />
                  <span className="text-green-400 text-sm">{achievement.date}</span>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Progrès</span>
                    <span className="text-white">{achievement.progress}/{achievement.total}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-1">
                    <div
                      className={`bg-gradient-to-r ${achievement.color} h-1 rounded-full`}
                      style={{ width: `${(achievement.progress / achievement.total) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default ProgressPage; 