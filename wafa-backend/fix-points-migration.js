import mongoose from 'mongoose';
import UserStats from './models/userStatsModel.js';

const MONGO_URL = 'mongodb+srv://azdineserhani1:Cypm6phUUtn1GjaY@cluster0.gy4sjl1.mongodb.net/wafa?retryWrites=true&w=majority&appName=Cluster0';

async function fixPointsSystem() {
  console.log('\n🔧 Starting Point System Migration...\n');

  await mongoose.connect(MONGO_URL);
  console.log('✓ Connected to MongoDB\n');

  // Get all user stats
  const allUserStats = await UserStats.find({});
  console.log(`📊 Found ${allUserStats.length} user stats to process\n`);

  let updatedCount = 0;
  let skippedCount = 0;

  for (const userStat of allUserStats) {
    try {
      // Recalculate normal points based on correct answers (NEW SYSTEM: +1 per correct)
      const newNormalPoints = userStat.correctAnswers || 0;
      
      // Keep blue and green points as they are (admin-awarded, not recalculated)
      const bluePoints = userStat.bluePoints || 0;
      const greenPoints = userStat.greenPoints || 0;
      
      // Calculate new total
      const newTotalPoints = newNormalPoints + bluePoints + greenPoints;
      
      // Check if update is needed
      const needsUpdate = 
        userStat.normalPoints !== newNormalPoints ||
        userStat.totalPoints !== newTotalPoints;

      if (needsUpdate) {
        userStat.normalPoints = newNormalPoints;
        userStat.totalPoints = newTotalPoints;
        await userStat.save();
        
        console.log(`✅ Updated user ${userStat.userId}`);
        console.log(`   Correct Answers: ${userStat.correctAnswers}`);
        console.log(`   Normal Points: ${userStat.normalPoints} (was different)`);
        console.log(`   Blue Points: ${bluePoints}`);
        console.log(`   Green Points: ${greenPoints}`);
        console.log(`   Total Points: ${userStat.totalPoints}\n`);
        
        updatedCount++;
      } else {
        skippedCount++;
      }
    } catch (error) {
      console.error(`❌ Error updating user ${userStat.userId}:`, error.message);
    }
  }

  console.log('\n═══════════════════════════════════════');
  console.log('  MIGRATION COMPLETE');
  console.log('═══════════════════════════════════════');
  console.log(`✅ Updated: ${updatedCount} users`);
  console.log(`⏭️  Skipped: ${skippedCount} users (already correct)`);
  console.log('═══════════════════════════════════════\n');

  mongoose.disconnect();
}

fixPointsSystem().catch(error => {
  console.error('❌ Migration failed:', error);
  mongoose.disconnect();
  process.exit(1);
});
