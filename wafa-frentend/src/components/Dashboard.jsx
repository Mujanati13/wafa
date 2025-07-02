import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FaHome, FaUser, FaBook, FaChartBar, FaCog, FaSignOutAlt, 
  FaBell, FaSearch, FaTrophy, FaClock, FaPlay, FaUsers,
  FaGraduationCap, FaCalendarAlt, FaFileAlt, FaComment,
  FaStethoscope, FaMedkit, FaBrain, FaHeart, FaEye, FaBone,
  FaCheck, FaTimes, FaStar, FaArrowUp, FaArrowDown, FaMinus,
  FaBookOpen, FaPercentage, FaChartLine, FaFilter, FaDownload
} from 'react-icons/fa'
import SideBar from './layout/SideBar'

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview')

  const [selectedSemester, setSelectedSemester] = useState('S1')
  const navigate = useNavigate()

  // Results page state
  const [examResults, setExamResults] = useState([])
  const [selectedPeriod, setSelectedPeriod] = useState('all')
  const [selectedSubject, setSelectedSubject] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedExam, setSelectedExam] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  

  const stats = [
    { label: 'Examens passés', value: '24', icon: FaFileAlt, color: 'from-blue-500 to-purple-500' },
    { label: 'Moyenne générale', value: '15.2/20', icon: FaStar, color: 'from-green-500 to-blue-500' },
    { label: 'Temps d\'étude', value: '142h', icon: FaClock, color: 'from-purple-500 to-pink-500' },
    { label: 'Taux de réussite', value: '87%', icon: FaTrophy, color: 'from-pink-500 to-red-500' },
  ]

  const semesters = [
    { id: 'S1', name: 'Semestre 1', year: '1ère Année' },
    { id: 'S2', name: 'Semestre 2', year: '1ère Année' },
    { id: 'S3', name: 'Semestre 3', year: '2ème Année' },
    { id: 'S4', name: 'Semestre 4', year: '2ème Année' },
    { id: 'S5', name: 'Semestre 5', year: '3ème Année' },
    { id: 'S6', name: 'Semestre 6', year: '3ème Année' },
  ]

  const examsBySeester = {
    'S1': [
      { id: 1, subject: 'Anatomie Générale', icon: FaBone, questions: 50, duration: '90 min', difficulty: 'Moyen', lastScore: '16/20', available: true },
      { id: 2, subject: 'Biologie Cellulaire', icon: FaMedkit, questions: 40, duration: '75 min', difficulty: 'Facile', lastScore: '14/20', available: true },
      { id: 3, subject: 'Physiologie Humaine', icon: FaHeart, questions: 45, duration: '80 min', difficulty: 'Difficile', lastScore: null, available: true },
      { id: 4, subject: 'Histologie', icon: FaEye, questions: 35, duration: '60 min', difficulty: 'Moyen', lastScore: '17/20', available: false },
    ],
    'S2': [
      { id: 5, subject: 'Anatomie Systémique', icon: FaBone, questions: 60, duration: '100 min', difficulty: 'Difficile', lastScore: '15/20', available: true },
      { id: 6, subject: 'Physiologie Cardio-Vasculaire', icon: FaHeart, questions: 45, duration: '85 min', difficulty: 'Difficile', lastScore: null, available: true },
      { id: 7, subject: 'Neuroanatomie', icon: FaBrain, questions: 50, duration: '90 min', difficulty: 'Très Difficile', lastScore: '13/20', available: true },
      { id: 8, subject: 'Embryologie', icon: FaMedkit, questions: 40, duration: '70 min', difficulty: 'Moyen', lastScore: '16/20', available: true },
    ],
    'S3': [
      { id: 9, subject: 'Pathologie Générale', icon: FaStethoscope, questions: 55, duration: '95 min', difficulty: 'Difficile', lastScore: '14/20', available: true },
      { id: 10, subject: 'Pharmacologie', icon: FaMedkit, questions: 50, duration: '85 min', difficulty: 'Moyen', lastScore: null, available: true },
      { id: 11, subject: 'Microbiologie', icon: FaEye, questions: 45, duration: '80 min', difficulty: 'Moyen', lastScore: '15/20', available: false },
    ],
    'S4': [
      { id: 12, subject: 'Pathologie Systémique', icon: FaStethoscope, questions: 60, duration: '100 min', difficulty: 'Très Difficile', lastScore: '16/20', available: true },
      { id: 13, subject: 'Sémiologie Médicale', icon: FaHeart, questions: 40, duration: '75 min', difficulty: 'Difficile', lastScore: null, available: true },
      { id: 14, subject: 'Imagerie Médicale', icon: FaEye, questions: 35, duration: '65 min', difficulty: 'Moyen', lastScore: '17/20', available: true },
    ],
    'S5': [
      { id: 15, subject: 'Médecine Interne', icon: FaStethoscope, questions: 70, duration: '120 min', difficulty: 'Très Difficile', lastScore: '15/20', available: true },
      { id: 16, subject: 'Chirurgie Générale', icon: FaMedkit, questions: 50, duration: '90 min', difficulty: 'Difficile', lastScore: null, available: true },
      { id: 17, subject: 'Pédiatrie', icon: FaHeart, questions: 45, duration: '80 min', difficulty: 'Moyen', lastScore: '18/20', available: true },
    ],
    'S6': [
      { id: 18, subject: 'Gynécologie-Obstétrique', icon: FaHeart, questions: 55, duration: '95 min', difficulty: 'Difficile', lastScore: '16/20', available: true },
      { id: 19, subject: 'Psychiatrie', icon: FaBrain, questions: 40, duration: '75 min', difficulty: 'Moyen', lastScore: null, available: true },
      { id: 20, subject: 'Médecine Légale', icon: FaFileAlt, questions: 35, duration: '60 min', difficulty: 'Facile', lastScore: '19/20', available: false },
    ],
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Facile': return 'text-green-400'
      case 'Moyen': return 'text-yellow-400'
      case 'Difficile': return 'text-orange-400'
      case 'Très Difficile': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const handleStartExam = (examId) => {
    navigate(`/exam/${examId}`)
  }

  // Load exam results from localStorage
  useEffect(() => {
    const savedResults = JSON.parse(localStorage.getItem('examResults') || '[]')
    // Add some sample data if no results exist
    if (savedResults.length === 0) {
      const sampleResults = [
        {
          examId: 1,
          subject: 'Anatomie Générale',
          score: '16.0',
          correctAnswers: 8,
          totalQuestions: 10,
          timeSpent: 2400,
          date: '2024-02-10',
          semester: 'S1',
          answers: {}
        },
        {
          examId: 2,
          subject: 'Biologie Cellulaire',
          score: '14.5',
          correctAnswers: 7,
          totalQuestions: 10,
          timeSpent: 2700,
          date: '2024-02-08',
          semester: 'S1',
          answers: {}
        },
        {
          examId: 3,
          subject: 'Physiologie Humaine',
          score: '17.5',
          correctAnswers: 9,
          totalQuestions: 10,
          timeSpent: 2100,
          date: '2024-02-05',
          semester: 'S1',
          answers: {}
        },
        {
          examId: 4,
          subject: 'Pathologie Générale',
          score: '15.0',
          correctAnswers: 8,
          totalQuestions: 10,
          timeSpent: 2600,
          date: '2024-01-28',
          semester: 'S3',
          answers: {}
        },
        {
          examId: 5,
          subject: 'Pharmacologie',
          score: '18.0',
          correctAnswers: 9,
          totalQuestions: 10,
          timeSpent: 1980,
          date: '2024-01-25',
          semester: 'S3',
          answers: {}
        }
      ]
      setExamResults(sampleResults)
      localStorage.setItem('examResults', JSON.stringify(sampleResults))
    } else {
      setExamResults(savedResults)
    }
  }, [])

  // Calculate overall statistics
  const calculateStats = () => {
    if (examResults.length === 0) return {}

    const totalExams = examResults.length
    const averageScore = examResults.reduce((sum, result) => sum + parseFloat(result.score), 0) / totalExams
    const totalCorrect = examResults.reduce((sum, result) => sum + result.correctAnswers, 0)
    const totalQuestions = examResults.reduce((sum, result) => sum + result.totalQuestions, 0)
    const successRate = (totalCorrect / totalQuestions) * 100
    const totalTimeSpent = examResults.reduce((sum, result) => sum + result.timeSpent, 0)

    // Find best and worst performance
    const sortedByScore = [...examResults].sort((a, b) => parseFloat(b.score) - parseFloat(a.score))
    const bestScore = sortedByScore[0]
    const worstScore = sortedByScore[sortedByScore.length - 1]

    return {
      totalExams,
      averageScore: averageScore.toFixed(1),
      successRate: successRate.toFixed(1),
      totalTimeSpent: Math.floor(totalTimeSpent / 3600), // Convert to hours
      bestScore,
      worstScore
    }
  }

  // Get subject-wise performance
  const getSubjectPerformance = () => {
    const subjectStats = {}
    
    examResults.forEach(result => {
      if (!subjectStats[result.subject]) {
        subjectStats[result.subject] = {
          totalExams: 0,
          totalScore: 0,
          totalCorrect: 0,
          totalQuestions: 0,
          exams: []
        }
      }
      
      const subject = subjectStats[result.subject]
      subject.totalExams++
      subject.totalScore += parseFloat(result.score)
      subject.totalCorrect += result.correctAnswers
      subject.totalQuestions += result.totalQuestions
      subject.exams.push(result)
    })

    return Object.entries(subjectStats).map(([subject, stats]) => ({
      subject,
      averageScore: (stats.totalScore / stats.totalExams).toFixed(1),
      successRate: ((stats.totalCorrect / stats.totalQuestions) * 100).toFixed(1),
      totalExams: stats.totalExams,
      exams: stats.exams
    }))
  }

  // Filter results based on selected criteria
  const filteredResults = examResults.filter(result => {
    const matchesSubject = selectedSubject === 'all' || result.subject === selectedSubject
    const matchesSearch = result.subject.toLowerCase().includes(searchTerm.toLowerCase())
    
    let matchesPeriod = true
    if (selectedPeriod !== 'all') {
      const resultDate = new Date(result.date)
      const now = new Date()
      const daysDiff = Math.floor((now - resultDate) / (1000 * 60 * 60 * 24))
      
      switch (selectedPeriod) {
        case 'week':
          matchesPeriod = daysDiff <= 7
          break
        case 'month':
          matchesPeriod = daysDiff <= 30
          break
        case 'semester':
          matchesPeriod = daysDiff <= 120
          break
      }
    }
    
    return matchesSubject && matchesSearch && matchesPeriod
  })

  const getScoreColor = (score) => {
    const numScore = parseFloat(score)
    if (numScore >= 16) return 'text-green-400'
    if (numScore >= 12) return 'text-yellow-400'
    if (numScore >= 10) return 'text-orange-400'
    return 'text-red-400'
  }

  const getScoreBgColor = (score) => {
    const numScore = parseFloat(score)
    if (numScore >= 16) return 'bg-green-500/20 border-green-500/30'
    if (numScore >= 12) return 'bg-yellow-500/20 border-yellow-500/30'
    if (numScore >= 10) return 'bg-orange-500/20 border-orange-500/30'
    return 'bg-red-500/20 border-red-500/30'
  }

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) {
      return `${hours}h ${minutes}min`
    }
    return `${minutes}min`
  }

  const recentResults = [
    { subject: 'Anatomie Générale', score: '16/20', date: '2024-02-10', semester: 'S1' },
    { subject: 'Physiologie Cardio-Vasculaire', score: '15/20', date: '2024-02-08', semester: 'S2' },
    { subject: 'Pathologie Générale', score: '14/20', date: '2024-02-05', semester: 'S3' },
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
                    <motion.button
                      key={semester.id}
                      onClick={() => setSelectedSemester(semester.id)}
                      className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                        selectedSemester === semester.id
                          ? 'border-blue-500 bg-blue-500/20 text-blue-400'
                          : 'border-gray-600 bg-gray-800/30 text-gray-400 hover:border-gray-500 hover:text-gray-300'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <div className="text-lg font-bold">{semester.name}</div>
                      <div className="text-sm">{semester.year}</div>
                    </motion.button>
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
                  Examens disponibles - {semesters.find(s => s.id === selectedSemester)?.name}
                </h2>
              </div>
              <div className="p-6 space-y-4">
                {examsBySeester[selectedSemester]?.map((exam) => (
                  <div key={exam.id} className="bg-gray-800/30 rounded-xl p-6 hover:bg-gray-800/50 transition-colors duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 bg-opacity-20 mr-4">
                          <exam.icon className="text-xl text-purple-400" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-white">{exam.subject}</h3>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className="text-gray-400 text-sm">{exam.questions} questions</span>
                            <span className="text-gray-400 text-sm">{exam.duration}</span>
                            <span className={`text-sm font-medium ${getDifficultyColor(exam.difficulty)}`}>
                              {exam.difficulty}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        {exam.lastScore && (
                          <div className="text-green-400 font-semibold mb-2">
                            Dernier score: {exam.lastScore}
                          </div>
                        )}
                        <button
                          disabled={!exam.available}
                          onClick={() => exam.available && handleStartExam(exam.id)}
                          className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                            exam.available
                              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600'
                              : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          {exam.available ? (
                            <span className="flex items-center">
                              <FaPlay className="mr-2" />
                              Commencer l'examen
                            </span>
                          ) : (
                            'Indisponible'
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
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
                  <div key={index} className="bg-gray-800/30 rounded-xl p-4 hover:bg-gray-800/50 transition-colors duration-300">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-1">{result.subject}</h3>
                        <p className="text-gray-400 text-sm">{result.semester}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-green-400 font-bold text-lg">{result.score}</div>
                        <div className="text-gray-400 text-sm">{result.date}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )
      
      case 'exams':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold text-white">Examens QCM</h1>
              <select 
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="bg-gray-800 text-white border border-gray-600 rounded-xl px-4 py-2"
              >
                {semesters.map((semester) => (
                  <option key={semester.id} value={semester.id}>
                    {semester.name} - {semester.year}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {examsBySeester[selectedSemester]?.map((exam) => (
                <motion.div
                  key={exam.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden transition-all duration-300 ${
                    exam.available ? 'hover:border-purple-500/50' : 'opacity-60'
                  }`}
                >
                  <div className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 bg-opacity-20 mr-4">
                        <exam.icon className="text-xl text-purple-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white">{exam.subject}</h3>
                        <p className={`text-sm font-medium ${getDifficultyColor(exam.difficulty)}`}>{exam.difficulty}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-gray-400">
                        <span>Questions:</span>
                        <span>{exam.questions}</span>
                      </div>
                      <div className="flex justify-between text-gray-400">
                        <span>Durée:</span>
                        <span>{exam.duration}</span>
                      </div>
                      {exam.lastScore && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Dernier score:</span>
                          <span className="text-green-400 font-semibold">{exam.lastScore}</span>
                        </div>
                      )}
                    </div>
                    
                    <button 
                      disabled={!exam.available}
                      onClick={() => exam.available && handleStartExam(exam.id)}
                      className={`w-full py-3 rounded-xl font-medium transition-all duration-300 ${
                        exam.available
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600'
                          : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {exam.available ? (
                        <span className="flex items-center justify-center">
                          <FaPlay className="mr-2" />
                          Commencer l'examen
                        </span>
                      ) : (
                        'Indisponible'
                      )}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )

      case 'results':
        const resultsStats = calculateStats()
        const subjectPerformance = getSubjectPerformance()
        
        return (
          <div className="space-y-8">
            {/* Overall Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 bg-opacity-20">
                    <FaGraduationCap className="text-xl text-purple-400" />
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-white">{resultsStats.totalExams || 0}</div>
                  </div>
                </div>
                <div className="text-gray-300 text-sm">Examens passés</div>
              </div>

              <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-r from-green-500 to-blue-500 bg-opacity-20">
                    <FaStar className="text-xl text-green-400" />
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-white">{resultsStats.averageScore || '0.0'}/20</div>
                  </div>
                </div>
                <div className="text-gray-300 text-sm">Moyenne générale</div>
              </div>

              <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 bg-opacity-20">
                    <FaPercentage className="text-xl text-blue-400" />
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-white">{resultsStats.successRate || '0.0'}%</div>
                  </div>
                </div>
                <div className="text-gray-300 text-sm">Taux de réussite</div>
              </div>

              <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-r from-pink-500 to-red-500 bg-opacity-20">
                    <FaClock className="text-xl text-pink-400" />
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-white">{resultsStats.totalTimeSpent || 0}h</div>
                  </div>
                </div>
                <div className="text-gray-300 text-sm">Temps d'étude</div>
              </div>
            </div>

            {/* Performance by Subject */}
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <FaChartBar className="mr-3 text-purple-400" />
                Performance par matière
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {subjectPerformance.map((subject, index) => (
                  <div key={index} className="bg-gray-800/30 rounded-xl p-4">
                    <h3 className="font-semibold text-white mb-2">{subject.subject}</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Moyenne:</span>
                        <span className={`font-semibold ${getScoreColor(subject.averageScore)}`}>
                          {subject.averageScore}/20
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Réussite:</span>
                        <span className="text-white">{subject.successRate}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Examens:</span>
                        <span className="text-white">{subject.totalExams}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Filters and Search */}
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex items-center space-x-2">
                  <FaFilter className="text-gray-400" />
                  <span className="text-white font-medium">Filtres:</span>
                </div>
                
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2"
                >
                  <option value="all">Toute période</option>
                  <option value="week">Cette semaine</option>
                  <option value="month">Ce mois</option>
                  <option value="semester">Ce semestre</option>
                </select>

                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2"
                >
                  <option value="all">Toutes matières</option>
                  {[...new Set(examResults.map(r => r.subject))].map(subject => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>

                <div className="relative flex-1 max-w-md">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher une matière..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 flex items-center">
                  <FaDownload className="mr-2" />
                  Exporter
                </button>
              </div>
            </div>

            {/* Results List */}
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden">
              <div className="p-6 border-b border-gray-700/50">
                <h2 className="text-2xl font-bold text-white flex items-center">
                  <FaBookOpen className="mr-3 text-blue-400" />
                  Historique des examens ({filteredResults.length})
                </h2>
              </div>

              <div className="p-6">
                {filteredResults.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-gray-400 text-lg mb-2">Aucun résultat trouvé</div>
                    <p className="text-gray-500">Modifiez vos filtres ou passez un examen</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredResults.map((result, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`rounded-xl border p-6 hover:bg-gray-800/30 transition-all duration-300 cursor-pointer ${getScoreBgColor(result.score)}`}
                        onClick={() => {
                          setSelectedExam(result)
                          setShowDetailModal(true)
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center mb-2">
                              <h3 className="text-xl font-semibold text-white mr-4">{result.subject}</h3>
                              <span className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-sm">
                                {result.semester || 'S1'}
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="text-gray-400">Score:</span>
                                <span className={`ml-2 font-bold ${getScoreColor(result.score)}`}>
                                  {result.score}/20
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-400">Réponses:</span>
                                <span className="ml-2 text-white">
                                  {result.correctAnswers}/{result.totalQuestions}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-400">Temps:</span>
                                <span className="ml-2 text-white">{formatTime(result.timeSpent)}</span>
                              </div>
                              <div>
                                <span className="text-gray-400">Date:</span>
                                <span className="ml-2 text-white">{result.date}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <div className={`text-2xl font-bold ${getScoreColor(result.score)}`}>
                                {Math.round((result.correctAnswers / result.totalQuestions) * 100)}%
                              </div>
                              <div className="text-gray-400 text-sm">Réussite</div>
                            </div>
                            <FaEye className="text-gray-400 hover:text-purple-400 transition-colors duration-300" />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Best and Worst Performance */}
            {resultsStats.bestScore && resultsStats.worstScore && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-r from-green-500/10 to-green-600/10 border border-green-500/30 rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-green-400 mb-4 flex items-center">
                    <FaTrophy className="mr-2" />
                    Meilleure performance
                  </h3>
                  <div className="space-y-2">
                    <div className="text-white font-semibold">{resultsStats.bestScore.subject}</div>
                    <div className="text-green-400 text-2xl font-bold">{resultsStats.bestScore.score}/20</div>
                    <div className="text-gray-300 text-sm">{resultsStats.bestScore.date}</div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-red-500/10 to-red-600/10 border border-red-500/30 rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-red-400 mb-4 flex items-center">
                    <FaChartLine className="mr-2" />
                    À améliorer
                  </h3>
                  <div className="space-y-2">
                    <div className="text-white font-semibold">{resultsStats.worstScore.subject}</div>
                    <div className="text-red-400 text-2xl font-bold">{resultsStats.worstScore.score}/20</div>
                    <div className="text-gray-300 text-sm">{resultsStats.worstScore.date}</div>
                  </div>
                </div>
              </div>
            )}
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

      {/* <SideBar /> */}

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

      {/* Detail Modal */}
      <AnimatePresence>
        {showDetailModal && selectedExam && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={() => setShowDetailModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-gray-900 rounded-2xl border border-gray-700 p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">{selectedExam.subject}</h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-white transition-colors duration-300"
                >
                  <FaTimes className="text-xl" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-800/30 rounded-xl p-4">
                  <div className="text-gray-400 text-sm mb-1">Score final</div>
                  <div className={`text-3xl font-bold ${getScoreColor(selectedExam.score)}`}>
                    {selectedExam.score}/20
                  </div>
                </div>
                <div className="bg-gray-800/30 rounded-xl p-4">
                  <div className="text-gray-400 text-sm mb-1">Pourcentage</div>
                  <div className="text-3xl font-bold text-white">
                    {Math.round((selectedExam.correctAnswers / selectedExam.totalQuestions) * 100)}%
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-400">Réponses correctes:</span>
                  <span className="text-green-400 font-semibold">
                    {selectedExam.correctAnswers}/{selectedExam.totalQuestions}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Temps passé:</span>
                  <span className="text-white">{formatTime(selectedExam.timeSpent)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Date:</span>
                  <span className="text-white">{selectedExam.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Semestre:</span>
                  <span className="text-white">{selectedExam.semester || 'S1'}</span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-700">
                <div className="flex gap-4">
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="flex-1 bg-gray-600 text-white py-3 rounded-xl hover:bg-gray-700 transition-colors duration-300"
                  >
                    Fermer
                  </button>
                  <button className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300">
                    Revoir l'examen
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Dashboard 