import mongoose from "mongoose";
import dotenv from "dotenv";
import UserStats from "./models/userStatsModel.js";
import Module from "./models/moduleModel.js";

dotenv.config();

const fixModuleProgressIncorrect = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log("✅ Connected to MongoDB\n");

        const allUserStats = await UserStats.find({});
        console.log(`📊 Found ${allUserStats.length} UserStats documents\n`);

        let fixed = 0;

        for (const userStats of allUserStats) {
            console.log(`\n🔧 Processing user: ${userStats.userId}`);
            
            // Get all answered questions
            const answeredQuestions = userStats.answeredQuestions || new Map();
            console.log(`   • Total answered questions: ${answeredQuestions.size}`);
            
            if (answeredQuestions.size === 0) {
                console.log("   ⏭️  No answered questions, skipping");
                continue;
            }

            // Create a map of moduleId -> stats
            const moduleStats = new Map();
            
            // First pass: collect stats
            for (const [questionId, answer] of answeredQuestions.entries()) {
                // Only count verified answers
                if (!answer.isVerified) continue;
                
                const moduleId = answer.moduleId ? answer.moduleId.toString() : "no-module";
                
                if (!moduleStats.has(moduleId)) {
                    moduleStats.set(moduleId, {
                        questionsAttempted: 0,
                        correctAnswers: 0,
                        incorrectAnswers: 0,
                        moduleName: answer.moduleName || null
                    });
                }
                
                const stats = moduleStats.get(moduleId);
                
                stats.questionsAttempted++;
                if (answer.isCorrect) {
                    stats.correctAnswers++;
                } else {
                    stats.incorrectAnswers++;
                }
            }
            
            // Second pass: Fetch module names for entries that don't have them
            for (const [moduleId, stats] of moduleStats.entries()) {
                if (!stats.moduleName && moduleId !== "no-module") {
                    try {
                        const module = await Module.findById(moduleId).select("name");
                        stats.moduleName = module?.name || "Unknown";
                    } catch (error) {
                        stats.moduleName = "Unknown";
                    }
                }
            }

            console.log(`   • Unique modules: ${moduleStats.size}`);
            
            // Rebuild moduleProgress from scratch
            const newModuleProgress = [];
            moduleStats.forEach((stats, moduleId) => {
                // Skip entries without valid moduleId
                if (moduleId === "no-module" || !moduleId) {
                    console.log(`      ⚠️  Skipping entry without moduleId (${stats.questionsAttempted} questions)`);
                    return;
                }
                
                newModuleProgress.push({
                    moduleId: new mongoose.Types.ObjectId(moduleId),
                    moduleName: stats.moduleName,
                    questionsAttempted: stats.questionsAttempted,
                    correctAnswers: stats.correctAnswers,
                    incorrectAnswers: stats.incorrectAnswers,
                    timeSpent: 0,
                    lastAttempted: new Date()
                });
                
                console.log(`      - ${stats.moduleName}: ${stats.questionsAttempted} attempted, ${stats.correctAnswers} correct, ${stats.incorrectAnswers} incorrect`);
            });

            // Recalculate overall stats
            let totalQuestionsAttempted = 0;
            let totalCorrectAnswers = 0;
            let totalIncorrectAnswers = 0;
            
            answeredQuestions.forEach((answer) => {
                if (answer.isVerified) {
                    totalQuestionsAttempted++;
                    if (answer.isCorrect) {
                        totalCorrectAnswers++;
                    } else {
                        totalIncorrectAnswers++;
                    }
                }
            });

            const averageScore = totalQuestionsAttempted > 0 
                ? (totalCorrectAnswers / totalQuestionsAttempted) * 100 
                : 0;

            console.log(`   • Overall: ${totalQuestionsAttempted} attempted, ${totalCorrectAnswers} correct, ${totalIncorrectAnswers} incorrect`);

            // Update the document
            userStats.moduleProgress = newModuleProgress;
            userStats.totalQuestionsAttempted = totalQuestionsAttempted;
            userStats.totalCorrectAnswers = totalCorrectAnswers;
            userStats.totalIncorrectAnswers = totalIncorrectAnswers;
            userStats.averageScore = averageScore;
            userStats.questionsAnswered = totalQuestionsAttempted;
            userStats.correctAnswers = totalCorrectAnswers;
            
            await userStats.save();
            fixed++;
            console.log(`   ✅ Fixed!`);
        }

        console.log(`\n✅ Fixed ${fixed} UserStats documents`);

    } catch (error) {
        console.error("❌ Error:", error.message);
        console.error(error.stack);
    } finally {
        await mongoose.connection.close();
        console.log("\n🔌 Disconnected from MongoDB");
    }
};

fixModuleProgressIncorrect();
