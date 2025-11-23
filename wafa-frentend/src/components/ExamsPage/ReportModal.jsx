import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaFlag } from "react-icons/fa";
import axios from "axios";

const ReportModal = ({ isOpen, onClose, questionId }) => {
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const reportReasons = [
    "Question incorrecte",
    "Réponse incorrecte",
    "Erreur de frappe",
    "Image manquante",
    "Contenu inapproprié",
    "Autre",
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/report-questions`,
        {
          questionId,
          reason,
          description,
        },
        { withCredentials: true }
      );
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setReason("");
        setDescription("");
      }, 2000);
    } catch (error) {
      console.error("Error reporting question:", error);
      alert("Échec du signalement. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {success ? (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">✅</div>
                <h3 className="text-2xl font-bold text-gray-800">
                  Signalement envoyé!
                </h3>
                <p className="text-gray-600 mt-2">
                  Merci de nous aider à améliorer la qualité
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                      <FaFlag className="text-red-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">
                      Signaler un problème
                    </h3>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <FaTimes size={20} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Raison du signalement
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {reportReasons.map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setReason(r)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                            reason === r
                              ? "bg-red-500 text-white shadow-md"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description (optionnel)
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                      rows={4}
                      placeholder="Décrivez le problème..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={!reason || loading}
                    className="w-full py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? "Envoi..." : "Envoyer le signalement"}
                  </button>
                </form>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ReportModal;
