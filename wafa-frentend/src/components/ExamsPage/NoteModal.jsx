import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaSave, FaTrash } from "react-icons/fa";
import { NotebookPen } from "lucide-react";
import axios from "axios";

const NoteModal = ({ isOpen, onClose, questionId }) => {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [existingNoteId, setExistingNoteId] = useState(null);
  const [lastSaved, setLastSaved] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchNote();
    }
  }, [isOpen, questionId]);

  const fetchNote = async () => {
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_API_URL}/notes`,
        {
          params: { questionId },
          withCredentials: true,
        }
      );
      // Backend returns {success, data: [...]} not {notes: [...]}
      if (data.data && data.data.length > 0) {
        const note = data.data[0];
        setContent(note.content);
        setExistingNoteId(note._id);
      }
    } catch (error) {
      console.error("Error fetching note:", error);
    }
  };

  const saveNote = async () => {
    if (!content.trim()) return;

    setLoading(true);
    try {
      if (existingNoteId) {
        await axios.put(
          `${import.meta.env.VITE_API_URL}/notes/${existingNoteId}`,
          { content },
          { withCredentials: true }
        );
      } else {
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_URL}/notes`,
          { 
            questionId, 
            content,
            title: `Note Q${questionId?.slice(-6) || 'Question'}` // Generate a title from question ID
          },
          { withCredentials: true }
        );
        setExistingNoteId(data.data?._id || data.note?._id);
      }
      setLastSaved(new Date());
    } catch (error) {
      console.error("Error saving note:", error);
      alert("Échec de l'enregistrement de la note");
    } finally {
      setLoading(false);
    }
  };

  const deleteNote = async () => {
    if (!existingNoteId) return;

    if (!confirm("Êtes-vous sûr de vouloir supprimer cette note ?")) return;

    setLoading(true);
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/notes/${existingNoteId}`,
        { withCredentials: true }
      );
      setContent("");
      setExistingNoteId(null);
      setLastSaved(null);
    } catch (error) {
      console.error("Error deleting note:", error);
      alert("Échec de la suppression de la note");
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
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <NotebookPen className="text-blue-600" size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">
                    Ma note personnelle
                  </h3>
                  {lastSaved && (
                    <p className="text-xs text-gray-500">
                      Dernière sauvegarde:{" "}
                      {lastSaved.toLocaleTimeString("fr-FR")}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FaTimes size={20} />
              </button>
            </div>

            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-64 px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Écrivez votre note ici..."
            />

            <div className="flex gap-3 mt-4">
              <button
                onClick={saveNote}
                disabled={loading || !content.trim()}
                className="flex-1 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                <FaSave />
                {loading ? "Enregistrement..." : "Enregistrer"}
              </button>

              {existingNoteId && (
                <button
                  onClick={deleteNote}
                  disabled={loading}
                  className="px-6 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 disabled:bg-gray-300 transition-colors flex items-center gap-2"
                >
                  <FaTrash />
                  Supprimer
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NoteModal;
