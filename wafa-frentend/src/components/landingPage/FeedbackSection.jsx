import React from 'react'
import { motion } from 'framer-motion'
import { FiMessageCircle, FiSend, FiStar, FiHeart } from 'react-icons/fi'
import { BiLike } from 'react-icons/bi'

const FeedbackSection = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  }

  const floatingIcons = [
    { Icon: FiStar, delay: 0, x: -20, y: -30 },
    { Icon: FiHeart, delay: 0.5, x: 30, y: -20 },
    { Icon: BiLike, delay: 1, x: -30, y: 20 },
    { Icon: FiMessageCircle, delay: 1.5, x: 25, y: 25 }
  ]

  return (
    <section className="py-20 px-6 bg-gradient-to-br from-purple-900/10 via-indigo-900/10 to-pink-900/10 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ 
            rotate: 360,
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 20, 
            repeat: Infinity, 
            ease: "linear" 
          }}
          className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-full blur-xl"
        />
        <motion.div
          animate={{ 
            rotate: -360,
            scale: [1, 1.2, 1]
          }}
          transition={{ 
            duration: 25, 
            repeat: Infinity, 
            ease: "linear" 
          }}
          className="absolute -bottom-10 -left-10 w-32 h-32 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 rounded-full blur-xl"
        />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        className="max-w-4xl mx-auto text-center relative z-10"
      >
        {/* Floating feedback icons */}
        <div className="relative">
          {floatingIcons.map(({ Icon, delay, x, y }, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ 
                opacity: [0, 1, 0.8, 1],
                scale: [0, 1.2, 1],
                x: [0, x, 0],
                y: [0, y, 0]
              }}
              transition={{
                duration: 3,
                delay: delay,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut"
              }}
              className="absolute text-purple-400/30 text-2xl"
              style={{
                left: `${20 + index * 20}%`,
                top: `${10 + (index % 2) * 80}%`
              }}
            >
              <Icon />
            </motion.div>
          ))}
        </div>

        {/* Main content */}
        <motion.div variants={itemVariants} className="relative">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            whileInView={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full mb-6 backdrop-blur-sm border border-purple-400/20"
          >
            <FiMessageCircle className="text-4xl text-purple-400" />
          </motion.div>
        </motion.div>

        <motion.h2 
          variants={itemVariants}
          className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent"
        >
          Nous voulons vos retours
        </motion.h2>

        <motion.p 
          variants={itemVariants}
          className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed"
        >
          Aidez-nous à améliorer WAFA en partageant vos pensées et suggestions. 
          Votre contribution alimente notre innovation.
        </motion.p>

        {/* Action buttons */}
        <motion.div 
          variants={itemVariants}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <motion.button
            whileHover={{ 
              scale: 1.05,
              boxShadow: "0 20px 40px rgba(147, 51, 234, 0.4)"
            }}
            whileTap={{ scale: 0.98 }}
            className="group bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-4 rounded-full font-bold text-lg shadow-lg transition-all duration-300 flex items-center gap-3 min-w-[200px] justify-center relative overflow-hidden"
          >
            <motion.div
              whileHover={{ x: 5 }}
              transition={{ duration: 0.2 }}
            >
              <FiSend className="text-xl" />
            </motion.div>
            <span>Donner votre avis</span>
            
            {/* Button glow effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              initial={false}
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
            />
          </motion.button>

          <motion.button
            whileHover={{ 
              scale: 1.05,
              borderColor: "rgb(147, 51, 234)"
            }}
            whileTap={{ scale: 0.98 }}
            className="border-2 border-gray-600 hover:border-purple-500 text-gray-300 hover:text-white px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 flex items-center gap-3 min-w-[200px] justify-center backdrop-blur-sm"
          >
            <FiStar className="text-xl" />
            <span>Évaluer l'app</span>
          </motion.button>
        </motion.div>

        {/* Testimonial preview cards */}
        <motion.div 
          variants={itemVariants}
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto"
        >
          {[
            { text: "Interface intuitive", author: "Sarah M." },
            { text: "Très utile au quotidien", author: "Ahmed K." },
            { text: "Design moderne", author: "Marie L." }
          ].map((testimonial, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -5, scale: 1.02 }}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 text-center"
            >
              <div className="flex justify-center mb-2">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 + i * 0.1 }}
                  >
                    <FiStar className="text-yellow-400 fill-current text-sm" />
                  </motion.div>
                ))}
              </div>
              <p className="text-gray-300 text-sm mb-2">"{testimonial.text}"</p>
              <p className="text-gray-400 text-xs">- {testimonial.author}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  )
}

export default FeedbackSection