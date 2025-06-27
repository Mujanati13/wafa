import React from 'react'

const HeroSection = () => {
  return (
      
      <section className="flex flex-col items-center justify-center text-center py-20 px-6 md:py-32 relative overflow-hidden">
        {/* Background gradient effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
        </div>
        
        <div className="relative z-10">
          <div className="mb-6">
            <span className="inline-block px-4 py-2 bg-purple-500/20 text-purple-300 rounded-full text-sm font-medium border border-purple-500/30">
              ✨ Plateforme d'éducation médicale
            </span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black mb-8 leading-tight">
          Less work <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-purple-600">
            Better results
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl leading-relaxed">
            Study as much as you've hoped, for where and when you want to succeed with AI-powered medical education.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
            <button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-10 py-4 rounded-full font-bold text-lg shadow-xl transition-all duration-200 transform hover:scale-105">
              Commencer →
            </button>
            <button className="bg-gray-800/50 backdrop-blur-sm hover:bg-gray-700/50 text-purple-400 px-10 py-4 rounded-full font-bold text-lg border border-purple-500/50 transition-all duration-200 transform hover:scale-105">
              Voir la démo
            </button>
          </div>
          
          {/* Dashboard Preview */}
          <div className="relative max-w-6xl mx-auto">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-3xl blur-3xl"></div>
            <div className="relative bg-gray-900/50 backdrop-blur-sm rounded-3xl p-8 border border-gray-700/50 shadow-2xl">
              <img 
                src="https://placehold.co/800x500/1a1625/8b5cf6?text=WAFA+Dashboard+Interface" 
                alt="WAFA dashboard preview" 
                className="w-full rounded-2xl shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>
  )
}

export default HeroSection