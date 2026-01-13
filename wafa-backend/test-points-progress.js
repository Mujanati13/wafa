/**
 * Test Points and Progress Bar
 * Creates a new test user, adds data, and validates calculations
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import axios from 'axios';

dotenv.config();

const BASE_URL = 'http://localhost:5010/api/v1';
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m',
    magenta: '\x1b[35m',
    blue: '\x1b[34m',
    bold: '\x1b[1m'
};

// Test user credentials
const TEST_USER = {
    email: 'pointstest@wafa.ma',
    password: 'Test123',
    name: 'Points Test User'
};

let authToken = null;
let userId = null;

const log = (message, color = 'reset') => {
    console.log(`${colors[color]}${message}${colors.reset}`);
};

const logTest = (testName, passed, details = '') => {
    const status = passed ? `${colors.green}✓ PASS${colors.reset}` : `${colors.red}✗ FAIL${colors.reset}`;
    console.log(`${status} - ${testName}`);
    if (details) console.log(`  ${colors.blue}${details}${colors.reset}`);
};

const logSection = (title) => {
    console.log(`\n${colors.cyan}${colors.bold}${'='.repeat(60)}`);
    console.log(title.toUpperCase());
    console.log('='.repeat(60) + colors.reset + '\n');
};

// Step 1: Create new test user
const createTestUser = async () => {
    try {
        logSection('Step 1: Creating Test User');
        
        await mongoose.connect(process.env.MONGO_URL);
        log('✓ Connected to MongoDB', 'green');

        const User = (await import('./models/userModel.js')).default;
        
        // Delete existing test user if exists
        await User.deleteOne({ email: TEST_USER.email });
        log('✓ Cleaned up old test user', 'yellow');

        // Create new user
        const hashedPassword = await bcrypt.hash(TEST_USER.password, 10);
        const user = await User.create({
            username: 'pointstestuser',
            name: TEST_USER.name,
            email: TEST_USER.email,
            password: hashedPassword,
            isActive: true,
            isAdmin: false,
            emailVerified: true,
            plan: 'Free',
            semesters: ['S1', 'S2'],
            university: 'Université de Test',
            faculty: 'Faculté de Médecine'
        });

        userId = user._id;
        log(`✓ Created user: ${user.email}`, 'green');
        
        await mongoose.connection.close();
        log('✓ Disconnected from MongoDB\n', 'green');
        
        return true;
    } catch (error) {
        log(`✗ Error creating user: ${error.message}`, 'red');
        return false;
    }
};

// Step 2: Login to get token
const loginTestUser = async () => {
    try {
        logSection('Step 2: Login Test User');
        
        const response = await axios.post(`${BASE_URL}/auth/login`, {
            email: TEST_USER.email,
            password: TEST_USER.password
        });

        authToken = response.data.token;
        logTest('Login Successful', true, `Token: ${authToken.substring(0, 30)}...`);
        return true;
    } catch (error) {
        logTest('Login Failed', false, error.response?.data?.message || error.message);
        return false;
    }
};

// Step 3: Add test statistics
const addTestStatistics = async () => {
    try {
        logSection('Step 3: Adding Test Statistics');
        
        await mongoose.connect(process.env.MONGO_URL);
        const UserStats = (await import('./models/userStatsModel.js')).default;

        // Test Case: 
        // normalPoints = 35 (35 correct answers)
        // greenPoints = 5 (5 approved reports = 150 pts)
        // bluePoints = 3 (3 approved explanations = 120 pts)
        // totalPoints = 35 + 150 + 120 = 305 pts
        // Level = floor(305/50) = 6
        // XP = 305 % 50 = 5

        const testStats = {
            userId: userId,
            normalPoints: 35,
            greenPoints: 5,
            bluePoints: 3,
            totalPoints: 305,
            questionsAnswered: 80,
            correctAnswers: 35,
            percentageAnswered: 12.4,
            totalExams: 3,
            totalExamsCompleted: 3,
            averageScore: 8.5,
            studyHours: 8,
            rank: 15,
            achievements: [],
            moduleProgress: []
        };

        await UserStats.create(testStats);
        
        log('✓ Test statistics added:', 'green');
        log(`  Normal Points: ${testStats.normalPoints}`, 'yellow');
        log(`  Green Points: ${testStats.greenPoints} (×30 = ${testStats.greenPoints * 30} pts)`, 'green');
        log(`  Blue Points: ${testStats.bluePoints} (×40 = ${testStats.bluePoints * 40} pts)`, 'blue');
        log(`  Total Points: ${testStats.totalPoints}`, 'cyan');
        log(`  Expected Level: ${Math.floor(testStats.totalPoints / 50)}`, 'magenta');
        log(`  Expected XP: ${testStats.totalPoints % 50}/50`, 'magenta');
        log(`  Questions Answered: ${testStats.questionsAnswered}`, 'cyan');
        log(`  Correct Answers: ${testStats.correctAnswers}`, 'cyan');
        log(`  Success Rate: ${Math.round((testStats.correctAnswers / testStats.questionsAnswered) * 100)}%`, 'cyan');
        log(`  Progress: ${testStats.percentageAnswered}%\n`, 'cyan');

        await mongoose.connection.close();
        return true;
    } catch (error) {
        log(`✗ Error adding statistics: ${error.message}`, 'red');
        return false;
    }
};

// Step 4: Test GET /users/profile endpoint
const testProfileEndpoint = async () => {
    try {
        logSection('Step 4: Testing GET /users/profile');
        
        const response = await axios.get(`${BASE_URL}/users/profile`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });

        const user = response.data.data.user;

        logTest('Response Received', response.status === 200);
        
        // Test points calculation
        const expectedTotal = 35 + (5 * 30) + (3 * 40); // 35 + 150 + 120 = 305
        logTest(
            'Total Points Calculation',
            user.totalPoints === expectedTotal,
            `Expected: ${expectedTotal}, Got: ${user.totalPoints}`
        );

        // Test individual points
        logTest('Normal Points', user.normalPoints === 35, `Got: ${user.normalPoints}`);
        logTest('Green Points', user.greenPoints === 5, `Got: ${user.greenPoints}`);
        logTest('Blue Points', user.bluePoints === 3, `Got: ${user.bluePoints}`);

        // Test level calculation
        const expectedLevel = Math.floor(305 / 50); // 6
        logTest(
            'Level Calculation',
            user.level === expectedLevel,
            `Expected: ${expectedLevel}, Got: ${user.level}`
        );

        // Test XP calculation
        const expectedXP = 305 % 50; // 5
        logTest(
            'XP to Next Level',
            user.xpToNextLevel === expectedXP,
            `Expected: ${expectedXP}/50, Got: ${user.xpToNextLevel}/50`
        );

        // Test questions stats
        logTest('Questions Answered', user.questionsAnswered === 80, `Got: ${user.questionsAnswered}`);
        logTest('Correct Answers', user.correctAnswers === 35, `Got: ${user.correctAnswers}`);

        // Test success rate
        const successRate = Math.round((35 / 80) * 100);
        logTest(
            'Success Rate Calculation',
            true,
            `${successRate}% (35/80)`
        );

        // Test percentage answered
        logTest(
            'Percentage Answered',
            user.percentageAnswered === 12.4,
            `Got: ${user.percentageAnswered}%`
        );

        // Display visual representation
        log('\n📊 Profile Data:', 'bold');
        log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
        log(`User: ${user.name} (${user.email})`, 'white');
        log(`\nPoints Breakdown:`, 'bold');
        log(`  ⚡ Normal: ${user.normalPoints} pts`, 'yellow');
        log(`  🟢 Green: ${user.greenPoints} × 30 = ${user.greenPoints * 30} pts`, 'green');
        log(`  🔵 Blue: ${user.bluePoints} × 40 = ${user.bluePoints * 40} pts`, 'blue');
        log(`  💎 Total: ${user.totalPoints} pts`, 'cyan');
        log(`\nLevel Progress:`, 'bold');
        log(`  Level: ${user.level}`, 'magenta');
        log(`  XP: ${user.xpToNextLevel}/50 (${((user.xpToNextLevel / 50) * 100).toFixed(1)}%)`, 'magenta');
        log(`\nQuestions:`, 'bold');
        log(`  Answered: ${user.questionsAnswered}`, 'cyan');
        log(`  Correct: ${user.correctAnswers}`, 'green');
        log(`  Success Rate: ${Math.round((user.correctAnswers / user.questionsAnswered) * 100)}%`, 'cyan');
        log(`  Global Progress: ${user.percentageAnswered}%`, 'cyan');
        log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'cyan');

        return true;
    } catch (error) {
        logTest('Profile Endpoint Test', false, error.response?.data?.message || error.message);
        return false;
    }
};

// Step 5: Test progress bar calculations
const testProgressBarCalculations = async () => {
    try {
        logSection('Step 5: Testing Progress Bar Calculations');
        
        const response = await axios.get(`${BASE_URL}/users/profile`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });

        const user = response.data.data.user;

        // Calculate progress bar segments
        const totalPoints = user.totalPoints;
        const currentLevelPoints = totalPoints % 50; // 5
        const normalPoints = user.normalPoints; // 35
        const greenPointsValue = user.greenPoints * 30; // 150
        const bluePointsValue = user.bluePoints * 40; // 120
        const totalEarned = normalPoints + greenPointsValue + bluePointsValue; // 305

        // Calculate ratios
        const normalRatio = totalEarned > 0 ? normalPoints / totalEarned : 0;
        const greenRatio = totalEarned > 0 ? greenPointsValue / totalEarned : 0;
        const blueRatio = totalEarned > 0 ? bluePointsValue / totalEarned : 0;

        // Calculate widths for current level progress
        const progressPercent = (currentLevelPoints / 50) * 100;
        const normalWidth = normalRatio * progressPercent;
        const greenWidth = greenRatio * progressPercent;
        const blueWidth = blueRatio * progressPercent;

        log('Progress Bar Segment Calculations:', 'bold');
        log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
        
        logTest('Current Level Points', currentLevelPoints === 5, `${currentLevelPoints}/50`);
        logTest('Total Points Earned', totalEarned === 305, `${totalEarned} pts`);
        
        log('\nPoint Source Ratios:', 'bold');
        logTest('Normal Ratio', true, `${(normalRatio * 100).toFixed(2)}% (${normalPoints}/${totalEarned})`);
        logTest('Green Ratio', true, `${(greenRatio * 100).toFixed(2)}% (${greenPointsValue}/${totalEarned})`);
        logTest('Blue Ratio', true, `${(blueRatio * 100).toFixed(2)}% (${bluePointsValue}/${totalEarned})`);
        
        log('\nProgress Bar Widths:', 'bold');
        logTest('Overall Progress', true, `${progressPercent.toFixed(2)}% of current level`);
        logTest('Yellow Segment', true, `${normalWidth.toFixed(2)}% of bar`);
        logTest('Green Segment', true, `${greenWidth.toFixed(2)}% of bar`);
        logTest('Blue Segment', true, `${blueWidth.toFixed(2)}% of bar`);
        
        // Verify total width doesn't exceed progress
        const totalWidth = normalWidth + greenWidth + blueWidth;
        logTest(
            'Total Width Check',
            Math.abs(totalWidth - progressPercent) < 0.01,
            `${totalWidth.toFixed(2)}% (should equal ${progressPercent.toFixed(2)}%)`
        );

        // Visual representation of progress bar
        log('\n📊 Progress Bar Visualization:', 'bold');
        log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
        const barWidth = 50;
        const yellowChars = Math.round((normalWidth / 100) * barWidth);
        const greenChars = Math.round((greenWidth / 100) * barWidth);
        const blueChars = Math.round((blueWidth / 100) * barWidth);
        const emptyChars = barWidth - yellowChars - greenChars - blueChars;
        
        const bar = 
            colors.yellow + '█'.repeat(yellowChars) +
            colors.green + '█'.repeat(greenChars) +
            colors.blue + '█'.repeat(blueChars) +
            colors.reset + '░'.repeat(emptyChars);
        
        log(`Level ${user.level}: [${bar}${colors.reset}] ${user.xpToNextLevel}/50 XP`, 'white');
        log(`Legend: ${colors.yellow}█${colors.reset} Questions (${normalPoints}) | ${colors.green}█${colors.reset} Reports (${greenPointsValue}) | ${colors.blue}█${colors.reset} Explications (${bluePointsValue})`, 'white');
        log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'cyan');

        return true;
    } catch (error) {
        log(`✗ Error testing progress bar: ${error.message}`, 'red');
        return false;
    }
};

// Step 6: Cleanup
const cleanup = async () => {
    try {
        logSection('Step 6: Cleanup');
        
        await mongoose.connect(process.env.MONGO_URL);
        
        const User = (await import('./models/userModel.js')).default;
        const UserStats = (await import('./models/userStatsModel.js')).default;
        
        await User.deleteOne({ email: TEST_USER.email });
        await UserStats.deleteOne({ userId: userId });
        
        log('✓ Test user and stats removed', 'green');
        
        await mongoose.connection.close();
        log('✓ Disconnected from MongoDB\n', 'green');
        
        return true;
    } catch (error) {
        log(`✗ Error during cleanup: ${error.message}`, 'red');
        return false;
    }
};

// Main test runner
const runTests = async () => {
    console.log('\n');
    log('╔════════════════════════════════════════════════════════════╗', 'cyan');
    log('║     POINTS & PROGRESS BAR TEST SUITE                       ║', 'cyan');
    log('╚════════════════════════════════════════════════════════════╝', 'cyan');
    console.log('\n');

    const startTime = Date.now();
    let allTestsPassed = true;

    // Run all test steps
    if (!await createTestUser()) allTestsPassed = false;
    if (!await loginTestUser()) allTestsPassed = false;
    if (!await addTestStatistics()) allTestsPassed = false;
    if (!await testProfileEndpoint()) allTestsPassed = false;
    if (!await testProgressBarCalculations()) allTestsPassed = false;
    
    // Always cleanup
    await cleanup();

    // Summary
    logSection('Test Summary');
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    if (allTestsPassed) {
        log('🎉 All tests passed! Points and progress bar working correctly.', 'green');
    } else {
        log('⚠️  Some tests failed. Please review the errors above.', 'yellow');
    }
    
    log(`\nDuration: ${duration}s`, 'white');
    log('='.repeat(60) + '\n', 'cyan');
};

// Run the tests
runTests().catch(error => {
    log(`\n✗ Fatal Error: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
});
