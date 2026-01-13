/**
 * Add Test Data to Test User
 * Populates the test user with statistics to verify calculations
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const addTestData = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URL);
        console.log('✓ Connected to MongoDB');

        // Import models
        const User = (await import('./models/userModel.js')).default;
        const UserStats = (await import('./models/userStatsModel.js')).default;

        // Find test user
        const testUser = await User.findOne({ email: 'test@wafa.ma' });
        if (!testUser) {
            console.error('❌ Test user not found. Run create-test-users.js first.');
            process.exit(1);
        }

        console.log(`\n📝 Adding test data for user: ${testUser.name} (${testUser.email})`);

        // Create or update user stats
        let userStats = await UserStats.findOne({ userId: testUser._id });
        
        const testData = {
            userId: testUser._id,
            // Points data
            normalPoints: 45,           // From 45 correct answers
            greenPoints: 3,             // 3 approved reports (×30 = 90 pts)
            bluePoints: 2,              // 2 approved explanations (×40 = 80 pts)
            totalPoints: 215,           // 45 + 90 + 80 = 215 pts
            
            // Questions data
            questionsAnswered: 100,
            correctAnswers: 45,
            totalQuestionsAttempted: 100,
            totalCorrectAnswers: 45,
            totalIncorrectAnswers: 55,
            percentageAnswered: 15.5,   // Assuming 645 total questions in system
            
            // Exam data
            totalExams: 5,
            totalExamsCompleted: 5,
            averageScore: 9.5,          // Average score out of 20
            totalScore: 47.5,           // Sum of all exam scores
            studyHours: 12,
            totalTimeSpent: 43200,      // 12 hours in seconds
            
            // Ranking
            rank: 42,
            
            // Achievements
            achievements: [
                {
                    achievementId: 'first_exam',
                    achievementName: 'Premier Examen',
                    description: 'Complété votre premier examen',
                    earnedAt: new Date('2025-01-10')
                },
                {
                    achievementId: 'five_exams',
                    achievementName: 'Étudiant Assidu',
                    description: 'Complété 5 examens',
                    earnedAt: new Date('2025-01-12')
                }
            ],
            
            // Module progress
            moduleProgress: [
                {
                    moduleId: new mongoose.Types.ObjectId(),
                    moduleName: 'Anatomie Générale',
                    questionsAttempted: 30,
                    correctAnswers: 22,
                    incorrectAnswers: 8,
                    timeSpent: 3600,
                    lastAttempted: new Date('2025-01-12')
                },
                {
                    moduleId: new mongoose.Types.ObjectId(),
                    moduleName: 'Physiologie Cardiaque',
                    questionsAttempted: 45,
                    correctAnswers: 18,
                    incorrectAnswers: 27,
                    timeSpent: 5400,
                    lastAttempted: new Date('2025-01-11')
                },
                {
                    moduleId: new mongoose.Types.ObjectId(),
                    moduleName: 'Biochimie Métabolique',
                    questionsAttempted: 25,
                    correctAnswers: 5,
                    incorrectAnswers: 20,
                    timeSpent: 2700,
                    lastAttempted: new Date('2025-01-10')
                }
            ],
            
            // Answered questions map
            answeredQuestions: new Map()
        };

        // Add some answered questions
        for (let i = 1; i <= 100; i++) {
            testData.answeredQuestions.set(`question_${i}`, {
                selectedAnswers: [Math.floor(Math.random() * 4)],
                isVerified: true,
                isCorrect: i <= 45, // First 45 are correct
                answeredAt: new Date(`2025-01-${10 + Math.floor(i / 20)}`),
                examId: new mongoose.Types.ObjectId(),
                moduleId: new mongoose.Types.ObjectId()
            });
        }

        if (userStats) {
            // Update existing stats
            Object.assign(userStats, testData);
            await userStats.save();
            console.log('✅ Updated existing user stats with test data');
        } else {
            // Create new stats
            userStats = await UserStats.create(testData);
            console.log('✅ Created new user stats with test data');
        }

        // Display added data
        console.log('\n📊 Test Data Added:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('Points:');
        console.log(`  Normal Points:  ${testData.normalPoints}`);
        console.log(`  Green Points:   ${testData.greenPoints} (×30 = ${testData.greenPoints * 30} pts)`);
        console.log(`  Blue Points:    ${testData.bluePoints} (×40 = ${testData.bluePoints * 40} pts)`);
        console.log(`  Total Points:   ${testData.totalPoints}`);
        console.log(`  Level:          ${Math.floor(testData.totalPoints / 50)} (${testData.totalPoints % 50}/50 XP)`);
        console.log('\nQuestions:');
        console.log(`  Answered:       ${testData.questionsAnswered}`);
        console.log(`  Correct:        ${testData.correctAnswers}`);
        console.log(`  Success Rate:   ${Math.round((testData.correctAnswers / testData.questionsAnswered) * 100)}%`);
        console.log(`  Progress:       ${testData.percentageAnswered.toFixed(1)}%`);
        console.log('\nExams:');
        console.log(`  Completed:      ${testData.totalExamsCompleted}`);
        console.log(`  Average Score:  ${testData.averageScore}/20`);
        console.log(`  Study Hours:    ${testData.studyHours}h`);
        console.log(`  Rank:           #${testData.rank}`);
        console.log('\nAchievements:');
        testData.achievements.forEach((ach, i) => {
            console.log(`  ${i + 1}. ${ach.achievementName}`);
        });
        console.log('\nModule Progress:');
        testData.moduleProgress.forEach((mod, i) => {
            const score = Math.round((mod.correctAnswers / mod.questionsAttempted) * 100);
            console.log(`  ${i + 1}. ${mod.moduleName}: ${mod.questionsAttempted} questions, ${score}% success`);
        });
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        console.log('\n✅ Test data successfully added!');
        console.log('💡 Run "node test-profile-stats.js" to verify calculations\n');

        await mongoose.connection.close();
        console.log('✓ Disconnected from MongoDB');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error adding test data:', error);
        process.exit(1);
    }
};

addTestData();
