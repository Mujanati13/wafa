import React from 'react'

const Footer = () => {
  return (
     <footer className="bg-gradient-to-r from-gray-900/50 to-black/50 backdrop-blur-sm py-12 px-6 border-t border-gray-800/50">
     <div className="max-w-7xl mx-auto">
       <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
         <div>
           <div className="text-3xl font-bold mb-4">
             <span className="text-white">WA</span>
             <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">FA</span>
           </div>
           <p className="text-gray-400 mb-4">Less work, Better results</p>
           <div className="flex space-x-4">
             <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">📘</a>
             <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">🐦</a>
             <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">📧</a>
           </div>
         </div>
         
         <div>
           <h4 className="text-white font-bold mb-4">Product</h4>
           <ul className="space-y-2 text-gray-400">
             <li><a href="#" className="hover:text-purple-400 transition-colors">Features</a></li>
             <li><a href="#" className="hover:text-purple-400 transition-colors">Pricing</a></li>
             <li><a href="#" className="hover:text-purple-400 transition-colors">API</a></li>
           </ul>
         </div>
         
         <div>
           <h4 className="text-white font-bold mb-4">Support</h4>
           <ul className="space-y-2 text-gray-400">
             <li><a href="#faq" className="hover:text-purple-400 transition-colors">FAQ</a></li>
             <li><a href="#contact" className="hover:text-purple-400 transition-colors">Contact</a></li>
             <li><a href="#" className="hover:text-purple-400 transition-colors">Help Center</a></li>
           </ul>
         </div>
         
         <div>
           <h4 className="text-white font-bold mb-4">Legal</h4>
           <ul className="space-y-2 text-gray-400">
             <li><a href="#" className="hover:text-purple-400 transition-colors">Privacy</a></li>
             <li><a href="#" className="hover:text-purple-400 transition-colors">Terms</a></li>
             <li><a href="#" className="hover:text-purple-400 transition-colors">Cookies</a></li>
           </ul>
         </div>
       </div>
       
       <div className="border-t border-gray-800/50 pt-8 text-center text-gray-500">
         <p>&copy; {new Date().getFullYear()} WAFA. Tous droits réservés.</p>
       </div>
     </div>
   </footer>
  )
}

export default Footer