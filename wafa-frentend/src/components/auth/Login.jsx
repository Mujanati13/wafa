import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaEye, FaEyeSlash, FaGoogle, FaFacebook } from 'react-icons/fa'

const Login = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  })

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Handle login logic here
    console.log('Login attempt:', formData)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0A0F] via-[#111015] to-[#1A1625] flex items-center justify-center px-4 py-8">
      {/* Background gradient effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <div className="text-4xl font-bold tracking-tight group cursor-pointer transform transition-all duration-300 hover:scale-105">
              <div className="relative">
                <span className="text-white group-hover:text-gray-200 transition-colors duration-300 drop-shadow-lg">WA</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 group-hover:from-purple-300 group-hover:via-pink-300 group-hover:to-blue-300 transition-all duration-300 drop-shadow-lg">FA</span>
                <div className="absolute -inset-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
              </div>
            </div>
          </Link>
        </div>

        {/* Login Form Container */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative bg-gray-900/50 backdrop-blur-sm rounded-3xl p-8 border border-gray-700/50 shadow-2xl"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-3xl blur-3xl"></div>
          
          <div className="relative z-10">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">Se connecter</h1>
              <p className="text-gray-400">Accédez à votre espace d'apprentissage</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Input */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                  placeholder="votre@email.com"
                  required
                />
              </div>

              {/* Password Input */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                  Mot de passe
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 pr-12"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-purple-400 transition-colors duration-300"
                  >
                    {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleInputChange}
                    className="mr-2 rounded border-gray-600 text-purple-500 focus:ring-purple-500 bg-gray-800"
                  />
                  <span className="text-sm text-gray-300">Se souvenir de moi</span>
                </label>
                <Link to="/forgot-password" className="text-sm text-purple-400 hover:text-purple-300 transition-colors duration-300">
                  Mot de passe oublié?
                </Link>
              </div>

              {/* Login Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full relative overflow-hidden bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 hover:from-purple-600 hover:via-pink-600 hover:to-blue-600 text-white px-8 py-4 rounded-full font-semibold shadow-lg transition-all duration-300 group border border-white/20 hover:border-white/30"
              >
                <span className="relative z-10">Se connecter</span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              </motion.button>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-gray-900/50 text-gray-400">Ou continuer avec</span>
                </div>
              </div>

              {/* Social Login Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  className="flex items-center justify-center px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white hover:bg-gray-700/50 transition-all duration-300 group"
                >
                  <FaGoogle className="mr-2 text-red-400 group-hover:text-red-300" />
                  Google
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  className="flex items-center justify-center px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white hover:bg-gray-700/50 transition-all duration-300 group"
                >
                  <FaFacebook className="mr-2 text-blue-400 group-hover:text-blue-300" />
                  Facebook
                </motion.button>
              </div>
            </form>

            {/* Register Link */}
            <div className="text-center mt-8">
              <p className="text-gray-400">
                Pas encore de compte?{' '}
                <Link to="/register" className="text-purple-400 hover:text-purple-300 font-medium transition-colors duration-300">
                  S'inscrire
                </Link>
              </p>
            </div>
          </div>
        </motion.div>

        {/* Back to Home Link */}
        <div className="text-center mt-6">
          <Link 
            to="/" 
            className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center justify-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Retour à l'accueil</span>
          </Link>
        </div>
      </motion.div>
    </div>
  )
}

export default Login 