import { api } from "@/lib/utils";

// Helper function to get year from semester (S1-S2 = Year 1, S3-S4 = Year 2, etc.)
const getYearFromSemester = (semester) => {
  if (!semester) return null;
  const semesterNum = parseInt(semester.replace('S', ''));
  return Math.ceil(semesterNum / 2);
};

// Helper function to get both semesters for a year
const getSemestersForYear = (year) => {
  const firstSemester = (year - 1) * 2 + 1;
  const secondSemester = firstSemester + 1;
  return [`S${firstSemester}`, `S${secondSemester}`];
};

export const dashboardService = {
  // Get user profile
  getUserProfile: async () => {
    try {
      const { data } = await api.get('/users/profile');
      return data;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      throw error;
    }
  },

  // Get user stats - optionally filtered by semester
  getUserStats: async (semester = null) => {
    try {
      const url = semester
        ? `/users/my-stats?semester=${semester}`
        : '/users/my-stats';
      const { data } = await api.get(url);
      return data;
    } catch (error) {
      console.error("Error fetching user stats:", error);
      throw error;
    }
  },

  // Get user's subscription info (for regular users)
  getUserSubscriptionInfo: async () => {
    try {
      const { data } = await api.get('/users/subscription-info');
      return data;
    } catch (error) {
      console.error("Error fetching user subscription info:", error);
      throw error;
    }
  },

  // Get leaderboard rank for current user - grouped by year (2 semesters)
  getLeaderboardRank: async (semester = null) => {
    try {
      // Determine which year to filter by (S1-S2 = Year 1, S3-S4 = Year 2, etc.)
      let url = '/users/leaderboard?limit=1000';

      if (semester) {
        const year = getYearFromSemester(semester);
        const semesters = getSemestersForYear(year);
        // Pass the year's semesters to the API
        url += `&semesters=${semesters.join(',')}`;
      }

      const { data } = await api.get(url);

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

  // Helper to get the year label from a semester
  getYearLabel: (semester) => {
    if (!semester) return '';
    const year = getYearFromSemester(semester);
    const semesters = getSemestersForYear(year);
    return `${semesters[0]}-${semesters[1]} (${year}ème année)`;
  },
};

