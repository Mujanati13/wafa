import User from "../models/userModel.js";
import Transaction from "../models/transactionModel.js";
import UserStats from "../models/userStatsModel.js";
import asyncHandler from "../handlers/asyncHandler.js";

export const AdminAnalyticsController = {
  // Get dashboard statistics
  getDashboardStats: asyncHandler(async (req, res) => {
    try {
      // Total users count
      const totalUsers = await User.countDocuments();
      
      // Active subscriptions (Premium users)
      const activeSubscriptions = await User.countDocuments({ plan: "Premium" });
      
      // Users from last month for comparison
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      
      const usersLastMonth = await User.countDocuments({
        createdAt: { $gte: lastMonth }
      });
      
      // Calculate user growth percentage
      const userGrowth = totalUsers > 0 
        ? ((usersLastMonth / totalUsers) * 100).toFixed(1)
        : 0;
      
      // Subscription growth
      const subscriptionsLastMonth = await User.countDocuments({
        plan: "Premium",
        createdAt: { $gte: lastMonth }
      });
      
      const subscriptionGrowth = activeSubscriptions > 0
        ? ((subscriptionsLastMonth / activeSubscriptions) * 100).toFixed(1)
        : 0;
      
      // Total exam attempts from user stats
      const examStats = await UserStats.aggregate([
        {
          $group: {
            _id: null,
            totalExams: { $sum: "$totalExams" },
            avgScore: { $avg: "$averageScore" },
            totalStudyHours: { $sum: "$studyHours" }
          }
        }
      ]);
      
      const examData = examStats[0] || { totalExams: 0, avgScore: 0, totalStudyHours: 0 };
      
      // Exam attempts last month
      const examsLastMonth = await UserStats.aggregate([
        {
          $match: {
            lastExamDate: { $gte: lastMonth }
          }
        },
        {
          $group: {
            _id: null,
            count: { $sum: "$totalExams" }
          }
        }
      ]);
      
      const examGrowth = examData.totalExams > 0 && examsLastMonth[0]
        ? ((examsLastMonth[0].count / examData.totalExams) * 100).toFixed(1)
        : 0;
      
      // Calculate monthly revenue (mock for now, can be replaced with real transaction data)
      const transactions = await Transaction.aggregate([
        {
          $match: {
            status: "completed",
            createdAt: { $gte: lastMonth }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$amount" }
          }
        }
      ]);
      
      const monthlyRevenue = transactions[0]?.total || 0;
      
      res.status(200).json({
        success: true,
        data: {
          totalUsers: {
            value: totalUsers,
            growth: `+${userGrowth}%`,
            newUsers: usersLastMonth
          },
          activeSubscriptions: {
            value: activeSubscriptions,
            growth: `+${subscriptionGrowth}%`,
            newSubscriptions: subscriptionsLastMonth
          },
          examAttempts: {
            value: examData.totalExams,
            growth: `+${examGrowth}%`,
            recentAttempts: examsLastMonth[0]?.count || 0
          },
          monthlyRevenue: {
            value: monthlyRevenue,
            currency: "MAD"
          },
          performanceMetrics: {
            averageScore: examData.avgScore.toFixed(1),
            totalStudyHours: examData.totalStudyHours.toFixed(1)
          }
        }
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching dashboard statistics",
        error: error.message
      });
    }
  }),

  // Get user growth data for chart
  getUserGrowth: asyncHandler(async (req, res) => {
    const { period = "30d" } = req.query;
    
    let startDate = new Date();
    switch (period) {
      case "7d":
        startDate.setDate(startDate.getDate() - 7);
        break;
      case "30d":
        startDate.setDate(startDate.getDate() - 30);
        break;
      case "90d":
        startDate.setDate(startDate.getDate() - 90);
        break;
      case "1y":
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(startDate.getDate() - 30);
    }
    
    const userGrowth = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 }
      }
    ]);
    
    res.status(200).json({
      success: true,
      data: userGrowth
    });
  }),

  // Get recent activity
  getRecentActivity: asyncHandler(async (req, res) => {
    const { limit = 10 } = req.query;
    
    // Get recent users
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .select("username email createdAt plan");
    
    // Get recent subscription upgrades
    const recentSubscriptions = await User.find({ plan: "Premium" })
      .sort({ updatedAt: -1 })
      .limit(5)
      .select("username email updatedAt");
    
    // Format activities
    const activities = [
      ...recentUsers.map(user => ({
        type: "user",
        action: "New user registered",
        user: user.username,
        email: user.email,
        time: user.createdAt
      })),
      ...recentSubscriptions.map(user => ({
        type: "subscription",
        action: "Subscription upgraded",
        user: user.username,
        email: user.email,
        time: user.updatedAt
      }))
    ];
    
    // Sort by time
    activities.sort((a, b) => new Date(b.time) - new Date(a.time));
    
    res.status(200).json({
      success: true,
      data: activities.slice(0, parseInt(limit))
    });
  }),

  // Get subscription analytics
  getSubscriptionAnalytics: asyncHandler(async (req, res) => {
    const freeUsers = await User.countDocuments({ plan: "Free" });
    const premiumUsers = await User.countDocuments({ plan: "Premium" });
    
    res.status(200).json({
      success: true,
      data: {
        free: freeUsers,
        premium: premiumUsers,
        total: freeUsers + premiumUsers,
        conversionRate: ((premiumUsers / (freeUsers + premiumUsers)) * 100).toFixed(2)
      }
    });
  }),

  // Get user demographics
  getUserDemographics: asyncHandler(async (req, res) => {
    const demographics = await User.aggregate([
      {
        $group: {
          _id: "$semesters",
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    
    res.status(200).json({
      success: true,
      data: demographics
    });
  }),

  // Get leaderboard with rankings
  getLeaderboard: asyncHandler(async (req, res) => {
    const { year, studentYear, period = 'all', limit = 50 } = req.query;
    
    // Build match criteria
    const matchCriteria = {};
    
    if (year && year !== 'All') {
      matchCriteria['semesters'] = year;
    }
    
    // Fetch users with their stats
    const leaderboard = await UserStats.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $match: {
          ...matchCriteria,
          'user.isAactive': true
        }
      },
      {
        $project: {
          username: '$user.username',
          name: '$user.name',
          email: '$user.email',
          photoURL: '$user.profilePicture',
          normalPoints: { $ifNull: ['$totalPoints', 0] },
          points: { $ifNull: ['$totalPoints', 0] },
          bluePoints: { $ifNull: ['$bluePoints', 0] },
          greenPoints: { $ifNull: ['$greenPoints', 0] },
          totalExams: { $ifNull: ['$totalExams', 0] },
          averageScore: { $ifNull: ['$averageScore', 0] },
          studyHours: { $ifNull: ['$studyHours', 0] },
          questionsAnswered: { $ifNull: ['$questionsAnswered', 0] },
          correctAnswers: { $ifNull: ['$correctAnswers', 0] },
          semesters: '$user.semesters',
          plan: '$user.plan',
          currentYear: '$user.currentYear'
        }
      },
      {
        $addFields: {
          totalPoints: { $add: ['$normalPoints', '$bluePoints', '$greenPoints'] },
          level: { 
            $floor: { 
              $divide: [{ $ifNull: ['$totalPoints', 0] }, 50] 
            } 
          }
        }
      },
      {
        $sort: { totalPoints: -1 }
      },
      {
        $limit: parseInt(limit)
      }
    ]);
    
    // Add rank to each user
    const rankedLeaderboard = leaderboard.map((user, index) => ({
      ...user,
      rank: index + 1
    }));
    
    // Calculate statistics
    const totalUsers = leaderboard.length;
    const topPoints = leaderboard[0]?.totalPoints || 0;
    const avgPoints = totalUsers > 0
      ? Math.round(leaderboard.reduce((acc, u) => acc + (u.totalPoints || 0), 0) / totalUsers)
      : 0;
    
    res.status(200).json({
      success: true,
      data: {
        leaderboard: rankedLeaderboard,
        stats: {
          totalUsers,
          topPoints,
          avgPoints
        }
      }
    });
  })
};

export default AdminAnalyticsController;
