import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaPlus, FaCheck } from "react-icons/fa";
import { Album } from "lucide-react";
import axios from "axios";

const PlaylistModal = ({ isOpen, onClose, questionId }) => {
  const [playlists, setPlaylists] = useState([]);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchPlaylists();
    }
  }, [isOpen]);

  const fetchPlaylists = async () => {
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_API_URL}/playlists`,
        { withCredentials: true }
      );
      setPlaylists(data.playlists || []);
    } catch (error) {
      console.error("Error fetching playlists:", error);
    }
  };

  const createPlaylist = async () => {
    if (!newPlaylistName.trim()) return;

    setLoading(true);
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/playlists`,
        {
          name: newPlaylistName,
          questionIds: [questionId],
        },
        { withCredentials: true }
      );
      setPlaylists([...playlists, data.playlist]);
      setNewPlaylistName("");
      setShowCreateForm(false);
    } catch (error) {
      console.error("Error creating playlist:", error);
      alert("Échec de création de la playlist");
    } finally {
      setLoading(false);
    }
  };

  const toggleQuestion = async (playlistId, currentlyContains) => {
    try {
      if (currentlyContains) {
        await axios.delete(
          `${import.meta.env.VITE_API_URL}/playlists/${playlistId}/questions/${questionId}`,
          { withCredentials: true }
        );
      } else {
        await axios.post(
          `${import.meta.env.VITE_API_URL}/playlists/${playlistId}/questions`,
          { questionId },
          { withCredentials: true }
        );
      }
      fetchPlaylists();
    } catch (error) {
      console.error("Error updating playlist:", error);
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
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Album className="text-purple-600" size={20} />
                </div>
                <h3 className="text-xl font-bold text-gray-800">
                  Ajouter à une playlist
                </h3>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FaTimes size={20} />
              </button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {playlists.map((playlist) => {
                const contains = playlist.questionIds?.includes(questionId);
                return (
                  <button
                    key={playlist._id}
                    onClick={() => toggleQuestion(playlist._id, contains)}
                    className={`w-full flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                      contains
                        ? "bg-purple-50 border-purple-500"
                        : "bg-gray-50 border-gray-200 hover:border-purple-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Album size={20} className="text-purple-600" />
                      <div className="text-left">
                        <p className="font-medium text-gray-800">
                          {playlist.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {playlist.questionIds?.length || 0} questions
                        </p>
                      </div>
                    </div>
                    {contains && (
                      <FaCheck className="text-purple-600" size={20} />
                    )}
                  </button>
                );
              })}
            </div>

            {showCreateForm ? (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <input
                  type="text"
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  placeholder="Nom de la playlist"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent mb-2"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={createPlaylist}
                    disabled={loading || !newPlaylistName.trim()}
                    className="flex-1 py-2 bg-purple-500 text-white rounded-lg font-semibold hover:bg-purple-600 disabled:bg-gray-300 transition-colors"
                  >
                    {loading ? "Création..." : "Créer"}
                  </button>
                  <button
                    onClick={() => {
                      setShowCreateForm(false);
                      setNewPlaylistName("");
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowCreateForm(true)}
                className="w-full mt-4 py-3 bg-purple-500 text-white rounded-lg font-semibold hover:bg-purple-600 transition-colors flex items-center justify-center gap-2"
              >
                <FaPlus />
                Créer une nouvelle playlist
              </button>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PlaylistModal;
