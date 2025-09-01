import { api } from '../lib/utils.js';

export const userService = {
    // Get all users with pagination
    getAllUsers: async (page = 1, limit = 10) => {
        try {
            console.log(`Fetching all users from: /users?page=${page}&limit=${limit}`);
            const response = await api.get(`/users?page=${page}&limit=${limit}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching all users:', error);
            throw error;
        }
    },

    // Get free users
    getFreeUsers: async (page = 1, limit = 10) => {
        try {
            console.log(`Fetching free users from: /users/free?page=${page}&limit=${limit}`);
            const response = await api.get(`/users/free?page=${page}&limit=${limit}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching free users:', error);
            throw error;
        }
    },

    // Get paying users
    getPayingUsers: async (page = 1, limit = 10) => {
        try {
            console.log(`Fetching paying users from: /users/paying?page=${page}&limit=${limit}`);
            const response = await api.get(`/users/paying?page=${page}&limit=${limit}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching paying users:', error);
            throw error;
        }
    },

    // Get user statistics
    getUserStats: async () => {
        try {
            console.log(`Fetching user stats from: /users/stats`);
            const response = await api.get(`/users/stats`);
            return response.data;
        } catch (error) {
            console.error('Error fetching user stats:', error);
            throw error;
        }
    },

    // Update user plan
    updateUserPlan: async (userId, plan) => {
        try {
            const response = await api.patch(`/users/${userId}/plan`, { plan });
            return response.data;
        } catch (error) {
            console.error('Error updating user plan:', error);
            throw error;
        }
    },

    // Toggle user status
    toggleUserStatus: async (userId) => {
        try {
            const response = await api.patch(`/users/${userId}/status`);
            return response.data;
        } catch (error) {
            console.error('Error toggling user status:', error);
            throw error;
        }
    },

    // Test connection
    testConnection: async () => {
        try {
            console.log('Testing API connection...');
            const response = await api.get(`/test`);
            return response.data;
        } catch (error) {
            console.error('Error testing connection:', error);
            throw error;
        }
    },
};
