// Script to populate weeklyActivity for existing UserStats
// This will help fix empty charts for users with existing data

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

// Connect to MongoDB
async function connectDB() {
    try {
        const mongoUrl = process.env.MONGO_URL || process.env.MONGODB_URI;
        if (!mongoUrl) {
            log('✗ No MongoDB connection string found', colors.red);
            return false;
        }
        
        await mongoose.connect(mongoUrl);
        log('✓ Connected to MongoDB', colors.green);
        return true;
    } catch (error) {
        log('✗ Failed to connect to MongoDB', colors.red);
        console.error(error.message);
        return false;
    }
}

// Generate weekly activity based on existing data
function generateWeeklyActivity(stats) {
    const weeklyActivity = [];
    const totalQuestions = stats.totalQuestionsAttempted || 0;
    const totalCorrect = stats.totalCorrectAnswers || 0;
    
    if (totalQuestions === 0) {
        return weeklyActivity;
    }
    
    // Generate activity for last 7 days
    const today = new Date();
    const daysToGenerate = Math.min(7, totalQuestions); // Don't create more days than questions
    
    for (let i = daysToGenerate - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        
        // Distribute questions across days
        const questionsForDay = Math.ceil(totalQuestions / daysToGenerate);
        const correctForDay = Math.ceil((totalCorrect / totalQuestions) * questionsForDay);
        
        weeklyActivity.push({
            date: date,
            questionsAttempted: questionsForDay,
            correctAnswers: correctForDay,
            timeSpent: questionsForDay * 60, // Assume 1 minute per question
            examsCompleted: 0
        });
    }
    
    return weeklyActivity;
}

// Fix all UserStats documents
async function fixWeeklyActivity() {
    try {
        const UserStats = (await import("./models/userStatsModel.js")).default;
        
        // Find all UserStats with missing or empty weeklyActivity
        const statsToFix = await UserStats.find({
            $or: [
                { weeklyActivity: { $exists: false } },
                { weeklyActivity: { $size: 0 } },
                { weeklyActivity: null }
            ],
            totalQuestionsAttempted: { $gt: 0 } // Only fix if user has answered questions
        });
        
        log(`\nFound ${statsToFix.length} UserStats documents to fix`, colors.cyan);
        
        if (statsToFix.length === 0) {
            log('No documents need fixing', colors.green);
            return;
        }
        
        let fixed = 0;
        
        for (const stats of statsToFix) {
            try {
                const weeklyActivity = generateWeeklyActivity(stats);
                
                if (weeklyActivity.length > 0) {
                    stats.weeklyActivity = weeklyActivity;
                    await stats.save();
                    fixed++;
                    
                    log(`✓ Fixed userId ${stats.userId} - Added ${weeklyActivity.length} days of activity`, colors.green);
                }
            } catch (error) {
                log(`✗ Failed to fix userId ${stats.userId}: ${error.message}`, colors.red);
            }
        }
        
        log(`\n✓ Successfully fixed ${fixed}/${statsToFix.length} documents`, colors.green);
        
    } catch (error) {
        log('✗ Error fixing weeklyActivity', colors.red);
        console.error(error);
    }
}

// Verify the fix
async function verifyFix() {
    try {
        const UserStats = (await import("./models/userStatsModel.js")).default;
        
        const total = await UserStats.countDocuments();
        const withActivity = await UserStats.countDocuments({
            weeklyActivity: { $exists: true, $ne: [], $ne: null }
        });
        const withQuestionsButNoActivity = await UserStats.countDocuments({
            totalQuestionsAttempted: { $gt: 0 },
            $or: [
                { weeklyActivity: { $size: 0 } },
                { weeklyActivity: null },
                { weeklyActivity: { $exists: false } }
            ]
        });
        
        log('\n' + '='.repeat(60), colors.bright);
        log('Verification Results:', colors.cyan);
        log('='.repeat(60), colors.bright);
        log(`Total UserStats: ${total}`, colors.blue);
        log(`With weeklyActivity: ${withActivity}`, colors.green);
        log(`With questions but no activity: ${withQuestionsButNoActivity}`, colors.yellow);
        
        if (withQuestionsButNoActivity === 0) {
            log('\n✓ All UserStats documents have weeklyActivity!', colors.green);
        } else {
            log(`\n⚠ Still ${withQuestionsButNoActivity} documents without activity`, colors.yellow);
        }
        
    } catch (error) {
        log('✗ Error verifying fix', colors.red);
        console.error(error);
    }
}

// Main execution
async function main() {
    log('\n' + '█'.repeat(60), colors.bright);
    log('  FIX WEEKLY ACTIVITY DATA', colors.bright + colors.cyan);
    log('  Populating weeklyActivity for existing UserStats', colors.bright + colors.cyan);
    log('█'.repeat(60) + '\n', colors.bright);

    const connected = await connectDB();
    if (!connected) {
        process.exit(1);
    }

    await fixWeeklyActivity();
    await verifyFix();

    await mongoose.connection.close();
    log('\n✓ Database connection closed', colors.green);
    log('\nℹ  From now on, weeklyActivity will be updated automatically when users answer questions', colors.cyan);
}

main().catch(error => {
    console.error('Script failed:', error);
    process.exit(1);
});
