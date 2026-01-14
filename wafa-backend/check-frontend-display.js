// Quick check - what does the frontend receive
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

async function checkFrontendData() {
    const mongoUrl = process.env.MONGO_URL;
    await mongoose.connect(mongoUrl);

    const User = (await import("./models/userModel.js")).default;
    const UserStats = (await import("./models/userStatsModel.js")).default;

    const user = await User.findOne({ email: "mohammedjanati.work@gmail.com" });
    const userStats = await UserStats.findOne({ userId: user._id });

    console.log('What Backend Returns (from userController.js):');
    console.log('===============================================\n');
    
    const stats = {
        examsCompleted: userStats.totalExams || userStats.totalExamsCompleted || 0,
        averageScore: userStats.averageScore || 0,
        studyHours: Math.round((userStats.totalTimeSpent || 0) / 3600),
        rank: userStats.rank || 0,
        totalQuestionsAttempted: userStats.totalQuestionsAttempted || 0,
        totalCorrectAnswers: userStats.totalCorrectAnswers || 0,
        totalIncorrectAnswers: userStats.totalIncorrectAnswers || 0
    };

    console.log('Stats Object:');
    console.log(JSON.stringify(stats, null, 2));
    console.log('\nWhat Frontend Displays:');
    console.log('  Examens complétés:', stats.examsCompleted, '(should this be totalQuestionsAttempted?)');
    console.log('  Score moyen:', stats.averageScore + '%');
    console.log('  Heures d\'étude:', stats.studyHours);
    console.log('  Classement: #' + stats.rank);

    console.log('\n\nAlternative Display (using questions):');
    console.log('  Questions répondues:', stats.totalQuestionsAttempted);
    console.log('  Taux de réussite:', stats.totalQuestionsAttempted > 0 ? 
        Math.round((stats.totalCorrectAnswers / stats.totalQuestionsAttempted) * 100) + '%' : '0%');
    console.log('  Heures d\'étude:', stats.studyHours);
    console.log('  Classement: #' + stats.rank);

    await mongoose.connection.close();
}

checkFrontendData();
