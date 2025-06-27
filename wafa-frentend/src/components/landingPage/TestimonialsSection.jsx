import React from 'react'
import { motion } from 'framer-motion'
import { FaUserGraduate, FaHeart, FaStar, FaQuoteLeft } from 'react-icons/fa'
import { BsShieldCheck } from 'react-icons/bs'
import { AiFillThunderbolt } from 'react-icons/ai'

const TestimonialsSection = () => {
  
const testimonials = [
  {
    name: "Sara B.",
    text: "WAFA m'a aidée à réussir mes examens avec moins de stress! L'IA est incroyable.",
    icon: FaUserGraduate,
    rating: 5,
    role: "Étudiante en médecine",
    color: "from-purple-500 to-pink-500"
  },
  {
    name: "Yassine M.",
    text: "Les playlists et les stats m'ont permis d'organiser mes révisions comme jamais.",
    icon: AiFillThunderbolt,
    rating: 5,
    role: "Étudiant en pharmacie",
    color: "from-blue-500 to-cyan-500"
  },
  {
    name: "Imane K.",
    text: "Le rapport qualité/prix est imbattable. Je recommande à tous les étudiants en médecine!",
    icon: BsShieldCheck,
    rating: 5,
    role: "Étudiante en dentaire",
    color: "from-emerald-500 to-teal-500"
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1
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
   <section className="py-24 px-6 bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 relative overflow-hidden">
     {/* Background decoration */}
     <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5"></div>
     <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
     <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl"></div>
     
     <div className="max-w-7xl mx-auto relative z-10">
       <motion.div
         variants={titleVariants}
         initial="hidden"
         whileInView="visible"
         viewport={{ once: true, amount: 0.3 }}
         className="text-center mb-20"
       >
       
         <h2 className="text-5xl md:text-7xl font-extrabold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent mb-6">
         What our students say
         </h2>
         <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
         Learn how WAFA is transforming the learning experience for thousands of students
         </p>
       </motion.div>

       <motion.div 
         variants={containerVariants}
         initial="hidden"
         whileInView="visible"
         viewport={{ once: true, amount: 0.2 }}
         className="grid grid-cols-1 md:grid-cols-3 gap-8"
       >
         {testimonials.map((testimonial, index) => {
           const IconComponent = testimonial.icon;
           return (
             <motion.div 
               key={index}
               variants={cardVariants}
               whileHover={{ 
                 scale: 1.05,
                 y: -10,
                 transition: { duration: 0.3 }
               }}
               className="group relative"
             >
               {/* Card glow effect */}
               <div className={`absolute -inset-1 bg-gradient-to-r ${testimonial.color} rounded-3xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200`}></div>
               
               <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-3xl p-8 border border-slate-700/50 group-hover:border-slate-600/50 transition-all duration-500 h-full">
                 {/* Quote icon */}
                 <div className="absolute top-6 right-6">
                   <FaQuoteLeft className="text-3xl text-purple-400/30" />
                 </div>

                 {/* Icon and user info */}
                 <div className="flex items-center mb-8">
                   <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${testimonial.color} p-0.5 mr-5`}>
                     <div className="w-full h-full bg-slate-800 rounded-2xl flex items-center justify-center">
                       <IconComponent className="text-2xl text-white" />
                     </div>
                   </div>
                   <div>
                     <div className="font-bold text-xl text-white mb-1">{testimonial.name}</div>
                     <div className="text-sm text-purple-400 font-medium">{testimonial.role}</div>
                   </div>
                 </div>

                 {/* Stars rating */}
                 <div className="flex mb-6">
                   {[...Array(testimonial.rating)].map((_, i) => (
                     <motion.div
                       key={i}
                       initial={{ opacity: 0, scale: 0 }}
                       whileInView={{ opacity: 1, scale: 1 }}
                       transition={{ delay: 0.1 * i, duration: 0.3 }}
                       viewport={{ once: true }}
                     >
                       <FaStar className="text-yellow-400 text-lg mr-1" />
                     </motion.div>
                   ))}
                 </div>

                 {/* Testimonial text */}
                 <p className="text-gray-300 leading-relaxed text-lg font-medium">
                   "{testimonial.text}"
                 </p>

                 {/* Bottom accent */}
                 <div className={`mt-8 h-1 bg-gradient-to-r ${testimonial.color} rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500`}></div>
               </div>
             </motion.div>
           );
         })}
       </motion.div>

       {/* Call to action */}
       <motion.div 
         initial={{ opacity: 0, y: 30 }}
         whileInView={{ opacity: 1, y: 0 }}
         transition={{ duration: 0.8, delay: 0.6 }}
         viewport={{ once: true }}
         className="text-center mt-16"
       >
         <motion.button
           whileHover={{ scale: 1.05 }}
           whileTap={{ scale: 0.95 }}
           className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 px-8 rounded-2xl shadow-2xl transition-all duration-300 transform hover:shadow-purple-500/25"
         >
           Join us today
         </motion.button>
       </motion.div>
     </div>
   </section>
  )
}

export default TestimonialsSection