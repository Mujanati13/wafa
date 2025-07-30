import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 h-[70px] ${
      isScrolled 
        ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200' 
        : 'bg-white/90 backdrop-blur-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-2">
          {/* Logo */}
          <Link to="/" className="text-2xl md:text-3xl font-bold tracking-tight group cursor-pointer transform transition-all duration-300 hover:scale-105">
            <div className="relative text-4xl">
              <span className="text-blue-600 group-hover:text-blue-700 transition-colors duration-300">WA</span>
              <span className="text-teal-600 group-hover:text-teal-700 transition-colors duration-300">FA</span>
              <div className="absolute -inset-1 bg-blue-100 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {['Accueil',   'A propos',   'Tarifs',    'Mode paiments',  'Contact'].map((item, index) => (
              <a 
                key={item}
                href={`#${item.toLowerCase().replace('à propos', 'about').replace('é', 'e')}`}
                className="relative text-gray-700 hover:text-blue-600 transition-all duration-300 group py-2 px-3 rounded-lg hover:bg-blue-50 font-medium"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <span className="relative z-10">{item}</span>
                <span className="absolute inset-x-0 bottom-0 h-0.5 bg-blue-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
              </a>
            ))}
          </nav>

          {/* Desktop CTA Button */}
          <div className="hidden md:flex items-center space-x-4">
          <Link
              to="/login"
              className="flex items-center justify-center gap-2 w-full bg-white text-blue-600 border border-blue-600 hover:bg-blue-50 hover:text-blue-700 font-semibold px-6 py-3 rounded-lg shadow transition-all duration-300"
              onClick={() => setIsMenuOpen(false)}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12H3m0 0l4-4m-4 4l4 4M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              login
            </Link>
            <Link
              to="/register"
              className="flex items-center justify-center gap-2 w-full bg-blue-600 text-white hover:bg-blue-700 font-semibold px-6 py-3 rounded-lg shadow transition-all duration-300"
              onClick={() => setIsMenuOpen(false)}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 21v-2a4 4 0 00-8 0v2M12 11a4 4 0 100-8 4 4 0 000 8z" />
              </svg>
              S'inscrire
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={toggleMenu}
            className="md:hidden relative w-10 h-10 flex flex-col justify-center items-center space-y-1.5 group rounded-lg hover:bg-blue-50 transition-colors duration-300"
            aria-label="Toggle menu"
          >
            <span className={`w-6 h-0.5 bg-gray-700 transition-all duration-300 group-hover:bg-blue-600 ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
            <span className={`w-6 h-0.5 bg-gray-700 transition-all duration-300 group-hover:bg-blue-600 ${isMenuOpen ? 'opacity-0' : ''}`}></span>
            <span className={`w-6 h-0.5 bg-gray-700 transition-all duration-300 group-hover:bg-blue-600 ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden transition-all duration-300 ${
        isMenuOpen 
          ? 'max-h-150 opacity-100' 
          : 'max-h-0 opacity-0'
      } overflow-hidden bg-white shadow-lg border-t border-gray-200`}>
        <nav className="px-4 py-6 space-y-4">
          {['Accueil', 'a propos', 'tarifs', 'mode paiments', 'contact'].map((item, index) => (
            <a 
              key={item}
              href={`#${item.toLowerCase().replace('à propos', 'about').replace('é', 'e')}`}
              className="block text-gray-700 hover:text-blue-600 transition-colors duration-300 py-3 px-4 rounded-lg hover:bg-blue-50 font-medium"
              onClick={() => setIsMenuOpen(false)}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {item}
            </a>
          ))}
          <div className="pt-4 border-t border-gray-100 flex flex-col gap-3">
            <Link
              to="/login"
              className="flex items-center justify-center gap-2 w-full bg-white text-blue-600 border border-blue-600 hover:bg-blue-50 hover:text-blue-700 font-semibold px-6 py-3 rounded-lg shadow transition-all duration-300"
              onClick={() => setIsMenuOpen(false)}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12H3m0 0l4-4m-4 4l4 4M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              login
            </Link>
            <Link
              to="/register"
              className="flex items-center justify-center gap-2 w-full bg-blue-600 text-white hover:bg-blue-700 font-semibold px-6 py-3 rounded-lg shadow transition-all duration-300"
              onClick={() => setIsMenuOpen(false)}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 21v-2a4 4 0 00-8 0v2M12 11a4 4 0 100-8 4 4 0 000 8z" />
              </svg>
              S'inscrire
            </Link>
          </div>
        </nav>
      </div>
    </header>
  )
}

export default Header