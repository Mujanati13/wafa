import mongoose from 'mongoose';
import UserStats from './models/userStatsModel.js';
import User from './models/userModel.js';

const MONGO_URL = 'mongodb+srv://azdineserhani1:Cypm6phUUtn1GjaY@cluster0.gy4sjl1.mongodb.net/wafa?retryWrites=true&w=majority&appName=Cluster0';

async function testPointSystem() {
  console.log('\n🔍 Testing Point System Configuration...\n');

  await mongoose.connect(MONGO_URL);
  console.log('✓ Connected to MongoDB\n');

  // Get all users with points
  const usersWithPoints = await UserStats.find({ totalPoints: { $gt: 0 } })
    .sort({ totalPoints: -1 })
    .limit(5)
    .populate('userId', 'name email')
    .lean();

  console.log('📊 Top 5 Users by Points:\n');
  
  if (usersWithPoints.length === 0) {
    console.log('⚠️  No users with points found\n');
  } else {
    usersWithPoints.forEach((userStat, index) => {
      console.log(`${index + 1}. ${userStat.userId?.name || 'Unknown'}`);
      console.log(`   Total Points: ${userStat.totalPoints || 0}`);
      console.log(`   - Normal (QCM): ${userStat.normalPoints || 0}`);
      console.log(`   - Blue (Explanations): ${userStat.bluePoints || 0}`);
      console.log(`   - Green (Reports): ${userStat.greenPoints || 0}`);
      console.log(`   Questions Answered: ${userStat.questionsAnswered || 0}`);
      console.log(`   Correct: ${userStat.correctAnswers || 0} | Wrong: ${userStat.wrongAnswers || 0}`);
      console.log('');
    });
  }

  // Test point calculations
  console.log('🧮 Point System Verification:\n');
  
  console.log('Expected Point Values:');
  console.log('   ✓ Correct Answer: +1 point');
  console.log('   ✓ Wrong Answer: 0 points');
  console.log('   ✓ Retry: 0 points');
  console.log('   ✓ Explanation Approved (Blue): +40 points');
  console.log('   ✓ Report Approved (Green): +30 points\n');

  // Calculate expected vs actual
  if (usersWithPoints.length > 0) {
    const sample = usersWithPoints[0];
    const expectedNormalPoints = sample.correctAnswers || 0; // +1 per correct
    const actualNormalPoints = sample.normalPoints || 0;
    
    console.log('Sample Calculation Check (Top User):');
    console.log(`   Correct Answers: ${sample.correctAnswers || 0}`);
    console.log(`   Expected Normal Points: ${expectedNormalPoints}`);
    console.log(`   Actual Normal Points: ${actualNormalPoints}`);
    
    if (Math.abs(expectedNormalPoints - actualNormalPoints) > sample.correctAnswers * 0.1) {
      console.log('   ⚠️  Points may be calculated with old system (+2/-1)');
      console.log('   ℹ️  Consider running a migration script to recalculate points');
    } else {
      console.log('   ✅ Points appear to be calculated correctly');
    }
  }

  // Test point distribution
  console.log('\n📈 Point Distribution Analysis:\n');
  
  const stats = await UserStats.aggregate([
    {
      $group: {
        _id: null,
        totalUsers: { $sum: 1 },
        avgTotalPoints: { $avg: '$totalPoints' },
        avgNormalPoints: { $avg: '$normalPoints' },
        avgBluePoints: { $avg: '$bluePoints' },
        avgGreenPoints: { $avg: '$greenPoints' },
        maxPoints: { $max: '$totalPoints' },
        minPoints: { $min: '$totalPoints' },
        totalCorrectAnswers: { $sum: '$correctAnswers' },
        totalQuestionsAnswered: { $sum: '$questionsAnswered' }
      }
    }
  ]);

  if (stats.length > 0) {
    const data = stats[0];
    console.log(`   Total Users in System: ${data.totalUsers}`);
    console.log(`   Average Total Points: ${Math.round(data.avgTotalPoints || 0)}`);
    console.log(`   Average Normal Points: ${Math.round(data.avgNormalPoints || 0)}`);
    console.log(`   Average Blue Points: ${Math.round(data.avgBluePoints || 0)}`);
    console.log(`   Average Green Points: ${Math.round(data.avgGreenPoints || 0)}`);
    console.log(`   Max Points: ${data.maxPoints || 0}`);
    console.log(`   Min Points: ${data.minPoints || 0}`);
    console.log(`   Total Correct Answers: ${data.totalCorrectAnswers || 0}`);
    console.log(`   Total Questions Answered: ${data.totalQuestionsAnswered || 0}`);
    
    const accuracy = data.totalQuestionsAnswered > 0 
      ? ((data.totalCorrectAnswers / data.totalQuestionsAnswered) * 100).toFixed(2)
      : 0;
    console.log(`   Overall Accuracy: ${accuracy}%`);
  }

  console.log('\n✅ Point System Test Complete!\n');
  
  mongoose.disconnect();
}

testPointSystem().catch(error => {
  console.error('❌ Test failed:', error);
  mongoose.disconnect();
  process.exit(1);
});
