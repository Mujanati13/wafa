import React from 'react'

const RecentResultsCard = ({ result, index }) => {
  return (
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
  )
}

export default RecentResultsCard    