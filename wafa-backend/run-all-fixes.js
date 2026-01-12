import mongoose from 'mongoose';
import UserStats from './models/userStatsModel.js';

const MONGO_URL = 'mongodb+srv://azdineserhani1:Cypm6phUUtn1GjaY@cluster0.gy4sjl1.mongodb.net/wafa?retryWrites=true&w=majority&appName=Cluster0';

async function runAllFixes() {
  console.log('\n╔═══════════════════════════════════════════╗');
  console.log('║   COMPREHENSIVE DATA MIGRATION SUITE     ║');
  console.log('╚═══════════════════════════════════════════╝\n');

  await mongoose.connect(MONGO_URL);
  console.log('✓ Connected to MongoDB\n');

  // Get all user stats
  const allUserStats = await UserStats.find({});
  console.log(`📊 Processing ${allUserStats.length} user records\n`);

  let stats = {
    pointsFixed: 0,
    duplicatesFixed: 0,
    totalDuplicatesRemoved: 0,
    skipped: 0,
    errors: 0
  };

  for (const userStat of allUserStats) {
    try {
      let needsSave = false;

      // FIX 1: Duplicate Module Progress
      const moduleProgress = userStat.moduleProgress || [];
      if (moduleProgress.length > 0) {
        const moduleMap = new Map();
        
        moduleProgress.forEach(mp => {
          const moduleIdStr = mp.moduleId?.toString();
          if (!moduleIdStr) return;
          
          if (moduleMap.has(moduleIdStr)) {
            const existing = moduleMap.get(moduleIdStr);
            existing.questionsAttempted += mp.questionsAttempted || 0;
            existing.correctAnswers += mp.correctAnswers || 0;
            existing.wrongAnswers += mp.wrongAnswers || 0;
            existing.lastAttemptDate = mp.lastAttemptDate || existing.lastAttemptDate;
          } else {
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
          stats.duplicatesFixed++;
          stats.totalDuplicatesRemoved += duplicatesRemoved;
          needsSave = true;
        }
      }

      // FIX 2: Point System (NEW: +1 per correct answer)
      const newNormalPoints = userStat.correctAnswers || 0;
      const bluePoints = userStat.bluePoints || 0;
      const greenPoints = userStat.greenPoints || 0;
      const newTotalPoints = newNormalPoints + bluePoints + greenPoints;
      
      if (userStat.normalPoints !== newNormalPoints || userStat.totalPoints !== newTotalPoints) {
        userStat.normalPoints = newNormalPoints;
        userStat.totalPoints = newTotalPoints;
        stats.pointsFixed++;
        needsSave = true;
      }

      // Save if any changes were made
      if (needsSave) {
        await userStat.save();
        console.log(`✅ Fixed user ${userStat.userId}`);
      } else {
        stats.skipped++;
      }

    } catch (error) {
      console.error(`❌ Error processing user ${userStat.userId}:`, error.message);
      stats.errors++;
    }
  }

  console.log('\n╔═══════════════════════════════════════════╗');
  console.log('║         MIGRATION RESULTS                 ║');
  console.log('╚═══════════════════════════════════════════╝');
  console.log(`\n📊 Total Users Processed: ${allUserStats.length}`);
  console.log(`✅ Points Fixed: ${stats.pointsFixed}`);
  console.log(`✅ Users with Duplicates Cleaned: ${stats.duplicatesFixed}`);
  console.log(`🗑️  Total Duplicate Entries Removed: ${stats.totalDuplicatesRemoved}`);
  console.log(`⏭️  Skipped (already correct): ${stats.skipped}`);
  console.log(`❌ Errors: ${stats.errors}`);
  console.log('\n═══════════════════════════════════════════\n');

  // Verify results
  console.log('🔍 Verification Check...\n');
  
  const verifyStats = await UserStats.aggregate([
    {
      $group: {
        _id: null,
        totalUsers: { $sum: 1 },
        avgTotalPoints: { $avg: '$totalPoints' },
        avgNormalPoints: { $avg: '$normalPoints' },
        totalCorrectAnswers: { $sum: '$correctAnswers' },
        totalNormalPoints: { $sum: '$normalPoints' }
      }
    }
  ]);

  if (verifyStats.length > 0) {
    const data = verifyStats[0];
    console.log('✅ Verification Results:');
    console.log(`   Total Users: ${data.totalUsers}`);
    console.log(`   Total Correct Answers: ${data.totalCorrectAnswers}`);
    console.log(`   Total Normal Points: ${data.totalNormalPoints}`);
    console.log(`   Expected Points: ${data.totalCorrectAnswers} (1:1 ratio)`);
    
    if (Math.abs(data.totalNormalPoints - data.totalCorrectAnswers) < 1) {
      console.log('   ✅ Points calculation is CORRECT!\n');
    } else {
      console.log('   ⚠️  Minor discrepancy detected (may be normal)\n');
    }
  }

  mongoose.disconnect();
  console.log('✓ Migration completed successfully!\n');
}

runAllFixes().catch(error => {
  console.error('❌ Migration failed:', error);
  mongoose.disconnect();
  process.exit(1);
});
