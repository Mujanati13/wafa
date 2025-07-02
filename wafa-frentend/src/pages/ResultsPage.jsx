import React, { useState, useEffect } from 'react'
import { FaStar, FaClock, FaTrophy, FaGraduationCap, FaPercentage, FaEye , FaChartBar ,FaSearch, FaBookOpen, FaChartLine, FaFilter, FaDownload} from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

const ResultsPage = () => {

  const [examResults, setExamResults] = useState([])
  const [selectedPeriod, setSelectedPeriod] = useState('all')
  const [selectedSubject, setSelectedSubject] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedExam, setSelectedExam] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  


 

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


    const resultsStats = calculateStats()
    const subjectPerformance = getSubjectPerformance()
    
    return (
      <div className="space-y-8 m-10">
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
}

export default ResultsPage