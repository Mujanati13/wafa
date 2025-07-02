import React from 'react'

const TopBar = () => {
  return (
    <div className="bg-gray-900/30 backdrop-blur-sm border-b border-gray-700/50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Tableau de bord</h1>
              <p className="text-gray-400">Bienvenue dans votre espace d'apprentissage</p>
            </div>
            
          </div>
        </div>
  )
}

export default TopBar