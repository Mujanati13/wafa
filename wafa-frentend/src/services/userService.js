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

    // Get current user profile
    getUserProfile: async (forceRefresh = false) => {
        try {
            // Clear cached user data if force refresh is requested
            if (forceRefresh) {
                localStorage.removeItem('userProfile');
            }
            
            console.log('Fetching user profile from: /users/profile');
            const response = await api.get('/users/profile');
            const user = response.data.data.user;
            
            // Update localStorage with fresh data
            localStorage.setItem('userProfile', JSON.stringify(user));
            
            return user;
        } catch (error) {
            console.error('Error fetching user profile:', error);
            throw error;
        }
    },

    // Update user profile
    updateUserProfile: async (profileData) => {
        try {
            console.log('Updating user profile at: /users/profile');
            const response = await api.put('/users/profile', profileData);
            return response.data.data.user;
        } catch (error) {
            console.error('Error updating user profile:', error);
            throw error;
        }
    },

    // Upload profile picture
    uploadProfilePicture: async (file) => {
        try {
            const formData = new FormData();
            formData.append('profilePicture', file);

            console.log('Uploading profile picture to: /users/upload-photo');
            const response = await api.post('/users/upload-photo', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data.data.user;
        } catch (error) {
            console.error('Error uploading profile picture:', error);
            throw error;
        }
    },

    // Get current user stats and achievements
    getMyStats: async () => {
        try {
            console.log('Fetching user stats from: /users/my-stats');
            const response = await api.get('/users/my-stats');
            return response.data.data.stats;
        } catch (error) {
            console.error('Error fetching user stats:', error);
            throw error;
        }
    },

    // Update user (for admin purposes)
    updateUser: async (userId, updateData) => {
        try {
            console.log(`Updating user ${userId}:`, updateData);
            const response = await api.put(`/users/${userId}`, updateData);
            return response.data;
        } catch (error) {
            console.error('Error updating user:', error);
            throw error;
        }
    },

    // Get leaderboard
    getLeaderboard: async (limit = 20) => {
        try {
            const response = await api.get(`/users/leaderboard`, { params: { limit } });
            return response.data;
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
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
