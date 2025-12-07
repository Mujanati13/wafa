import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export const dashboardService = {
  // Get user profile
  getUserProfile: async () => {
    try {
      const { data } = await axios.get(`${API_URL}/users/profile`, {
        withCredentials: true,
      });
      return data;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      throw error;
    }
  },

  // Get user stats
  getUserStats: async () => {
    try {
      const { data } = await axios.get(`${API_URL}/users/my-stats`, {
        withCredentials: true,
      });
      return data;
    } catch (error) {
      console.error("Error fetching user stats:", error);
      throw error;
    }
  },

  // Get user's subscription info (for regular users)
  getUserSubscriptionInfo: async () => {
    try {
      const { data } = await axios.get(`${API_URL}/users/subscription-info`, {
        withCredentials: true,
      });
      return data;
    } catch (error) {
      console.error("Error fetching user subscription info:", error);
      throw error;
    }
  },

  // Get leaderboard rank for current user
  getLeaderboardRank: async () => {
    try {
      const { data } = await axios.get(`${API_URL}/users/leaderboard?limit=1000`, {
        withCredentials: true,
      });
      
      // Get current user info
      const userProfile = await dashboardService.getUserProfile();
      const userId = userProfile.data?.user?._id || userProfile.data?._id;
      
      // The API returns { success: true, data: { leaderboard: [...] } }
      const leaderboard = data.data?.leaderboard || data.leaderboard || [];
      
      // Find user's rank in leaderboard
      const rank = leaderboard.findIndex(
        (user) => user.userId?.toString() === userId?.toString() || user._id?.toString() === userId?.toString()
      ) + 1 || 0;
      
      return { rank, leaderboard };
    } catch (error) {
      console.error("Error fetching leaderboard rank:", error);
      return { rank: 0, leaderboard: [] };
    }
  },
};
