// Direct database check for UserStats data
// Run with: node check-userStats-data.js

import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
};

function log(message, color = colors.reset) {
    console.log(`${color}${message}${colors.reset}`);
}

function logSection(title) {
    console.log('\n' + '='.repeat(60));
    log(title, colors.bright + colors.cyan);
    console.log('='.repeat(60));
}

// Connect to MongoDB
async function connectDB() {
    try {
        const mongoUrl = process.env.MONGO_URL || process.env.MONGODB_URI;
        if (!mongoUrl) {
            log('✗ No MongoDB connection string found in .env', colors.red);
            log('  Expected MONGO_URL or MONGODB_URI', colors.yellow);
            return false;
        }
        
        await mongoose.connect(mongoUrl, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        log('✓ Connected to MongoDB', colors.green);
        return true;
    } catch (error) {
        log('✗ Failed to connect to MongoDB', colors.red);
        console.error(error.message);
        return false;
    }
}

// Check UserStats collection
async function checkUserStats() {
    logSection('Checking UserStats Collection');

    try {
        const UserStats = (await import("./models/userStatsModel.js")).default;
        const User = (await import("./models/userModel.js")).default;

        // Count total UserStats documents
        const totalStats = await UserStats.countDocuments();
        log(`Total UserStats documents: ${totalStats}`, colors.blue);

        if (totalStats === 0) {
            log('⚠ WARNING: No UserStats documents found', colors.yellow);
            log('  Users need to answer questions to create stats', colors.yellow);
            return;
        }

        // Get a sample UserStats document
        const sampleStats = await UserStats.findOne().lean();
        if (!sampleStats) {
            log('⚠ No UserStats found', colors.yellow);
            return;
        }

        // Get user info
        const user = await User.findById(sampleStats.userId).select('firstName lastName email plan');

        logSection('Sample UserStats Document');
        log(`User: ${user?.firstName} ${user?.lastName} (${user?.email})`, colors.cyan);
        log(`Plan: ${user?.plan}`, colors.cyan);
        
        console.log('\nOverall Stats:');
        log(`  Total Questions Attempted: ${sampleStats.totalQuestionsAttempted || 0}`, colors.blue);
        log(`  Total Correct Answers: ${sampleStats.totalCorrectAnswers || 0}`, colors.green);
        log(`  Total Incorrect Answers: ${sampleStats.totalIncorrectAnswers || 0}`, colors.red);
        log(`  Average Score: ${sampleStats.averageScore || 0}%`, colors.cyan);
        log(`  Total Exams Completed: ${sampleStats.totalExamsCompleted || 0}`, colors.cyan);
        log(`  Total Time Spent: ${Math.round((sampleStats.totalTimeSpent || 0) / 3600)} hours`, colors.cyan);

        console.log('\nModule Progress:');
        if (sampleStats.moduleProgress && sampleStats.moduleProgress.length > 0) {
            log(`  ✓ ${sampleStats.moduleProgress.length} modules with progress`, colors.green);
            
            // Show first 3 modules
            sampleStats.moduleProgress.slice(0, 3).forEach((mp, index) => {
                console.log(`\n  Module ${index + 1}: ${mp.moduleName || 'Unknown'}`);
                log(`    Questions Attempted: ${mp.questionsAttempted || 0}`, colors.blue);
                log(`    Correct: ${mp.correctAnswers || 0}`, colors.green);
                log(`    Incorrect: ${mp.incorrectAnswers || 0}`, colors.red);
                log(`    Average: ${mp.averageScore || 0}%`, colors.cyan);
            });

            if (sampleStats.moduleProgress.length > 3) {
                log(`  ... and ${sampleStats.moduleProgress.length - 3} more modules`, colors.yellow);
            }
        } else {
            log('  ✗ No module progress data', colors.red);
            log('  This is why "Analyse de Performance" shows empty', colors.yellow);
        }

        console.log('\nWeekly Activity:');
        if (sampleStats.weeklyActivity && sampleStats.weeklyActivity.length > 0) {
            log(`  ✓ ${sampleStats.weeklyActivity.length} days of activity data`, colors.green);
            
            // Show last 3 days
            sampleStats.weeklyActivity.slice(-3).forEach((activity, index) => {
                const date = new Date(activity.date).toLocaleDateString();
                console.log(`\n  ${date}:`);
                log(`    Questions: ${activity.questionsAttempted || 0}`, colors.blue);
                log(`    Correct: ${activity.correctAnswers || 0}`, colors.green);
                log(`    Time: ${Math.round((activity.timeSpent || 0) / 60)} minutes`, colors.cyan);
            });
        } else {
            log('  ✗ No weekly activity data', colors.red);
            log('  This is why "Performance Trend" shows empty', colors.yellow);
        }

        console.log('\nAnswered Questions:');
        if (sampleStats.answeredQuestions && sampleStats.answeredQuestions.size > 0) {
            log(`  ✓ ${sampleStats.answeredQuestions.size} questions answered`, colors.green);
        } else {
            log('  ✗ No answered questions tracked', colors.red);
        }

        // Check for data issues
        logSection('Data Quality Check');
        
        const issues = [];
        
        if (sampleStats.totalQuestionsAttempted === 0) {
            issues.push('No questions attempted yet');
        }
        
        if (!sampleStats.moduleProgress || sampleStats.moduleProgress.length === 0) {
            issues.push('No module progress data (charts will be empty)');
        }
        
        if (!sampleStats.weeklyActivity || sampleStats.weeklyActivity.length === 0) {
            issues.push('No weekly activity data (performance trend will be empty)');
        }

        if (issues.length > 0) {
            log('⚠ Issues Found:', colors.yellow);
            issues.forEach(issue => log(`  • ${issue}`, colors.yellow));
            
            log('\n💡 Solutions:', colors.cyan);
            log('  1. User needs to answer questions to generate stats', colors.cyan);
            log('  2. Check if question answering logic updates UserStats', colors.cyan);
            log('  3. Verify weeklyActivity is being populated', colors.cyan);
        } else {
            log('✓ All data looks good!', colors.green);
        }

        // Find stats with most data
        logSection('Finding User with Most Activity');
        const mostActive = await UserStats.findOne()
            .sort({ totalQuestionsAttempted: -1 })
            .limit(1)
            .lean();

        if (mostActive) {
            const activeUser = await User.findById(mostActive.userId).select('firstName lastName email');
            log(`Most active user: ${activeUser?.firstName} ${activeUser?.lastName}`, colors.green);
            log(`  Questions attempted: ${mostActive.totalQuestionsAttempted || 0}`, colors.cyan);
            log(`  Modules with progress: ${mostActive.moduleProgress?.length || 0}`, colors.cyan);
            log(`  Weekly activity entries: ${mostActive.weeklyActivity?.length || 0}`, colors.cyan);
        }

    } catch (error) {
        log('✗ Error checking UserStats', colors.red);
        console.error(error);
    }
}

// Main execution
async function main() {
    log('\n' + '█'.repeat(60), colors.bright);
    log('  USER STATISTICS DATABASE CHECK', colors.bright + colors.cyan);
    log('  Verifying data for Statistics Page', colors.bright + colors.cyan);
    log('█'.repeat(60) + '\n', colors.bright);

    const connected = await connectDB();
    if (!connected) {
        process.exit(1);
    }

    await checkUserStats();

    logSection('Summary');
    log('Check complete. Review findings above.', colors.cyan);
    log('If data is missing, users need to answer questions.', colors.yellow);
    
    await mongoose.connection.close();
    log('\n✓ Database connection closed', colors.green);
}

main().catch(error => {
    console.error('Script failed:', error);
    process.exit(1);
});
