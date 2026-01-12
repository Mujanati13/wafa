import mongoose from 'mongoose';
import User from './models/userModel.js';
import UserStats from './models/userStatsModel.js';
import Transaction from './models/transactionModel.js';

const MONGO_URL = 'mongodb+srv://azdineserhani1:Cypm6phUUtn1GjaY@cluster0.gy4sjl1.mongodb.net/wafa?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(MONGO_URL).then(async () => {
  console.log('✓ MongoDB Connected\n');
  
  // Total users count
  const totalUsers = await User.countDocuments();
  console.log('📊 Total Users:', totalUsers);
  
  // Active subscriptions
  const activeSubscriptions = await User.countDocuments({ plan: "Premium" });
  console.log('💳 Active Subscriptions:', activeSubscriptions);
  
  // Exam stats
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
  
  console.log('🎓 Exam Stats:', examStats[0] || { totalExams: 0, avgScore: 0, totalStudyHours: 0 });
  
  // User growth (last 30 days)
  const lastMonth = new Date();
  lastMonth.setDate(lastMonth.getDate() - 30);
  const recentUsers = await User.countDocuments({ createdAt: { $gte: lastMonth } });
  console.log('📈 New Users (Last 30 days):', recentUsers);
  
  // User demographics
  const demographics = await User.aggregate([
    {
      $group: {
        _id: "$semesters",
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } }
  ]);
  console.log('\n👥 User Demographics:');
  demographics.slice(0, 5).forEach(d => {
    console.log(`   ${d._id || 'N/A'}: ${d.count} users`);
  });
  
  console.log('\n✅ Analytics Backend is Working!\n');
  mongoose.disconnect();
  process.exit(0);
}).catch(e => {
  console.error('❌ Error:', e.message);
  process.exit(1);
});
