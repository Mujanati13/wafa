import mongoose from 'mongoose';
import UserStats from './models/userStatsModel.js';
import User from './models/userModel.js';

const MONGO_URL = 'mongodb+srv://azdineserhani1:Cypm6phUUtn1GjaY@cluster0.gy4sjl1.mongodb.net/wafa?retryWrites=true&w=majority&appName=Cluster0';

async function testDashboardPerformanceData() {
  console.log('\n🔍 Testing Dashboard Performance Analysis Data...\n');

  await mongoose.connect(MONGO_URL);
  console.log('✓ Connected to MongoDB\n');

  // Get a sample user
  const sampleUser = await User.findOne().lean();
  if (!sampleUser) {
    console.log('❌ No users found in database');
    mongoose.disconnect();
    return;
  }

  console.log(`📊 Testing with user: ${sampleUser.name || sampleUser.email}`);
  console.log(`   User ID: ${sampleUser._id}`);
  console.log(`   Semesters: ${sampleUser.semesters?.join(', ') || 'None'}\n`);

  // Get user stats
  const userStats = await UserStats.findOne({ userId: sampleUser._id }).lean();
  
  if (!userStats) {
    console.log('⚠️  No stats found for this user');
    mongoose.disconnect();
    return;
  }

  console.log('✅ UserStats found!\n');

  // Test 1: Module Progress Data
  console.log('📈 Module Progress:');
  if (userStats.moduleProgress && userStats.moduleProgress.length > 0) {
    console.log(`   ✅ ${userStats.moduleProgress.length} modules tracked`);
    const sample = userStats.moduleProgress[0];
    console.log(`   Sample: ${sample.moduleName || 'N/A'}`);
    console.log(`   - Questions Attempted: ${sample.questionsAttempted || 0}`);
    console.log(`   - Correct Answers: ${sample.correctAnswers || 0}`);
    console.log(`   - Wrong Answers: ${sample.wrongAnswers || 0}`);
  } else {
    console.log('   ⚠️  No module progress data');
  }

  // Test 2: Weekly Activity Data
  console.log('\n📅 Weekly Activity:');
  if (userStats.weeklyActivity && userStats.weeklyActivity.length > 0) {
    console.log(`   ✅ ${userStats.weeklyActivity.length} activity records`);
    const lastWeek = userStats.weeklyActivity.slice(-7);
    console.log(`   Last 7 days: ${lastWeek.length} records`);
    lastWeek.forEach(activity => {
      const date = new Date(activity.date).toLocaleDateString();
      console.log(`   - ${date}: ${activity.questionsAttempted || 0} questions, ${activity.timeSpent || 0} min`);
    });
  } else {
    console.log('   ⚠️  No weekly activity data');
  }

  // Test 3: Overall Stats
  console.log('\n📊 Overall Stats:');
  console.log(`   Total Points: ${userStats.totalPoints || 0}`);
  console.log(`   Normal Points: ${userStats.normalPoints || 0}`);
  console.log(`   Blue Points: ${userStats.bluePoints || 0}`);
  console.log(`   Green Points: ${userStats.greenPoints || 0}`);
  console.log(`   Questions Answered: ${userStats.questionsAnswered || 0}`);
  console.log(`   Correct Answers: ${userStats.correctAnswers || 0}`);
  console.log(`   Wrong Answers: ${userStats.wrongAnswers || 0}`);
  console.log(`   Average Score: ${userStats.averageScore?.toFixed(2) || 0}%`);
  console.log(`   Total Exams: ${userStats.totalExams || 0}`);

  // Test 4: Data Quality Checks
  console.log('\n🔍 Data Quality Checks:');
  const issues = [];

  // Check for duplicate moduleProgress entries
  const moduleIds = userStats.moduleProgress?.map(mp => mp.moduleId?.toString()) || [];
  const uniqueModuleIds = [...new Set(moduleIds)];
  if (moduleIds.length !== uniqueModuleIds.length) {
    issues.push(`Duplicate module progress entries (${moduleIds.length} total, ${uniqueModuleIds.length} unique)`);
  }

  // Check for negative values
  if (userStats.totalPoints < 0) issues.push('Negative total points');
  if (userStats.questionsAnswered < 0) issues.push('Negative questions answered');

  // Check for logical inconsistencies
  if (userStats.correctAnswers + userStats.wrongAnswers > userStats.questionsAnswered) {
    issues.push('Correct + Wrong > Total questions');
  }

  if (issues.length > 0) {
    console.log('   ⚠️  Issues found:');
    issues.forEach(issue => console.log(`      - ${issue}`));
  } else {
    console.log('   ✅ No data quality issues detected');
  }

  // Test 5: Charts Data Preparation
  console.log('\n📊 Charts Data Preparation Test:');
  
  // Module Progress for Bar Chart (top 6)
  const top6Modules = (userStats.moduleProgress || [])
    .slice(0, 6)
    .map(mp => ({
      name: mp.moduleName?.substring(0, 12) || 'N/A',
      completed: mp.correctAnswers || 0,
      pending: (mp.questionsAttempted || 0) - (mp.correctAnswers || 0)
    }));
  console.log('   Bar Chart (Module Progress):', top6Modules.length > 0 ? '✅ Ready' : '⚠️  Empty');

  // Weekly Activity for Study Time Chart
  const last7Days = (userStats.weeklyActivity || []).slice(-7);
  const studyTimeData = last7Days.map(activity => ({
    day: new Date(activity.date).toLocaleDateString('en-US', { weekday: 'short' }),
    hours: Math.round((activity.timeSpent || 0) / 60 * 10) / 10
  }));
  console.log('   Bar Chart (Study Time):', studyTimeData.length > 0 ? '✅ Ready' : '⚠️  Empty');

  // Performance Trend for Line Chart
  const hasPerformanceData = (userStats.weeklyActivity || []).length > 0;
  console.log('   Line Chart (Performance Trend):', hasPerformanceData ? '✅ Ready' : '⚠️  Empty');

  // Completion Rate for Pie Chart
  const totalAnswered = userStats.questionsAnswered || 0;
  const completionData = totalAnswered > 0 ? [
    { name: 'Correct', value: userStats.correctAnswers || 0 },
    { name: 'Incorrect', value: userStats.wrongAnswers || 0 }
  ] : [];
  console.log('   Pie Chart (Completion Rate):', completionData.length > 0 ? '✅ Ready' : '⚠️  Empty');

  console.log('\n✅ Dashboard Performance Analysis Test Complete!\n');
  
  mongoose.disconnect();
}

testDashboardPerformanceData().catch(error => {
  console.error('❌ Test failed:', error);
  mongoose.disconnect();
  process.exit(1);
});
