import React from 'react'
import { motion } from 'framer-motion'
import { FiCheck, FiStar, FiZap, FiTrendingUp } from 'react-icons/fi'
import { HiSparkles } from 'react-icons/hi'

const PricingSection = () => {
  const plans = [
    {
      name: "Freemium",
      price: "Free",
      features: [
        "Un cours par module",
        "Questions classées",
        "Interface mobile",
        "Organisateur de tâches",
        "Forum de discussion",
      ],
      highlight: false,
      icon: FiZap,
      color: "from-blue-400 to-cyan-400",
      bgGradient: "from-blue-500/10 to-cyan-500/10"
    },
    {
      name: "Premium (Semestre)",
      price: "100 MAD",
      originalPrice: "150 MAD",
      features: [
        "Toutes les fonctionnalités de Freemium",
        "Toutes les matières et fonctionnalités",
        "Support",
        "Assistance IA",
        "Mises à jour anticipées",
      ],
      highlight: true,
      icon: FiStar,
      color: "from-purple-400 to-pink-400",
      bgGradient: "from-purple-500/20 to-pink-500/20"
    },
    {
      name: "Premium (Année)",
      price: "150 MAD",
      originalPrice: "200 MAD",
      features: [
        "All Premium features",
        "Toutes les matières et fonctionnalités",
        "Support",
        "Assistance IA",
        "Mises à jour anticipées",
      ],
      highlight: false,
      icon: FiTrendingUp,
      color: "from-orange-400 to-red-400",
      bgGradient: "from-orange-500/10 to-red-500/10"
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
    <section id="plans" className="py-20 px-6 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 to-pink-900/10"></div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl"></div>
      
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
            <HiSparkles className="text-4xl text-purple-400 mx-auto" />
          </motion.div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Choose the <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">perfect plan</span><br />
            that suits you
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Unlock your potential with our flexible pricing options designed for every learner
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
                  bg-gradient-to-br ${plan.bgGradient} backdrop-blur-xl rounded-3xl p-8 border transition-all duration-500
                  ${plan.highlight 
                    ? "border-purple-500/50 shadow-2xl shadow-purple-500/20" 
                    : "border-gray-700/30 hover:border-purple-500/30"
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
                        <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full text-sm font-bold shadow-lg">
                          <HiSparkles className="text-sm" />
                          MOST POPULAR
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
                      <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
                    </div>
                    
                    <div className="text-center mb-8">
                      <motion.div 
                        className={`text-4xl font-black bg-gradient-to-r ${plan.color} bg-clip-text text-transparent mb-2`}
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
                          className="flex items-start gap-3 text-gray-300"
                          variants={featureVariants}
                        >
                          <motion.div
                            className={`flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br ${plan.color} flex items-center justify-center mt-0.5`}
                            whileHover={{ scale: 1.2 }}
                            transition={{ duration: 0.2 }}
                          >
                            <FiCheck className="text-white text-sm" />
                          </motion.div>
                          <span className="group-hover:text-white transition-colors duration-300">{feature}</span>
                        </motion.li>
                      ))}
                    </motion.ul>
                    
                    <motion.button 
                      className={`w-full py-4 rounded-2xl font-bold text-lg transition-all duration-300 relative overflow-hidden group ${
                        plan.highlight 
                          ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg" 
                          : "bg-gray-800/50 hover:bg-gray-700/50 text-purple-400 border border-purple-500/50"
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
                          className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
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
      </div>
    </section>
  )
}

export default PricingSection