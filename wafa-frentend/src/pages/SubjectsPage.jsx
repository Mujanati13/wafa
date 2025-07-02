import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  FaBook,
  FaSearch,
  FaFilter,
  FaPlay,
  FaClock,
  FaStar,
  FaTrophy,
  FaChartBar,
  FaGraduationCap,
  FaStethoscope,
  FaMedkit,
  FaBrain,
  FaHeart,
  FaEye,
  FaBone,
  FaDna,
  FaVirus,
  FaPills,
  FaUserMd,
  FaAmbulance,
  FaMicroscope,
  FaFlask,
  FaBookOpen,
  FaCheckCircle,
  FaExclamationTriangle,
  FaLock
} from 'react-icons/fa';

const SubjectsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const navigate = useNavigate();

  const subjects = [
    {
      id: 1,
      name: 'Anatomie Générale',
      year: '1ère Année',
      semester: 'S1',
      icon: FaBone,
      color: 'from-blue-500 to-purple-500',
      description: 'Étude de la structure du corps humain',
      totalExams: 25,
      completedExams: 22,
      averageScore: 16.8,
      lastScore: 18,
      studyTime: 45,
      difficulty: 'Moyen',
      isUnlocked: true,
      topics: ['Système squelettique', 'Système musculaire', 'Système nerveux'],
      nextExam: 'Anatomie du membre supérieur'
    },
    {
      id: 2,
      name: 'Physiologie Humaine',
      year: '1ère Année',
      semester: 'S1',
      icon: FaHeart,
      color: 'from-red-500 to-pink-500',
      description: 'Fonctionnement des systèmes corporels',
      totalExams: 20,
      completedExams: 18,
      averageScore: 15.4,
      lastScore: 16,
      studyTime: 38,
      difficulty: 'Difficile',
      isUnlocked: true,
      topics: ['Système cardiovasculaire', 'Système respiratoire', 'Système digestif'],
      nextExam: 'Physiologie cardiaque'
    },
    {
      id: 3,
      name: 'Biologie Cellulaire',
      year: '1ère Année',
      semester: 'S1',
      icon: FaMicroscope,
      color: 'from-green-500 to-blue-500',
      description: 'Structure et fonction des cellules',
      totalExams: 18,
      completedExams: 15,
      averageScore: 17.2,
      lastScore: 19,
      studyTime: 32,
      difficulty: 'Facile',
      isUnlocked: true,
      topics: ['Membrane cellulaire', 'Organites', 'Division cellulaire'],
      nextExam: 'Mitose et méiose'
    },
    {
      id: 4,
      name: 'Histologie',
      year: '1ère Année',
      semester: 'S2',
      icon: FaEye,
      color: 'from-purple-500 to-indigo-500',
      description: 'Étude des tissus biologiques',
      totalExams: 22,
      completedExams: 12,
      averageScore: 14.8,
      lastScore: 15,
      studyTime: 28,
      difficulty: 'Moyen',
      isUnlocked: true,
      topics: ['Tissus épithéliaux', 'Tissus conjonctifs', 'Tissus musculaires'],
      nextExam: 'Tissus nerveux'
    },
    {
      id: 5,
      name: 'Neuroanatomie',
      year: '2ème Année',
      semester: 'S3',
      icon: FaBrain,
      color: 'from-indigo-500 to-purple-500',
      description: 'Anatomie du système nerveux',
      totalExams: 30,
      completedExams: 8,
      averageScore: 13.5,
      lastScore: 14,
      studyTime: 25,
      difficulty: 'Très Difficile',
      isUnlocked: true,
      topics: ['Système nerveux central', 'Système nerveux périphérique', 'Neurologie'],
      nextExam: 'Anatomie du cerveau'
    },
    {
      id: 6,
      name: 'Pharmacologie',
      year: '2ème Année',
      semester: 'S3',
      icon: FaPills,
      color: 'from-yellow-500 to-orange-500',
      description: 'Action des médicaments sur l\'organisme',
      totalExams: 24,
      completedExams: 10,
      averageScore: 16.1,
      lastScore: 17,
      studyTime: 35,
      difficulty: 'Difficile',
      isUnlocked: true,
      topics: ['Pharmacocinétique', 'Pharmacodynamie', 'Toxicologie'],
      nextExam: 'Mécanismes d\'action'
    },
    {
      id: 7,
      name: 'Microbiologie',
      year: '2ème Année',
      semester: 'S4',
      icon: FaVirus,
      color: 'from-emerald-500 to-green-500',
      description: 'Étude des micro-organismes',
      totalExams: 26,
      completedExams: 5,
      averageScore: 15.8,
      lastScore: 16,
      studyTime: 20,
      difficulty: 'Moyen',
      isUnlocked: true,
      topics: ['Bactériologie', 'Virologie', 'Mycologie'],
      nextExam: 'Bactéries pathogènes'
    },
    {
      id: 8,
      name: 'Pathologie Générale',
      year: '3ème Année',
      semester: 'S5',
      icon: FaStethoscope,
      color: 'from-red-600 to-red-500',
      description: 'Mécanismes des maladies',
      totalExams: 28,
      completedExams: 0,
      averageScore: 0,
      lastScore: null,
      studyTime: 0,
      difficulty: 'Très Difficile',
      isUnlocked: false,
      topics: ['Inflammation', 'Néoplasies', 'Troubles métaboliques'],
      nextExam: 'Processus inflammatoires'
    },
    {
      id: 9,
      name: 'Médecine Interne',
      year: '3ème Année',
      semester: 'S6',
      icon: FaUserMd,
      color: 'from-blue-600 to-blue-500',
      description: 'Diagnostic et traitement médical',
      totalExams: 32,
      completedExams: 0,
      averageScore: 0,
      lastScore: null,
      studyTime: 0,
      difficulty: 'Très Difficile',
      isUnlocked: false,
      topics: ['Cardiologie', 'Pneumologie', 'Gastroentérologie'],
      nextExam: 'Sémiologie cardiaque'
    }
  ];

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Facile': return 'text-green-400 bg-green-400/20';
      case 'Moyen': return 'text-yellow-400 bg-yellow-400/20';
      case 'Difficile': return 'text-orange-400 bg-orange-400/20';
      case 'Très Difficile': return 'text-red-400 bg-red-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 60) return 'bg-yellow-500';
    if (progress >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const filteredSubjects = subjects.filter(subject => {
    const matchesSearch = subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         subject.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesYear = selectedYear === 'all' || subject.year === selectedYear;
    const matchesDifficulty = selectedDifficulty === 'all' || subject.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesYear && matchesDifficulty;
  });

  const sortedSubjects = [...filteredSubjects].sort((a, b) => {
    switch (sortBy) {
      case 'name': return a.name.localeCompare(b.name);
      case 'progress': return (b.completedExams / b.totalExams) - (a.completedExams / a.totalExams);
      case 'score': return b.averageScore - a.averageScore;
      case 'difficulty': 
        const difficultyOrder = { 'Facile': 1, 'Moyen': 2, 'Difficile': 3, 'Très Difficile': 4 };
        return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
      default: return 0;
    }
  });

  const handleStartExam = (subjectId) => {
    navigate(`/dashboard/exams?subject=${subjectId}`);
  };

  const totalSubjects = subjects.length;
  const unlockedSubjects = subjects.filter(s => s.isUnlocked).length;
  const averageProgress = subjects.reduce((acc, subject) => acc + (subject.completedExams / subject.totalExams), 0) / subjects.length * 100;
  const totalStudyTime = subjects.reduce((acc, subject) => acc + subject.studyTime, 0);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-white mb-2">Matières</h1>
        <p className="text-gray-400">Explorez et progressez dans vos matières médicales</p>
      </motion.div>

      {/* Statistics Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
      >
        {[
          { label: 'Total Matières', value: totalSubjects, icon: FaBook, color: 'from-blue-500 to-purple-500' },
          { label: 'Matières Débloquées', value: unlockedSubjects, icon: FaGraduationCap, color: 'from-green-500 to-blue-500' },
          { label: 'Progression Moyenne', value: `${averageProgress.toFixed(1)}%`, icon: FaChartBar, color: 'from-purple-500 to-pink-500' },
          { label: 'Temps d\'Étude Total', value: `${totalStudyTime}h`, icon: FaClock, color: 'from-pink-500 to-red-500' }
        ].map((stat, index) => (
          <div
            key={index}
            className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color} bg-opacity-20`}>
                <stat.icon className="text-xl text-white" />
              </div>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
            </div>
            <div className="text-gray-300 text-sm">{stat.label}</div>
          </div>
        ))}
      </motion.div>

      {/* Filters and Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 mb-8"
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher une matière..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-purple-500 focus:outline-none"
            />
          </div>

          {/* Year Filter */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-purple-500 focus:outline-none"
          >
            <option value="all">Toutes les années</option>
            <option value="1ère Année">1ère Année</option>
            <option value="2ème Année">2ème Année</option>
            <option value="3ème Année">3ème Année</option>
          </select>

          {/* Difficulty Filter */}
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-purple-500 focus:outline-none"
          >
            <option value="all">Toutes difficultés</option>
            <option value="Facile">Facile</option>
            <option value="Moyen">Moyen</option>
            <option value="Difficile">Difficile</option>
            <option value="Très Difficile">Très Difficile</option>
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-purple-500 focus:outline-none"
          >
            <option value="name">Trier par nom</option>
            <option value="progress">Trier par progression</option>
            <option value="score">Trier par score</option>
            <option value="difficulty">Trier par difficulté</option>
          </select>
        </div>
      </motion.div>

      {/* Subjects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedSubjects.map((subject, index) => {
          const progress = (subject.completedExams / subject.totalExams) * 100;
          
          return (
            <motion.div
              key={subject.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className={`relative bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300 ${
                !subject.isUnlocked ? 'opacity-60' : ''
              }`}
            >
              {/* Lock overlay for locked subjects */}
              {!subject.isUnlocked && (
                <div className="absolute inset-0 bg-gray-900/80 rounded-2xl flex items-center justify-center z-10">
                  <div className="text-center">
                    <FaLock className="text-4xl text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-400 font-medium">Matière Verrouillée</p>
                    <p className="text-gray-500 text-sm">Complétez les prérequis</p>
                  </div>
                </div>
              )}

              {/* Subject Header */}
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-r ${subject.color} bg-opacity-20`}>
                  <subject.icon className="text-2xl text-white" />
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(subject.difficulty)}`}>
                    {subject.difficulty}
                  </span>
                </div>
              </div>

              {/* Subject Info */}
              <div className="mb-4">
                <h3 className="text-lg font-bold text-white mb-1">{subject.name}</h3>
                <p className="text-gray-400 text-sm mb-2">{subject.description}</p>
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <span>{subject.year}</span>
                  <span>•</span>
                  <span>{subject.semester}</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-300">Progression</span>
                  <span className="text-white font-medium">{subject.completedExams}/{subject.totalExams}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className={`${getProgressColor(progress)} h-2 rounded-full transition-all duration-500`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="text-right mt-1">
                  <span className="text-white text-sm font-medium">{progress.toFixed(1)}%</span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="text-center">
                  <div className="text-white font-semibold">
                    {subject.averageScore > 0 ? `${subject.averageScore}/20` : '-'}
                  </div>
                  <div className="text-gray-400 text-xs">Moyenne</div>
                </div>
                <div className="text-center">
                  <div className="text-white font-semibold">{subject.studyTime}h</div>
                  <div className="text-gray-400 text-xs">Étude</div>
                </div>
                <div className="text-center">
                  <div className="text-white font-semibold">
                    {subject.lastScore ? `${subject.lastScore}/20` : '-'}
                  </div>
                  <div className="text-gray-400 text-xs">Dernier</div>
                </div>
              </div>

              {/* Next Exam */}
              {subject.isUnlocked && (
                <div className="mb-4 p-3 bg-gray-800/50 rounded-lg">
                  <div className="text-gray-300 text-xs mb-1">Prochain examen:</div>
                  <div className="text-white text-sm font-medium">{subject.nextExam}</div>
                </div>
              )}

              {/* Action Button */}
              <button
                onClick={() => subject.isUnlocked && handleStartExam(subject.id)}
                disabled={!subject.isUnlocked}
                className={`w-full flex items-center justify-center space-x-2 py-3 rounded-lg font-medium transition-all duration-300 ${
                  subject.isUnlocked
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600'
                    : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                }`}
              >
                <FaPlay className="text-sm" />
                <span>{subject.isUnlocked ? 'Commencer' : 'Verrouillé'}</span>
              </button>

              {/* Topics Tags */}
              <div className="mt-4 flex flex-wrap gap-1">
                {subject.topics.slice(0, 2).map((topic, topicIndex) => (
                  <span
                    key={topicIndex}
                    className="px-2 py-1 bg-gray-700/50 text-gray-300 text-xs rounded-md"
                  >
                    {topic}
                  </span>
                ))}
                {subject.topics.length > 2 && (
                  <span className="px-2 py-1 bg-gray-700/50 text-gray-400 text-xs rounded-md">
                    +{subject.topics.length - 2}
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* No Results */}
      {sortedSubjects.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <FaBook className="text-6xl text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Aucune matière trouvée</h3>
          <p className="text-gray-400">Essayez de modifier vos filtres de recherche</p>
        </motion.div>
      )}
    </div>
  );
};

export default SubjectsPage; 