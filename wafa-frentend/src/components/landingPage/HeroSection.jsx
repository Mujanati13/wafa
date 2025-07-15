import React from 'react'

const HeroSection = () => {
  return (
    <section className="bg-gradient-to-br from-blue-50 to-white min-h-screen flex flex-col items-center justify-center text-center py-20 px-6 md:py-32 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-blue-100 rounded-full opacity-60 animate-pulse"></div>
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-teal-100 rounded-full opacity-40 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-blue-200 rounded-full opacity-30 animate-pulse delay-500"></div>
      </div>
      
      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="mb-8">
          <span className="inline-block px-6 py-3 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold border border-blue-200 shadow-sm">
            🎓 Plateforme d'Éducation Médicale
          </span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight text-gray-900">
          Moins de travail, <span className="text-blue-600 block mt-2">Meilleurs résultats</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
          Préparez-vous efficacement avec notre plateforme complète de QCM médicaux, 
          conçue pour les étudiants en médecine et les professionnels de santé.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg shadow-lg transition-all duration-300 transform hover:scale-105 hover:shadow-blue-500/25 flex items-center justify-center space-x-2">
            <span>Commencer maintenant</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
          <button className="bg-white hover:bg-gray-50 text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg border-2 border-blue-600 hover:border-blue-700 transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.01M15 10h1.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Démonstration</span>
          </button>
        </div>

        {/* Statistics Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-blue-100">
            <div className="text-3xl font-bold text-blue-600 mb-2">5000+</div>
            <div className="text-gray-600 font-medium">Questions QCM</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-blue-100">
            <div className="text-3xl font-bold text-blue-600 mb-2">1200+</div>
            <div className="text-gray-600 font-medium">Étudiants Actifs</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-blue-100">
            <div className="text-3xl font-bold text-blue-600 mb-2">95%</div>
            <div className="text-gray-600 font-medium">Taux de Réussite</div>
          </div>
        </div>
        
        {/* Dashboard Preview */}
        <div className="relative max-w-5xl mx-auto">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-200/20 to-teal-200/20 rounded-3xl blur-3xl"></div>
          <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-blue-100">
            <div className="aspect-video bg-gradient-to-br from-blue-50 to-white rounded-xl border-2 border-blue-100 flex items-center justify-center">
              <div className="text-center">
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Interface WAFA</h3>
                <p className="text-gray-600">Plateforme intuitive pour vos études médicales</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection