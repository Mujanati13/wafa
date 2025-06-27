import React from 'react'
import { motion } from 'framer-motion'
import { FaBookOpen, FaRobot, FaList, FaChartLine, FaArrowRight } from 'react-icons/fa'
import { BiSolidBadgeCheck } from 'react-icons/bi'

const SolutionsSection = () => {
  const features = [
    {
      icon: FaBookOpen,
      title: "Medical Exams",
      desc: "Practice with real medical exams and track your progress with comprehensive question banks.",
      color: "from-blue-500 to-blue-600",
      bgGradient: "from-blue-500/10 to-blue-600/10",
    },
    {
      icon: FaRobot,
      title: "AI Feedback",
      desc: "Get instant, personalized feedback powered by advanced AI to improve your understanding.",
      color: "from-purple-500 to-purple-600",
      bgGradient: "from-purple-500/10 to-purple-600/10",
    },
    {
      icon: FaList,
      title: "Study Playlists",
      desc: "Curated study playlists for every medical subject, organized by difficulty and topic.",
      color: "from-green-500 to-green-600",
      bgGradient: "from-green-500/10 to-green-600/10",
    },
    {
      icon: FaChartLine,
      title: "Analytics & Stats",
      desc: "Visualize your improvement with detailed analytics and performance tracking.",
      color: "from-orange-500 to-orange-600",
      bgGradient: "from-orange-500/10 to-orange-600/10",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      }
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 50,
      scale: 0.9 
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const titleVariants = {
    hidden: { opacity: 0, y: -30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };
  
  return (
    <section id="features" className="py-24 px-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/5 to-transparent"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div 
          className="text-center mb-20"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={titleVariants}
        >
          <motion.div 
            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500/20 to-blue-500/20 backdrop-blur-sm rounded-full px-6 py-2 mb-6 border border-purple-500/30"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <BiSolidBadgeCheck className="text-purple-400" />
            <span className="text-sm font-medium text-purple-300">Our Solutions</span>
          </motion.div>
          
          <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">
            Comprehensive Medical Learning
          </h2>
          <p className="text-xl text-gray-400 max-w-4xl mx-auto leading-relaxed">
            Elevate your medical education with cutting-edge tools designed by healthcare professionals for future doctors
          </p>
        </motion.div>
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={containerVariants}
        >
          {features.map((feature, i) => {
            const IconComponent = feature.icon;
            return (
              <motion.div
                key={i}
                variants={itemVariants}
                whileHover={{ 
                  scale: 1.05,
                  rotateY: 5,
                  transition: { duration: 0.3 }
                }}
                whileTap={{ scale: 0.95 }}
                className="group relative"
              >
                <div className={`relative bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-xl rounded-3xl p-8 border border-gray-700/50 hover:border-purple-500/50 transition-all duration-500 h-full`}>
                  {/* Gradient background overlay on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.bgGradient} rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                  
                  {/* Content */}
                  <div className="relative z-10">
                    <motion.div 
                      className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.color} mb-6 shadow-lg`}
                      whileHover={{ 
                        rotate: 360,
                        scale: 1.1,
                        transition: { duration: 0.6 }
                      }}
                    >
                      <IconComponent className="text-2xl text-white" />
                    </motion.div>
                    
                    <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-purple-100 transition-colors duration-300">
                      {feature.title}
                    </h3>
                    
                    <p className="text-gray-400 leading-relaxed mb-6 group-hover:text-gray-300 transition-colors duration-300">
                      {feature.desc}
                    </p>
                    
                    <motion.div 
                      className="inline-flex items-center gap-2 text-purple-400 font-medium group-hover:text-purple-300 transition-colors duration-300"
                      whileHover={{ x: 5 }}
                    >
                      <span>Learn more</span>
                      <FaArrowRight className="text-sm" />
                    </motion.div>
                  </div>
                  
                  {/* Shine effect */}
                  <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
        
        {/* Bottom CTA section */}
        <motion.div 
          className="text-center mt-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <motion.button 
            className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl transform transition-all duration-300"
            whileHover={{ 
              scale: 1.05,
              boxShadow: "0 20px 40px rgba(147, 51, 234, 0.3)"
            }}
            whileTap={{ scale: 0.95 }}
          >
            <span>Explore All Features</span>
            <FaArrowRight className="text-lg" />
          </motion.button>
        </motion.div>
      </div>
    </section>
  )
}

export default SolutionsSection