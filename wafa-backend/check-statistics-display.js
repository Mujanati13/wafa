import mongoose from "mongoose";
import dotenv from "dotenv";
import UserStats from "./models/userStatsModel.js";
import User from "./models/userModel.js";

dotenv.config();

const checkStatisticsDisplay = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log("✅ Connected to MongoDB\n");

        // Get all users with their stats
        const users = await User.find().select("_id email username");
        
        console.log("📊 STATISTICS DISPLAY VERIFICATION\n");
        console.log("=" .repeat(80));

        for (const user of users) {
            const userStats = await UserStats.findOne({ userId: user._id });
            
            if (!userStats) {
                console.log(`\n👤 User: ${user.email || user.username}`);
                console.log("   ❌ No UserStats found");
                continue;
            }

            console.log(`\n👤 User: ${user.email || user.username}`);
            console.log("   ID:", user._id.toString());
            
            // Overall stats
            console.log("\n   📈 Overall Stats (Backend sends):");
            console.log(`      • Total Questions Attempted: ${userStats.totalQuestionsAttempted || 0}`);
            console.log(`      • Total Correct Answers: ${userStats.totalCorrectAnswers || 0}`);
            console.log(`      • Total Incorrect Answers: ${userStats.totalIncorrectAnswers || 0}`);
            console.log(`      • Unverified: ${(userStats.totalQuestionsAttempted || 0) - (userStats.totalCorrectAnswers || 0) - (userStats.totalIncorrectAnswers || 0)}`);
            console.log(`      • Average Score: ${(userStats.averageScore || 0).toFixed(1)}%`);

            // Module progress
            if (userStats.moduleProgress && userStats.moduleProgress.length > 0) {
                console.log("\n   📚 Module Progress:");
                
                let totalQuestionsAttempted = 0;
                let totalCorrect = 0;
                let totalIncorrect = 0;
                
                userStats.moduleProgress.forEach(mp => {
                    totalQuestionsAttempted += mp.questionsAttempted || 0;
                    totalCorrect += mp.correctAnswers || 0;
                    totalIncorrect += mp.incorrectAnswers || 0;
                    
                    console.log(`      • ${mp.moduleName}:`);
                    console.log(`        - Attempted: ${mp.questionsAttempted || 0}`);
                    console.log(`        - Correct: ${mp.correctAnswers || 0}`);
                    console.log(`        - Incorrect: ${mp.incorrectAnswers || 0}`);
                    console.log(`        - Unverified: ${(mp.questionsAttempted || 0) - (mp.correctAnswers || 0) - (mp.incorrectAnswers || 0)}`);
                });

                console.log("\n   🎯 Frontend Display (Sums from modules):");
                console.log(`      • Total Questions: ${totalQuestionsAttempted}`);
                console.log(`      • Correctes: ${totalCorrect}`);
                console.log(`      • Incorrectes: ${totalIncorrect}`);
                console.log(`      • Taux Réussite: ${totalQuestionsAttempted > 0 ? Math.round((totalCorrect / totalQuestionsAttempted) * 100) : 0}%`);
                console.log(`      • Unverified Questions: ${totalQuestionsAttempted - totalCorrect - totalIncorrect}`);

                // Check for consistency
                if (totalQuestionsAttempted !== userStats.totalQuestionsAttempted) {
                    console.log("\n   ⚠️  WARNING: Module sum doesn't match overall totalQuestionsAttempted!");
                    console.log(`      Module sum: ${totalQuestionsAttempted}, Overall: ${userStats.totalQuestionsAttempted}`);
                }
            } else {
                console.log("\n   📚 No module progress data");
            }

            // Check answered questions map
            if (userStats.answeredQuestions && userStats.answeredQuestions.size > 0) {
                console.log(`\n   💾 Answered Questions Map: ${userStats.answeredQuestions.size} questions`);
                
                let verifiedCount = 0;
                let correctCount = 0;
                let incorrectCount = 0;
                
                userStats.answeredQuestions.forEach((answer, questionId) => {
                    if (answer.isVerified) {
                        verifiedCount++;
                        if (answer.isCorrect) correctCount++;
                        else incorrectCount++;
                    }
                });
                
                console.log(`      • Verified: ${verifiedCount}`);
                console.log(`      • Correct (from map): ${correctCount}`);
                console.log(`      • Incorrect (from map): ${incorrectCount}`);
                console.log(`      • Unverified: ${userStats.answeredQuestions.size - verifiedCount}`);
            }

            console.log("\n" + "-".repeat(80));
        }

        console.log("\n✅ Verification complete!");

    } catch (error) {
        console.error("❌ Error:", error.message);
        console.error(error.stack);
    } finally {
        await mongoose.connection.close();
        console.log("\n🔌 Disconnected from MongoDB");
    }
};

checkStatisticsDisplay();
