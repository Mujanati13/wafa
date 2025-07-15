import React from 'react'

const Footer = () => {
  return (
     <footer className="bg-gradient-to-r from-gray-100 to-blue-50 py-12 px-6 border-t border-gray-200">
     <div className="max-w-7xl mx-auto">
       <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
         <div>
           <div className="text-3xl font-bold mb-4">
             <span className="text-blue-600">WA</span>
             <span className="text-teal-600">FA</span>
           </div>
           <p className="text-gray-600 mb-4">Excellence en formation médicale</p>
           <div className="flex space-x-4">
             <a href="#" className="text-gray-500 hover:text-blue-600 transition-colors">📘</a>
             <a href="#" className="text-gray-500 hover:text-blue-600 transition-colors">🐦</a>
             <a href="#" className="text-gray-500 hover:text-blue-600 transition-colors">📧</a>
           </div>
         </div>
         
         <div>
           <h4 className="text-gray-900 font-bold mb-4">Plateforme</h4>
           <ul className="space-y-2 text-gray-600">
             <li><a href="#" className="hover:text-blue-600 transition-colors">QCM Médicaux</a></li>
             <li><a href="#" className="hover:text-blue-600 transition-colors">Tarifs</a></li>
             <li><a href="#" className="hover:text-blue-600 transition-colors">Spécialités</a></li>
           </ul>
         </div>
         
         <div>
           <h4 className="text-gray-900 font-bold mb-4">Support</h4>
           <ul className="space-y-2 text-gray-600">
             <li><a href="#faq" className="hover:text-blue-600 transition-colors">FAQ</a></li>
             <li><a href="#contact" className="hover:text-blue-600 transition-colors">Contact</a></li>
             <li><a href="#" className="hover:text-blue-600 transition-colors">Centre d'aide</a></li>
           </ul>
         </div>
         
         <div>
           <h4 className="text-gray-900 font-bold mb-4">Légal</h4>
           <ul className="space-y-2 text-gray-600">
             <li><a href="#" className="hover:text-blue-600 transition-colors">Confidentialité</a></li>
             <li><a href="#" className="hover:text-blue-600 transition-colors">Conditions</a></li>
             <li><a href="#" className="hover:text-blue-600 transition-colors">Cookies</a></li>
           </ul>
         </div>
       </div>
       
       <div className="border-t border-gray-300 pt-8 text-center text-gray-600">
         <p>&copy; {new Date().getFullYear()} WAFA. Tous droits réservés.</p>
       </div>
     </div>
   </footer>
  )
}

export default Footer