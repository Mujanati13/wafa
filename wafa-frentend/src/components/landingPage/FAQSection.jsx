import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const FAQSection = () => {
  
const faqs = [
  {
    q: "Comment accéder aux QCM médicaux?",
    a: "Inscrivez-vous gratuitement et commencez à pratiquer immédiatement avec nos QCM médicaux organisés par spécialité.",
  },
  {
    q: "L'assistance IA est-elle disponible pour tous les plans?",
    a: "L'assistance IA est disponible avec les plans Premium, fournissant des explications détaillées et du feedback personnalisé.",
  },
  {
    q: "Puis-je annuler mon abonnement premium?",
    a: "Oui, vous pouvez annuler à tout moment depuis votre espace personnel. Nous offrons également une garantie de remboursement de 30 jours.",
  },
  {
    q: "Les QCM sont-ils adaptés à tous les niveaux?",
    a: "Oui, nos QCM sont organisés par niveau de difficulté et adaptés depuis les études de base jusqu'à la préparation aux concours.",
  },
  {
    q: "Comment suivre mes progrès?",
    a: "Votre tableau de bord personnalisé vous permet de suivre vos performances, voir vos statistiques détaillées et identifier les domaines à améliorer.",
  },
];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3
      }
    }
  };

  const titleVariants = {
    hidden: { 
      opacity: 0, 
      y: 30 
    },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  const orbVariants = {
    animate: {
      scale: [1, 1.1, 1],
      opacity: [0.3, 0.6, 0.3],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <section id="faq" className="py-20 px-6 bg-gray-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-teal-50/50"></div>
      
      <motion.div 
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-100/20 rounded-full blur-3xl"
        variants={orbVariants}
        animate="animate"
      />
      <motion.div 
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-100/20 rounded-full blur-3xl"
        variants={orbVariants}
        animate="animate"
        transition={{ delay: 1 }}
      />
      
      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div 
          className="text-center mb-16"
          variants={titleVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 leading-tight">
            Réponses aux questions{' '}
            <motion.span 
              className="text-blue-600"
              animate={{
                opacity: [1, 0.8, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              fréquentes
            </motion.span>
          </h2>
          <motion.div 
            className="w-24 h-1 bg-blue-600 mx-auto rounded-full"
            initial={{ width: 0 }}
            whileInView={{ width: 96 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            viewport={{ once: true }}
          />
        </motion.div>
        
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <FAQAccordion faqs={faqs} />
        </motion.div>
      </div>
    </section>
  )
}

export default FAQSection

function FAQAccordion({ faqs }) {
  const [open, setOpen] = useState(null);

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 20, 
      scale: 0.95 
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

  const contentVariants = {
    collapsed: { 
      height: 0, 
      opacity: 0 
    },
    expanded: { 
      height: "auto", 
      opacity: 1,
      transition: {
        height: {
          duration: 0.4,
          ease: [0.04, 0.62, 0.23, 0.98]
        },
        opacity: {
          duration: 0.3,
          delay: 0.1
        }
      }
    }
  };

  const buttonIconVariants = {
    closed: { 
      rotate: 0,
      scale: 1
    },
    open: { 
      rotate: 180,
      scale: 1.1,
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    }
  };

  return (
    <div className="space-y-4">
      {faqs.map((faq, index) => (
        <motion.div
          key={index}
          variants={itemVariants}
          className="group"
        >
          <motion.div
            className={`
              bg-white backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 overflow-hidden
              transition-all duration-300 hover:shadow-xl hover:border-blue-300
              ${open === index ? 'border-blue-400 shadow-blue-100' : ''}
            `}
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.2 }}
          >
            <motion.button
              onClick={() => setOpen(open === index ? null : index)}
              className="w-full px-8 py-6 text-left flex items-center justify-between group focus:outline-none"
              whileHover={{ backgroundColor: "rgba(59, 130, 246, 0.05)" }}
              transition={{ duration: 0.2 }}
            >
              <span className="text-lg font-semibold text-gray-900 group-hover:text-blue-700 transition-colors duration-300">
                {faq.q}
              </span>
              <motion.div
                variants={buttonIconVariants}
                animate={open === index ? "open" : "closed"}
                className="ml-4 flex-shrink-0"
              >
                <svg 
                  className="w-6 h-6 text-blue-600" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M19 9l-7 7-7-7" 
                  />
                </svg>
              </motion.div>
            </motion.button>
            
            <AnimatePresence>
              {open === index && (
                <motion.div
                  initial="collapsed"
                  animate="expanded"
                  exit="collapsed"
                  variants={contentVariants}
                  className="overflow-hidden"
                >
                  <div className="px-8 pb-6 pt-2">
                    <motion.p 
                      className="text-gray-700 leading-relaxed"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      {faq.a}
                    </motion.p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
}