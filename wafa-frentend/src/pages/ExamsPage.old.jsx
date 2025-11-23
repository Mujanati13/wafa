import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { FaPlay, FaBone, FaMedkit, FaHeart, FaBrain, FaEye, FaStethoscope, FaFileAlt, FaTrophy, FaStar, FaClock } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import ExamCard from '../components/ExamsPage/ExamCard'

const ExamsPage = () => {


    const [selectedSemester, setSelectedSemester] = useState('S1')
    const navigate = useNavigate()
  
    
  
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
    const handleStartExam = (examId) => {
      navigate(`/dashboard/exam/${examId}`)
    }
 
  return (
    <div className="space-y-6 m-10">
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
              <ExamCard key={exam.id} exam={exam} handleStartExam={handleStartExam} />
              ))}
            </div>
          </div>
  )
}

export default ExamsPage