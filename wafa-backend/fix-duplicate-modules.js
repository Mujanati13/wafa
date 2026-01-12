import mongoose from 'mongoose';
import UserStats from './models/userStatsModel.js';

const MONGO_URL = 'mongodb+srv://azdineserhani1:Cypm6phUUtn1GjaY@cluster0.gy4sjl1.mongodb.net/wafa?retryWrites=true&w=majority&appName=Cluster0';

async function fixDuplicateModules() {
  console.log('\n🔧 Starting Duplicate Module Progress Cleanup...\n');

  await mongoose.connect(MONGO_URL);
  console.log('✓ Connected to MongoDB\n');

  // Get all user stats with module progress
  const allUserStats = await UserStats.find({ 
    moduleProgress: { $exists: true, $ne: [] } 
  });
  
  console.log(`📊 Found ${allUserStats.length} users with module progress\n`);

  let cleanedCount = 0;
  let skippedCount = 0;
  let totalDuplicatesRemoved = 0;

  for (const userStat of allUserStats) {
    try {
      const moduleProgress = userStat.moduleProgress || [];
      const moduleMap = new Map();
      
      // Consolidate duplicates by moduleId
      moduleProgress.forEach(mp => {
        const moduleIdStr = mp.moduleId?.toString();
        if (!moduleIdStr) return;
        
        if (moduleMap.has(moduleIdStr)) {
          // Merge with existing entry
          const existing = moduleMap.get(moduleIdStr);
          existing.questionsAttempted += mp.questionsAttempted || 0;
          existing.correctAnswers += mp.correctAnswers || 0;
          existing.wrongAnswers += mp.wrongAnswers || 0;
          existing.lastAttemptDate = mp.lastAttemptDate || existing.lastAttemptDate;
        } else {
          // First entry for this module
          moduleMap.set(moduleIdStr, {
            moduleId: mp.moduleId,
            moduleName: mp.moduleName,
            questionsAttempted: mp.questionsAttempted || 0,
            correctAnswers: mp.correctAnswers || 0,
            wrongAnswers: mp.wrongAnswers || 0,
            lastAttemptDate: mp.lastAttemptDate
          });
        }
      });
      
      const originalCount = moduleProgress.length;
      const consolidatedProgress = Array.from(moduleMap.values());
      const duplicatesRemoved = originalCount - consolidatedProgress.length;
      
      if (duplicatesRemoved > 0) {
        userStat.moduleProgress = consolidatedProgress;
        await userStat.save();
        
        console.log(`✅ Cleaned user ${userStat.userId}`);
        console.log(`   Original entries: ${originalCount}`);
        console.log(`   After cleanup: ${consolidatedProgress.length}`);
        console.log(`   Duplicates removed: ${duplicatesRemoved}\n`);
        
        cleanedCount++;
        totalDuplicatesRemoved += duplicatesRemoved;
      } else {
        skippedCount++;
      }
    } catch (error) {
      console.error(`❌ Error cleaning user ${userStat.userId}:`, error.message);
    }
  }

  console.log('\n═══════════════════════════════════════');
  console.log('  CLEANUP COMPLETE');
  console.log('═══════════════════════════════════════');
  console.log(`✅ Cleaned: ${cleanedCount} users`);
  console.log(`⏭️  Skipped: ${skippedCount} users (no duplicates)`);
  console.log(`🗑️  Total duplicates removed: ${totalDuplicatesRemoved}`);
  console.log('═══════════════════════════════════════\n');

  mongoose.disconnect();
}

fixDuplicateModules().catch(error => {
  console.error('❌ Cleanup failed:', error);
  mongoose.disconnect();
  process.exit(1);
});
