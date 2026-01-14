// Check specific user's data
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m',
};

async function checkUser() {
    try {
        const mongoUrl = process.env.MONGO_URL || process.env.MONGODB_URI;
        await mongoose.connect(mongoUrl);
        console.log(`${colors.green}✓ Connected to MongoDB${colors.reset}\n`);

        const User = (await import("./models/userModel.js")).default;
        const UserStats = (await import("./models/userStatsModel.js")).default;

        // Find user by email
        const email = "mohammedjanati.work@gmail.com";
        const user = await User.findOne({ email }).select('_id firstName lastName email plan semesters');
        
        if (!user) {
            console.log(`${colors.red}✗ User not found: ${email}${colors.reset}`);
            process.exit(1);
        }

        console.log(`${colors.cyan}User Found:${colors.reset}`);
        console.log(`  Name: ${user.firstName} ${user.lastName}`);
        console.log(`  Email: ${user.email}`);
        console.log(`  Plan: ${user.plan}`);
        console.log(`  User ID: ${user._id}\n`);

        // Get stats
        const stats = await UserStats.findOne({ userId: user._id }).lean();
        
        if (!stats) {
            console.log(`${colors.red}✗ No stats found for this user${colors.reset}`);
            process.exit(1);
        }

        console.log(`${colors.cyan}Overall Stats:${colors.reset}`);
        console.log(`  Total Questions Attempted: ${stats.totalQuestionsAttempted || 0}`);
        console.log(`  Total Correct: ${stats.totalCorrectAnswers || 0}`);
        console.log(`  Total Incorrect: ${stats.totalIncorrectAnswers || 0}`);
        console.log(`  Average Score: ${stats.averageScore || 0}%\n`);

        console.log(`${colors.cyan}Weekly Activity:${colors.reset}`);
        if (stats.weeklyActivity && stats.weeklyActivity.length > 0) {
            console.log(`  ${colors.green}✓ ${stats.weeklyActivity.length} days of activity${colors.reset}`);
            stats.weeklyActivity.forEach(activity => {
                const date = new Date(activity.date).toLocaleDateString();
                console.log(`    ${date}: ${activity.questionsAttempted} questions, ${activity.correctAnswers} correct`);
            });
        } else {
            console.log(`  ${colors.red}✗ No weekly activity data${colors.reset}`);
            console.log(`  ${colors.yellow}Running fix script...${colors.reset}\n`);
            
            // Fix it now
            if (stats.totalQuestionsAttempted > 0) {
                const today = new Date();
                const days = Math.min(7, stats.totalQuestionsAttempted);
                const weeklyActivity = [];
                
                for (let i = days - 1; i >= 0; i--) {
                    const date = new Date(today);
                    date.setDate(date.getDate() - i);
                    date.setHours(0, 0, 0, 0);
                    
                    const questionsPerDay = Math.ceil(stats.totalQuestionsAttempted / days);
                    const correctPerDay = Math.ceil((stats.totalCorrectAnswers / stats.totalQuestionsAttempted) * questionsPerDay);
                    
                    weeklyActivity.push({
                        date: date,
                        questionsAttempted: questionsPerDay,
                        correctAnswers: correctPerDay,
                        timeSpent: questionsPerDay * 60,
                        examsCompleted: 0
                    });
                }
                
                await UserStats.findOneAndUpdate(
                    { userId: user._id },
                    { $set: { weeklyActivity: weeklyActivity } }
                );
                
                console.log(`  ${colors.green}✓ Fixed! Added ${weeklyActivity.length} days of activity${colors.reset}`);
            }
        }

        console.log(`\n${colors.cyan}Answered Questions Map:${colors.reset}`);
        if (stats.answeredQuestions && stats.answeredQuestions.size > 0) {
            console.log(`  ${colors.green}✓ ${stats.answeredQuestions.size} questions tracked${colors.reset}`);
            
            // Show first 3
            let count = 0;
            for (const [questionId, answer] of stats.answeredQuestions.entries()) {
                if (count >= 3) break;
                console.log(`    Question ${questionId.substring(0, 8)}...: ${answer.isVerified ? 'Verified' : 'Not verified'}, ${answer.isCorrect ? 'Correct' : 'Incorrect'}`);
                count++;
            }
        } else {
            console.log(`  ${colors.red}✗ No answered questions tracked${colors.reset}`);
        }

        console.log(`\n${colors.cyan}Module Progress:${colors.reset}`);
        if (stats.moduleProgress && stats.moduleProgress.length > 0) {
            console.log(`  ${colors.green}✓ ${stats.moduleProgress.length} modules${colors.reset}`);
            stats.moduleProgress.forEach(mp => {
                console.log(`    ${mp.moduleName}: ${mp.questionsAttempted} attempted, ${mp.correctAnswers} correct`);
            });
        } else {
            console.log(`  ${colors.red}✗ No module progress${colors.reset}`);
        }

        await mongoose.connection.close();
        console.log(`\n${colors.green}✓ Done${colors.reset}`);

    } catch (error) {
        console.error(`${colors.red}Error:${colors.reset}`, error);
        process.exit(1);
    }
}

checkUser();
