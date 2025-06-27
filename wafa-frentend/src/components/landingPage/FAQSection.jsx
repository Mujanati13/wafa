import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const FAQSection = () => {
  
const faqs = [
  {
    q: "Comment accéder aux examens?",
    a: "Inscrivez-vous gratuitement et commencez à pratiquer immédiatement!",
  },
  {
    q: "L'IA corrige-t-elle tous les examens?",
    a: "L'IA fournit un feedback instantané sur la plupart des examens disponibles.",
  },
  {
    q: "Puis-je annuler mon abonnement premium?",
    a: "Oui, vous pouvez annuler à tout moment depuis votre espace personnel.",
  },
  {
    q: "Les playlists sont-elles personnalisées?",
    a: "Oui, elles sont adaptées à votre niveau et à vos besoins.",
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
    <section id="faq" className="py-20 px-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-transparent to-pink-900/10"></div>
      
      <motion.div 
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-400/5 rounded-full blur-3xl"
        variants={orbVariants}
        animate="animate"
      />
      <motion.div 
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-400/5 rounded-full blur-3xl"
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
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white via-purple-100 to-pink-100 bg-clip-text text-transparent leading-tight">
            Answers to{' '}
            <motion.span 
              className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400"
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear"
              }}
              style={{
                backgroundSize: '200% 200%',
              }}
            >
              common
            </motion.span>
            <br />
            questions
          </h2>
          <motion.div 
            className="w-24 h-1 bg-gradient-to-r from-purple-400 to-pink-400 mx-auto rounded-full"
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

  const pingVariants = {
    ping: {
      scale: [1, 1.5],
      opacity: [0.2, 0],
      transition: {
        duration: 1,
        repeat: Infinity,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className="space-y-6">
      {faqs.map((faq, idx) => (
        <motion.div 
          key={idx} 
          variants={itemVariants}
          whileHover={{ 
            scale: 1.02,
            transition: { duration: 0.2 }
          }}
          whileTap={{ scale: 0.98 }}
        >
          <motion.div 
            className="group bg-gradient-to-r from-gray-800/40 via-gray-800/30 to-gray-800/40 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden"
            whileHover={{
              borderColor: "rgba(168, 85, 247, 0.3)",
              boxShadow: "0 25px 50px -12px rgba(168, 85, 247, 0.1)",
              transition: { duration: 0.3 }
            }}
          >
            <motion.button
              className="w-full flex justify-between items-center p-8 text-left focus:outline-none transition-all duration-300 rounded-2xl"
              onClick={() => setOpen(open === idx ? null : idx)}
              aria-expanded={open === idx}
              whileHover={{
                background: "linear-gradient(to right, rgba(147, 51, 234, 0.1), rgba(236, 72, 153, 0.1))"
              }}
            >
              <motion.span 
                className="font-semibold text-white text-lg leading-relaxed pr-4"
                whileHover={{
                  color: "#e9d5ff",
                  transition: { duration: 0.3 }
                }}
              >
                {faq.q}
              </motion.span>
              
              <div className="relative flex-shrink-0">
                <motion.div 
                  className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center"
                  variants={buttonIconVariants}
                  animate={open === idx ? "open" : "closed"}
                  whileHover={{ scale: 1.1 }}
                >
                  <span className="text-white text-xl font-bold">
                    {open === idx ? "−" : "+"}
                  </span>
                </motion.div>
                
                <AnimatePresence>
                  {open === idx && (
                    <motion.div 
                      className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400 to-pink-400"
                      variants={pingVariants}
                      animate="ping"
                      exit={{ opacity: 0 }}
                    />
                  )}
                </AnimatePresence>
              </div>
            </motion.button>
            
            <AnimatePresence initial={false}>
              {open === idx && (
                <motion.div
                  variants={contentVariants}
                  initial="collapsed"
                  animate="expanded"
                  exit="collapsed"
                  className="overflow-hidden"
                >
                  <motion.div 
                    className="px-8 pb-8"
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -10, opacity: 0 }}
                    transition={{ delay: 0.1, duration: 0.3 }}
                  >
                    <motion.div 
                      className="w-full h-px bg-gradient-to-r from-transparent via-purple-400/30 to-transparent mb-6"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: 0.5 }}
                    />
                    <div className="text-gray-300 leading-relaxed text-lg">
                      {faq.a}
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
}