import { api } from '../lib/utils.js';

export const playlistService = {
    // Get all user playlists
    getAll: async (moduleId = null) => {
        try {
            const params = moduleId ? { moduleId } : {};
            const response = await api.get('/playlists', { params });
            return response.data;
        } catch (error) {
            console.error('Error fetching playlists:', error);
            throw error;
        }
    },

    // Get single playlist
    getById: async (id) => {
        try {
            const response = await api.get(`/playlists/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching playlist:', error);
            throw error;
        }
    },

    // Create new playlist
    create: async (playlistData) => {
        try {
            const response = await api.post('/playlists', playlistData);
            return response.data;
        } catch (error) {
            console.error('Error creating playlist:', error);
            throw error;
        }
    },

    // Update playlist
    update: async (id, playlistData) => {
        try {
            const response = await api.put(`/playlists/${id}`, playlistData);
            return response.data;
        } catch (error) {
            console.error('Error updating playlist:', error);
            throw error;
        }
    },

    // Delete playlist
    delete: async (id) => {
        try {
            const response = await api.delete(`/playlists/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting playlist:', error);
            throw error;
        }
    },

    // Add question to playlist
    addQuestion: async (playlistId, questionId) => {
        try {
            const response = await api.post(`/playlists/${playlistId}/questions`, { questionId });
            return response.data;
        } catch (error) {
            console.error('Error adding question to playlist:', error);
            throw error;
        }
    },

    // Remove question from playlist
    removeQuestion: async (playlistId, questionId) => {
        try {
            const response = await api.delete(`/playlists/${playlistId}/questions/${questionId}`);
            return response.data;
        } catch (error) {
            console.error('Error removing question from playlist:', error);
            throw error;
        }
    }
};
