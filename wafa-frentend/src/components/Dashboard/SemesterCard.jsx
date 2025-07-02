import React from 'react'
import { motion } from 'framer-motion'

const SemesterCard = ({ semester, selectedSemester, setSelectedSemester }) => {
  return (
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
  )
}

export default SemesterCard