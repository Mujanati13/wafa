import { api } from "@/lib/utils";
import { userService } from "@/services/userService";

// Cache for leaderboard data
let leaderboardCache = {};
let leaderboardCacheTime = {};
const LEADERBOARD_CACHE_EXPIRY = 60000; // 1 minute

// Cache for stats
let statsCache = {};
let statsCacheTime = {};
const STATS_CACHE_EXPIRY = 30000; // 30 seconds

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
  // Get user profile - use cached version from userService
  getUserProfile: async () => {
    try {
      const { data } = await api.get('/users/profile');
      return data;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      throw error;
    }
  },

  // Get user stats - optionally filtered by semester with caching
  getUserStats: async (semester = null) => {
    try {
      const cacheKey = semester || 'all';
      const now = Date.now();

      // Return cached if valid
      if (statsCache[cacheKey] && statsCacheTime[cacheKey] && 
          (now - statsCacheTime[cacheKey]) < STATS_CACHE_EXPIRY) {
        return statsCache[cacheKey];
      }

      const url = semester
        ? `/users/my-stats?semester=${semester}`
        : '/users/my-stats';
      const { data } = await api.get(url);
      
      // Cache the result
      statsCache[cacheKey] = data;
      statsCacheTime[cacheKey] = now;
      
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

  // Get leaderboard rank for current user - grouped by year (2 semesters) with caching
  getLeaderboardRank: async (semester = null) => {
    try {
      const cacheKey = semester || 'all';
      const now = Date.now();

      // Return cached if valid
      if (leaderboardCache[cacheKey] && leaderboardCacheTime[cacheKey] && 
          (now - leaderboardCacheTime[cacheKey]) < LEADERBOARD_CACHE_EXPIRY) {
        return leaderboardCache[cacheKey];
      }

      // Determine which year to filter by (S1-S2 = Year 1, S3-S4 = Year 2, etc.)
      let url = '/users/leaderboard?limit=1000';

      if (semester) {
        const year = getYearFromSemester(semester);
        const semesters = getSemestersForYear(year);
        // Pass the year's semesters to the API
        url += `&semesters=${semesters.join(',')}`;
      }

      // Fetch leaderboard and get user ID from cache/localStorage (avoid extra API call)
      const { data } = await api.get(url);

      // Get user ID from cached profile instead of making another API call
      let userId = null;
      const cachedProfile = localStorage.getItem('userProfile');
      if (cachedProfile) {
        const user = JSON.parse(cachedProfile);
        userId = user._id;
      } else {
        // Fallback to API call only if no cache
        const userProfile = await userService.getUserProfile();
        userId = userProfile._id;
      }

      // The API returns { success: true, data: { leaderboard: [...] } }
      const leaderboard = data.data?.leaderboard || data.leaderboard || [];

      // Find user's rank in leaderboard
      const rank = leaderboard.findIndex(
        (user) => user.userId?.toString() === userId?.toString() || user._id?.toString() === userId?.toString()
      ) + 1 || 0;

      const result = { rank, leaderboard };
      
      // Cache the result
      leaderboardCache[cacheKey] = result;
      leaderboardCacheTime[cacheKey] = now;
      
      return result;
    } catch (error) {
      console.error("Error fetching leaderboard rank:", error);
      return { rank: 0, leaderboard: [] };
    }
  },

  // Clear all caches
  clearCache: () => {
    statsCache = {};
    statsCacheTime = {};
    leaderboardCache = {};
    leaderboardCacheTime = {};
  },

  // Helper to get the year label from a semester
  getYearLabel: (semester) => {
    if (!semester) return '';
    const year = getYearFromSemester(semester);
    const semesters = getSemestersForYear(year);
    return `${semesters[0]}-${semesters[1]} (${year}ème année)`;
  },
};

