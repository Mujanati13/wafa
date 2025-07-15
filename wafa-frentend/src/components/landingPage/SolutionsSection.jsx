import React from 'react'
import { motion } from 'framer-motion'
import { FaBookOpen, FaRobot, FaList, FaChartLine, FaArrowRight } from 'react-icons/fa'
import { BiSolidBadgeCheck } from 'react-icons/bi'

const SolutionsSection = () => {
  const features = [
    {
      icon: FaBookOpen,
      title: "QCM Médicaux",
      desc: "Pratiquez avec de vrais QCM médicaux et suivez vos progrès avec des banques de questions complètes.",
      color: "from-blue-500 to-blue-600",
      bgGradient: "from-blue-50 to-blue-100",
    },
    {
      icon: FaRobot,
      title: "Feedback IA",
      desc: "Obtenez des commentaires instantanés et personnalisés grâce à notre IA avancée pour améliorer votre compréhension.",
      color: "from-teal-500 to-teal-600",
      bgGradient: "from-teal-50 to-teal-100",
    },
    {
      icon: FaList,
      title: "Matières Organisées",
      desc: "Matières médicales organisées par difficulté et sujet, parfaites pour votre cursus médical.",
      color: "from-indigo-500 to-indigo-600",
      bgGradient: "from-indigo-50 to-indigo-100",
    },
    {
      icon: FaChartLine,
      title: "Statistiques Détaillées",
      desc: "Visualisez vos améliorations avec des analyses détaillées et un suivi de performance.",
      color: "from-cyan-500 to-cyan-600",
      bgGradient: "from-cyan-50 to-cyan-100",
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
    <section id="features" className="py-24 px-6 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-50/30 to-transparent"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-100/20 rounded-full blur-3xl"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div 
          className="text-center mb-20"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={titleVariants}
        >
          <motion.div 
            className="inline-flex items-center gap-2 bg-blue-50 backdrop-blur-sm rounded-full px-6 py-3 mb-6 border border-blue-200 shadow-sm"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <BiSolidBadgeCheck className="text-blue-600" />
            <span className="text-sm font-semibold text-blue-800">Nos Solutions</span>
          </motion.div>
          
          <h2 className="text-5xl md:text-6xl font-bold mb-6 text-gray-900">
            Formation Médicale <span className="text-blue-600">Complète</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Perfectionnez votre formation médicale avec des outils de pointe conçus par des professionnels de santé pour les futurs médecins
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
                <div className={`relative bg-white backdrop-blur-xl rounded-3xl p-8 border border-gray-200 hover:border-blue-300 transition-all duration-500 h-full shadow-lg hover:shadow-xl`}>
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
                    
                    <h3 className="text-2xl font-bold mb-4 text-gray-900 group-hover:text-gray-800 transition-colors duration-300">
                      {feature.title}
                    </h3>
                    
                    <p className="text-gray-600 leading-relaxed mb-6 group-hover:text-gray-700 transition-colors duration-300">
                      {feature.desc}
                    </p>
                    
                    <motion.div 
                      className="inline-flex items-center gap-2 text-blue-600 font-medium group-hover:text-blue-700 transition-colors duration-300"
                      whileHover={{ x: 5 }}
                    >
                      <span>En savoir plus</span>
                      <FaArrowRight className="text-sm" />
                    </motion.div>
                  </div>
                  
                  {/* Shine effect */}
                  <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
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
            className="inline-flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transform transition-all duration-300"
            whileHover={{ 
              scale: 1.05,
              boxShadow: "0 20px 40px rgba(59, 130, 246, 0.3)"
            }}
            whileTap={{ scale: 0.95 }}
          >
            <span>Découvrir toutes les fonctionnalités</span>
            <FaArrowRight className="text-lg" />
          </motion.button>
        </motion.div>
      </div>
    </section>
  )
}

export default SolutionsSection