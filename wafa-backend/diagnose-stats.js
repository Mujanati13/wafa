// Complete diagnostic for statistics data flow
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const USER_EMAIL = "mohammedjanati.work@gmail.com";

async function fullDiagnostic() {
    try {
        const mongoUrl = process.env.MONGO_URL || process.env.MONGODB_URI;
        await mongoose.connect(mongoUrl);
        console.log('✓ Connected to MongoDB\n');

        const User = (await import("./models/userModel.js")).default;
        const UserStats = (await import("./models/userStatsModel.js")).default;

        // Get user
        const user = await User.findOne({ email: USER_EMAIL });
        if (!user) {
            console.log('✗ User not found');
            process.exit(1);
        }

        console.log('USER INFO:');
        console.log(`  ID: ${user._id}`);
        console.log(`  Email: ${user.email}`);
        console.log(`  Plan: ${user.plan}`);
        console.log('');

        // Get stats - RAW from database
        const stats = await UserStats.findOne({ userId: user._id }).lean();
        
        console.log('DATABASE DATA (RAW):');
        console.log('==================');
        console.log('Overall:');
        console.log(`  totalQuestionsAttempted: ${stats.totalQuestionsAttempted}`);
        console.log(`  totalCorrectAnswers: ${stats.totalCorrectAnswers}`);
        console.log(`  totalIncorrectAnswers: ${stats.totalIncorrectAnswers}`);
        console.log(`  averageScore: ${stats.averageScore}`);
        console.log('');

        console.log('weeklyActivity:');
        if (stats.weeklyActivity && stats.weeklyActivity.length > 0) {
            console.log(`  ✓ EXISTS: ${stats.weeklyActivity.length} entries`);
            console.log('  Sample (first 2):');
            stats.weeklyActivity.slice(0, 2).forEach(activity => {
                console.log(`    ${activity.date}: ${activity.questionsAttempted} questions, ${activity.correctAnswers} correct`);
            });
        } else {
            console.log('  ✗ MISSING or EMPTY');
        }
        console.log('');

        console.log('answeredQuestions (Map):');
        if (stats.answeredQuestions instanceof Map) {
            console.log(`  ✓ Is Map: ${stats.answeredQuestions.size} entries`);
        } else if (stats.answeredQuestions && typeof stats.answeredQuestions === 'object') {
            const keys = Object.keys(stats.answeredQuestions);
            console.log(`  ! Is Object: ${keys.length} entries`);
            if (keys.length > 0) {
                console.log(`  Sample key: ${keys[0]}`);
            }
        } else {
            console.log('  ✗ MISSING or wrong type');
        }
        console.log('');

        console.log('moduleProgress:');
        if (stats.moduleProgress && stats.moduleProgress.length > 0) {
            console.log(`  ✓ EXISTS: ${stats.moduleProgress.length} modules`);
            stats.moduleProgress.forEach(mp => {
                console.log(`    ${mp.moduleName}: ${mp.questionsAttempted} attempted`);
            });
        } else {
            console.log('  ✗ MISSING or EMPTY');
        }
        console.log('');

        console.log('WHAT BACKEND SHOULD RETURN:');
        console.log('===========================');
        
        // Simulate what backend returns (from userController.js)
        const answeredQuestionsObj = {};
        if (stats.answeredQuestions) {
            if (stats.answeredQuestions instanceof Map) {
                stats.answeredQuestions.forEach((value, key) => {
                    answeredQuestionsObj[key] = value;
                });
            } else if (typeof stats.answeredQuestions === 'object') {
                Object.assign(answeredQuestionsObj, stats.answeredQuestions);
            }
        }

        const backendResponse = {
            stats: {
                examsCompleted: stats.totalExams || stats.totalExamsCompleted || 0,
                averageScore: stats.averageScore || 0,
                studyHours: Math.round((stats.totalTimeSpent || 0) / 3600),
                totalQuestionsAttempted: stats.totalQuestionsAttempted || 0,
                totalCorrectAnswers: stats.totalCorrectAnswers || 0,
                totalIncorrectAnswers: stats.totalIncorrectAnswers || 0,
                moduleProgress: stats.moduleProgress || [],
                weeklyActivity: stats.weeklyActivity || []
            },
            answeredQuestions: answeredQuestionsObj
        };

        console.log('stats.weeklyActivity:');
        console.log(`  Length: ${backendResponse.stats.weeklyActivity.length}`);
        console.log(`  Type: ${Array.isArray(backendResponse.stats.weeklyActivity) ? 'Array' : 'other'}`);
        console.log('');

        console.log('stats.moduleProgress:');
        console.log(`  Length: ${backendResponse.stats.moduleProgress.length}`);
        console.log('');

        console.log('FRONTEND EXPECTATIONS:');
        console.log('======================');
        console.log('For charts to show data, frontend needs:');
        console.log('  1. stats.weeklyActivity as Array with length > 0');
        console.log(`     Current: ${backendResponse.stats.weeklyActivity.length > 0 ? '✓ OK' : '✗ FAIL'}`);
        console.log('  2. stats.moduleProgress as Array with length > 0');
        console.log(`     Current: ${backendResponse.stats.moduleProgress.length > 0 ? '✓ OK' : '✗ FAIL'}`);
        console.log('  3. stats.totalQuestionsAttempted > 0');
        console.log(`     Current: ${backendResponse.stats.totalQuestionsAttempted > 0 ? '✓ OK' : '✗ FAIL'}`);
        console.log('');

        console.log('DIAGNOSIS:');
        console.log('==========');
        
        if (backendResponse.stats.weeklyActivity.length === 0) {
            console.log('✗ PROBLEM: weeklyActivity is empty');
            console.log('  Solution: Run fix-weekly-activity.js script');
        } else if (backendResponse.stats.moduleProgress.length === 0) {
            console.log('✗ PROBLEM: moduleProgress is empty');
            console.log('  Solution: User needs to answer questions');
        } else if (backendResponse.stats.totalQuestionsAttempted === 0) {
            console.log('✗ PROBLEM: No questions attempted');
            console.log('  Solution: User needs to answer questions');
        } else {
            console.log('✓ ALL DATA LOOKS GOOD');
            console.log('  If frontend still shows empty:');
            console.log('  1. Check if backend server was restarted');
            console.log('  2. Clear browser cache');
            console.log('  3. Check browser console for errors');
            console.log('  4. Verify API endpoint: GET /api/users/my-stats');
        }

        await mongoose.connection.close();

    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

fullDiagnostic();
