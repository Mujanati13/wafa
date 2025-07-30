import React from "react";

const HeroSection = () => {
  return (
    <section className="bg-gradient-to-br from-blue-50 to-white min-h-screen relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-100 rounded-full opacity-20 -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-teal-100 rounded-full opacity-30 translate-x-1/3 translate-y-1/3"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 md:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div className="text-left">
            <h1 className="text-4xl md:text-6xl font-bold mb-8 leading-tight">
              Exceller dans vos examens
              <br />
              avec{" "}
              <span className="text-blue-600">Qcmology</span>
            </h1>

            <p className="text-lg md:text-xl text-gray-600 mb-12 leading-relaxed max-w-xl">
             
Préparez-vous efficacement pour les examens -sans stress- 
avec notre plateforme d'exam par annees et par cours , conçue pour les étudiants en médecine marrakech. 
<br />
Une préparation efficace = plus de temps libre + meilleures notes.
  
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg shadow-lg transition-all duration-300 transform hover:scale-105">
                Commencer gratuitement
              </button>
           
            </div>
          </div>

          {/* Right Column - Illustration */}
          <div className="hidden lg:flex justify-center items-center">
            <div className="relative w-full max-w-lg">
              {/* Educational illustration placeholder - you can replace with actual SVG/image */}
              <div className="relative">
                {/* Main illustration container */}
                <div className="w-96 h-96 bg-gradient-to-br from-blue-100 to-teal-100 rounded-3xl flex items-center justify-center relative overflow-hidden">
                  {/* Books stack */}
                  <div className="absolute bottom-20 left-16 w-16 h-20 bg-red-400 rounded transform -rotate-12 shadow-lg"></div>
                  <div className="absolute bottom-24 left-20 w-16 h-20 bg-yellow-400 rounded transform -rotate-6 shadow-lg"></div>
                  <div className="absolute bottom-28 left-24 w-16 h-20 bg-green-400 rounded shadow-lg"></div>
                  
                  {/* Graduation cap */}
                  <div className="absolute top-16 right-20 w-12 h-8 bg-gray-800 rounded-full"></div>
                  <div className="absolute top-14 right-16 w-20 h-2 bg-gray-800 rounded"></div>
                  
                  {/* Light bulb */}
                  <div className="absolute top-20 left-20 w-8 h-12 bg-yellow-300 rounded-full"></div>
                  <div className="absolute top-32 left-22 w-4 h-2 bg-gray-400 rounded"></div>
                  
                  {/* Computer/tablet */}
                  <div className="absolute center w-32 h-20 bg-gray-700 rounded-lg shadow-xl">
                    <div className="w-28 h-16 bg-blue-200 rounded m-2 flex items-center justify-center">
                      <div className="w-6 h-6 bg-blue-600 rounded-full"></div>
                    </div>
                  </div>
                  
                  {/* Floating elements */}
                  <div className="absolute top-32 right-32 w-6 h-6 bg-blue-400 rounded-full animate-bounce"></div>
                  <div className="absolute bottom-32 right-16 w-4 h-4 bg-purple-400 rounded-full animate-pulse"></div>
                  <div className="absolute top-40 left-32 w-5 h-5 bg-pink-400 rounded-full animate-pulse delay-300"></div>
                </div>
                
                {/* Floating academic elements */}
                <div className="absolute -top-4 -right-4 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center">
                  <span className="text-blue-600 font-bold">Q</span>
                </div>
                <div className="absolute -bottom-4 -left-4 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center">
                  <span className="text-blue-600">✓</span>
                </div>
                <div className="absolute top-1/2 -right-8 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
                  <span className="text-yellow-600">💡</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
