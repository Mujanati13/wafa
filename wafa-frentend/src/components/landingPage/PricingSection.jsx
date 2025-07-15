import React from 'react'
import { motion } from 'framer-motion'
import { FiCheck, FiStar, FiZap, FiTrendingUp } from 'react-icons/fi'
import { HiSparkles } from 'react-icons/hi'

const PricingSection = () => {
  const plans = [
    {
      name: "Gratuit",
      price: "0DH",
      features: [
        "Accès limité aux QCM",
        "Questions par catégorie",
        "Interface mobile",
        "Suivi des progrès de base",
        "Forum communautaire",
      ],
      highlight: false,
      icon: FiZap,
      color: "from-blue-400 to-blue-500",
      bgGradient: "from-blue-50 to-blue-100"
    },
    {
      name: "Premium (Semestre)",
      price: "99DH",
      originalPrice: "199DH",
      features: [
        "Accès illimité aux QCM",
        "Toutes les spécialités médicales",
        "Corrections détaillées",
        "Suivi de performance avancé",
        "Assistance IA ",
      ],
      highlight: true,
      icon: FiStar,
      color: "from-blue-500 to-teal-500",
      bgGradient: "from-blue-50 to-teal-50"
    },
    {
      name: "Premium (Année)",
      price: "150DH",
      originalPrice: "300DH",
      features: [
        "Toutes les fonctionnalités Premium",
        "Accès aux examens blancs",
        
        "Statistiques détaillées",
        "Accès anticipé aux nouveautés",
      ],
      highlight: false,
      icon: FiTrendingUp,
      color: "from-teal-500 to-cyan-500",
      bgGradient: "from-teal-50 to-cyan-50"
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const cardVariants = {
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

  const featureVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: {
        duration: 0.4
      }
    }
  };

  return (
    <section id="plans" className="py-20 px-6 bg-white relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-teal-50/30"></div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-100/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-100/20 rounded-full blur-3xl"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: -50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <motion.div
            className="inline-block mb-4"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            <HiSparkles className="text-4xl text-blue-600 mx-auto" />
          </motion.div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
            Choisissez le <span className="text-blue-600">plan parfait</span><br />
            pour votre réussite
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Débloquez votre potentiel avec nos options de tarification flexibles conçues pour chaque étudiant en médecine
          </p>
        </motion.div>
        
        <motion.div 
          className="flex flex-col lg:flex-row gap-8 justify-center items-stretch"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {plans.map((plan, i) => {
            const IconComponent = plan.icon;
            return (
              <motion.div
                key={i}
                variants={cardVariants}
                whileHover={{ 
                  scale: 1.05,
                  transition: { duration: 0.2 }
                }}
                className={`flex-1 max-w-sm mx-auto lg:mx-0 relative group`}
              >
                <div className={`
                  bg-white backdrop-blur-xl rounded-3xl p-8 border transition-all duration-500 shadow-lg hover:shadow-xl
                  ${plan.highlight 
                    ? "border-blue-300 shadow-blue-100" 
                    : "border-gray-200 hover:border-blue-200"
                  }
                `}>
                  {/* Animated background overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${plan.bgGradient} rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                  
                  <div className="relative z-10">
                    {plan.highlight && (
                      <motion.div 
                        className="text-center mb-4"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                      >
                        <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-bold shadow-lg">
                          <HiSparkles className="text-sm" />
                          LE PLUS POPULAIRE
                        </span>
                      </motion.div>
                    )}
                    
                    <div className="text-center mb-6">
                      <motion.div
                        className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${plan.color} mb-4 shadow-lg`}
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.6 }}
                      >
                        <IconComponent className="text-2xl text-white" />
                      </motion.div>
                      <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                    </div>
                    
                    <div className="text-center mb-8">
                      <motion.div 
                        className={`text-4xl font-black text-gray-900 mb-2`}
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.2 }}
                      >
                        {plan.price}
                      </motion.div>
                      {plan.originalPrice && (
                        <motion.div 
                          className="text-lg text-gray-500 line-through"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.3 }}
                        >
                          {plan.originalPrice}
                        </motion.div>
                      )}
                    </div>
                    
                    <motion.ul 
                      className="mb-8 space-y-4"
                      initial="hidden"
                      whileInView="visible"
                      variants={{
                        visible: {
                          transition: {
                            staggerChildren: 0.1
                          }
                        }
                      }}
                      viewport={{ once: true }}
                    >
                      {plan.features.map((feature, idx) => (
                        <motion.li 
                          key={idx} 
                          className="flex items-start gap-3 text-gray-700"
                          variants={featureVariants}
                        >
                          <motion.div
                            className={`flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br ${plan.color} flex items-center justify-center mt-0.5`}
                            whileHover={{ scale: 1.2 }}
                            transition={{ duration: 0.2 }}
                          >
                            <FiCheck className="text-white text-sm" />
                          </motion.div>
                          <span className="group-hover:text-gray-800 transition-colors duration-300">{feature}</span>
                        </motion.li>
                      ))}
                    </motion.ul>
                    
                    <motion.button 
                      className={`w-full py-4 rounded-2xl font-bold text-lg transition-all duration-300 relative overflow-hidden group ${
                        plan.highlight 
                          ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-blue-500/25" 
                          : "bg-gray-100 hover:bg-gray-200 text-gray-900 border-2 border-gray-200 hover:border-blue-300"
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <span className="relative z-10">Commencer</span>
                      {plan.highlight && (
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-blue-700 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                          layoutId="buttonBackground"
                        />
                      )}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
        
        <motion.div 
          className="text-center mt-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={{ once: true }}
        >
          <p className="text-gray-600 mb-4">
            Tous les plans incluent un accès mobile et une garantie de remboursement de 30 jours
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <span className="text-sm text-gray-500">Paiement sécurisé avec</span>
            <div className="flex gap-4">
              <div className="px-3 py-1 bg-blue-50 rounded-lg text-blue-700 font-medium text-sm">Carte bancaire</div>
              <div className="px-3 py-1 bg-blue-50 rounded-lg text-blue-700 font-medium text-sm">PayPal</div>
              <div className="px-3 py-1 bg-blue-50 rounded-lg text-blue-700 font-medium text-sm">Virement</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default PricingSection