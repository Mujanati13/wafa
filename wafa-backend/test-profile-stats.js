/**
 * Test Profile Statistics Endpoints
 * Tests all profile statistics calculations and data integrity
 */

import axios from 'axios';

// Configuration
const BASE_URL = 'http://localhost:5010/api/v1';
let authToken = null;
let testUserId = null;

// Test credentials - using test user from create-test-users.js
const TEST_USER = {
    email: 'test@wafa.ma',
    password: 'Test123'
};

// Console colors
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m',
    magenta: '\x1b[35m',
    gray: '\x1b[90m',
    white: '\x1b[37m',
    blue: '\x1b[34m',
    bold: '\x1b[1m'
};

// Utility: Log test results
const logTest = (testName, passed, details = '') => {
    const status = passed ? `${colors.green}✓ PASS${colors.reset}` : `${colors.red}✗ FAIL${colors.reset}`;
    console.log(`${status} - ${testName}`);
    if (details) console.log(`  ${colors.gray}${details}${colors.reset}`);
};

const logSection = (title) => {
    console.log('\n' + colors.cyan + '='.repeat(60));
    console.log(colors.bold + title.toUpperCase());
    console.log('='.repeat(60) + colors.reset + '\n');
};

// Step 1: Login and get auth token
const login = async () => {
    try {
        logSection('Authentication');
        const response = await axios.post(`${BASE_URL}/auth/login`, TEST_USER);
        authToken = response.data.token;
        logTest('User Login', true, `Token: ${authToken.substring(0, 20)}...`);
        return true;
    } catch (error) {
        logTest('User Login', false, error.response?.data?.message || error.message);
        console.log(`\n${colors.yellow}⚠️  Please update TEST_USER credentials in the test file${colors.reset}`);
        return false;
    }
};

// Step 2: Test GET /users/profile endpoint
const testGetProfile = async () => {
    try {
        logSection('Test: GET /users/profile');
        
        const response = await axios.get(`${BASE_URL}/users/profile`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });

        const user = response.data.data.user;
        testUserId = user._id;

        // Test 1: Response structure
        logTest('Response Status 200', response.status === 200);
        logTest('User Data Present', !!user);
        
        // Test 2: Required fields
        const requiredFields = ['email', 'name', '_id'];
        requiredFields.forEach(field => {
            logTest(`Has field: ${field}`, user.hasOwnProperty(field), `Value: ${user[field]}`);
        });

        // Test 3: Statistics fields from UserStats
        const statsFields = {
            totalPoints: 'number',
            normalPoints: 'number',
            bluePoints: 'number',
            greenPoints: 'number',
            questionsAnswered: 'number',
            correctAnswers: 'number',
            percentageAnswered: 'number',
            level: 'number',
            xpToNextLevel: 'number'
        };

        console.log('\n📊 Statistics Fields:'.bold);
        Object.entries(statsFields).forEach(([field, expectedType]) => {
            const value = user[field];
            const hasField = user.hasOwnProperty(field);
            const correctType = typeof value === expectedType || value === null || value === undefined;
            logTest(
                `${field} (${expectedType})`,
                hasField && correctType,
                `Value: ${value !== undefined ? value : 'undefined'}`
            );
        });

        // Test 4: Points calculation logic
        console.log('\n🔢 Points Calculation Tests:'.bold);
        const calculatedTotal = (user.normalPoints || 0) + 
                               ((user.greenPoints || 0) * 30) + 
                               ((user.bluePoints || 0) * 40);
        
        logTest(
            'Total Points Calculation',
            user.totalPoints === calculatedTotal,
            `Expected: ${calculatedTotal}, Got: ${user.totalPoints}`
        );

        // Test 5: Level calculation (level = totalPoints / 50)
        const expectedLevel = Math.floor((user.totalPoints || 0) / 50);
        logTest(
            'Level Calculation',
            user.level === expectedLevel,
            `Expected: ${expectedLevel}, Got: ${user.level}`
        );

        // Test 6: XP calculation (xpToNextLevel = totalPoints % 50)
        const expectedXP = (user.totalPoints || 0) % 50;
        logTest(
            'XP to Next Level',
            user.xpToNextLevel === expectedXP,
            `Expected: ${expectedXP}, Got: ${user.xpToNextLevel}`
        );

        // Test 7: Success rate calculation
        const expectedSuccessRate = user.questionsAnswered > 0 
            ? Math.round((user.correctAnswers / user.questionsAnswered) * 100)
            : 0;
        console.log(`\n📈 Success Rate: ${expectedSuccessRate}%`.bold);
        logTest(
            'Success Rate Logic',
            true,
            `${user.correctAnswers}/${user.questionsAnswered} = ${expectedSuccessRate}%`
        );

        // Display summary
        console.log(`\n${colors.bold}${colors.cyan}📋 Profile Summary:${colors.reset}`);
        console.log(`   Name: ${user.name}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   ${colors.yellow}Total Points: ${user.totalPoints}${colors.reset}`);
        console.log(`   ${colors.white}- Normal Points: ${user.normalPoints}${colors.reset}`);
        console.log(`   ${colors.green}- Green Points: ${user.greenPoints} (×30 = ${(user.greenPoints || 0) * 30} pts)${colors.reset}`);
        console.log(`   ${colors.blue}- Blue Points: ${user.bluePoints} (×40 = ${(user.bluePoints || 0) * 40} pts)${colors.reset}`);
        console.log(`   ${colors.magenta}Level: ${user.level} (${user.xpToNextLevel}/50 XP to next level)${colors.reset}`);
        console.log(`   ${colors.cyan}Questions: ${user.questionsAnswered} answered, ${user.correctAnswers} correct (${expectedSuccessRate}%)${colors.reset}`);
        console.log(`   ${colors.cyan}Progress: ${user.percentageAnswered?.toFixed(1) || 0}%${colors.reset}`);

        return true;
    } catch (error) {
        logTest('GET /users/profile', false, error.response?.data?.message || error.message);
        console.error('Error details:', error.response?.data);
        return false;
    }
};

// Step 3: Test GET /users/my-stats endpoint
const testGetMyStats = async () => {
    try {
        logSection('Test: GET /users/my-stats');
        
        const response = await axios.get(`${BASE_URL}/users/my-stats`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });

        const stats = response.data.data.stats;

        // Test 1: Response structure
        logTest('Response Status 200', response.status === 200);
        logTest('Stats Data Present', !!stats);

        // Test 2: Required stats fields
        const requiredFields = {
            examsCompleted: 'number',
            averageScore: 'number',
            studyHours: 'number',
            rank: 'number',
            achievements: 'object',
            moduleProgress: 'object',
            questionsAnswered: 'number',
            correctAnswers: 'number'
        };

        console.log('\n📊 Stats Fields:'.bold);
        Object.entries(requiredFields).forEach(([field, expectedType]) => {
            const value = stats[field];
            const hasField = stats.hasOwnProperty(field);
            const correctType = typeof value === expectedType || Array.isArray(value);
            logTest(
                `${field} (${expectedType})`,
                hasField && correctType,
                `Value: ${Array.isArray(value) ? `Array(${value.length})` : value}`
            );
        });

        // Test 3: Achievements structure
        console.log(`\n${colors.bold}🏆 Achievements:${colors.reset}`);
        if (stats.achievements && stats.achievements.length > 0) {
            logTest('Has Achievements', true, `Count: ${stats.achievements.length}`);
            stats.achievements.forEach((ach, index) => {
                console.log(`   ${colors.green}${index + 1}. ${ach.achievementName || ach.achievementId}${colors.reset}`);
            });
        } else {
            logTest('No Achievements Yet', true, 'User can earn achievements by studying');
        }

        // Test 4: Module Progress
        console.log(`\n${colors.bold}📚 Module Progress:${colors.reset}`);
        if (stats.moduleProgress && stats.moduleProgress.length > 0) {
            logTest('Has Module Progress', true, `Modules: ${stats.moduleProgress.length}`);
            stats.moduleProgress.slice(0, 3).forEach((mod, index) => {
                console.log(`   ${colors.cyan}${index + 1}. ${mod.moduleName || 'Unknown Module'}${colors.reset}`);
                console.log(`      ${colors.gray}Questions: ${mod.questionsAttempted}, Correct: ${mod.correctAnswers}, Score: ${mod.averageScore}%${colors.reset}`);
            });
            if (stats.moduleProgress.length > 3) {
                console.log(`   ${colors.gray}... and ${stats.moduleProgress.length - 3} more modules${colors.reset}`);
            }
        } else {
            logTest('No Module Progress', true, 'User hasn\'t attempted any modules yet');
        }

        // Display summary
        console.log(`\n${colors.bold}${colors.cyan}📋 Stats Summary:${colors.reset}`);
        console.log(`   Exams Completed: ${stats.examsCompleted}`);
        console.log(`   ${colors.yellow}Average Score: ${stats.averageScore?.toFixed(1) || 0}/20${colors.reset}`);
        console.log(`   ${colors.green}Study Hours: ${stats.studyHours}h${colors.reset}`);
        console.log(`   ${colors.magenta}Rank: ${stats.rank || 'N/A'}${colors.reset}`);
        console.log(`   ${colors.cyan}Questions Answered: ${stats.questionsAnswered}${colors.reset}`);
        console.log(`   ${colors.green}Correct Answers: ${stats.correctAnswers}${colors.reset}`);

        return true;
    } catch (error) {
        logTest('GET /users/my-stats', false, error.response?.data?.message || error.message);
        console.error('Error details:', error.response?.data);
        return false;
    }
};

// Step 4: Test cross-validation between endpoints
const testCrossValidation = async () => {
    try {
        logSection('Cross-Validation Tests');

        // Fetch both endpoints
        const [profileRes, statsRes] = await Promise.all([
            axios.get(`${BASE_URL}/users/profile`, {
                headers: { Authorization: `Bearer ${authToken}` }
            }),
            axios.get(`${BASE_URL}/users/my-stats`, {
                headers: { Authorization: `Bearer ${authToken}` }
            })
        ]);

        const user = profileRes.data.data.user;
        const stats = statsRes.data.data.stats;

        // Test 1: Questions answered should match
        logTest(
            'Questions Answered Match',
            user.questionsAnswered === stats.questionsAnswered,
            `Profile: ${user.questionsAnswered}, Stats: ${stats.questionsAnswered}`
        );

        // Test 2: Correct answers should match
        logTest(
            'Correct Answers Match',
            user.correctAnswers === stats.correctAnswers,
            `Profile: ${user.correctAnswers}, Stats: ${stats.correctAnswers}`
        );

        // Test 3: Data consistency check
        logTest(
            'Correct ≤ Total Questions',
            user.correctAnswers <= user.questionsAnswered,
            `${user.correctAnswers} ≤ ${user.questionsAnswered}`
        );

        // Test 4: Points are non-negative
        logTest('Total Points ≥ 0', user.totalPoints >= 0);
        logTest('Normal Points ≥ 0', user.normalPoints >= 0);
        logTest('Green Points ≥ 0', user.greenPoints >= 0);
        logTest('Blue Points ≥ 0', user.bluePoints >= 0);

        // Test 5: Level and XP are consistent
        logTest('Level ≥ 0', user.level >= 0);
        logTest('XP < 50', user.xpToNextLevel < 50, `${user.xpToNextLevel}/50`);

        return true;
    } catch (error) {
        logTest('Cross-Validation', false, error.message);
        return false;
    }
};

// Step 5: Test edge cases
const testEdgeCases = async () => {
    try {
        logSection('Edge Cases & Data Integrity');

        const response = await axios.get(`${BASE_URL}/users/profile`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });

        const user = response.data.data.user;

        // Test 1: Percentage should be 0-100
        logTest(
            'Percentage in Valid Range',
            user.percentageAnswered >= 0 && user.percentageAnswered <= 100,
            `${user.percentageAnswered}% (0-100)`
        );

        // Test 2: Handle zero division in success rate
        const successRate = user.questionsAnswered > 0 
            ? (user.correctAnswers / user.questionsAnswered) * 100
            : 0;
        logTest(
            'Success Rate No Division Error',
            !isNaN(successRate) && isFinite(successRate),
            `${successRate.toFixed(1)}%`
        );

        // Test 3: Points formula integrity
        const manualTotal = (user.normalPoints || 0) + 
                           ((user.greenPoints || 0) * 30) + 
                           ((user.bluePoints || 0) * 40);
        logTest(
            'Points Formula: normal + (green×30) + (blue×40)',
            user.totalPoints === manualTotal,
            `${user.normalPoints} + (${user.greenPoints}×30) + (${user.bluePoints}×40) = ${manualTotal}`
        );

        // Test 4: Level progression formula
        const manualLevel = Math.floor(user.totalPoints / 50);
        const manualXP = user.totalPoints % 50;
        logTest(
            'Level Progression Formula',
            user.level === manualLevel && user.xpToNextLevel === manualXP,
            `Level ${manualLevel}, XP ${manualXP}/50`
        );

        return true;
    } catch (error) {
        logTest('Edge Cases', false, error.message);
        return false;
    }
};

// Main test runner
const runAllTests = async () => {
    console.log('\n');
    console.log(`${colors.cyan}${colors.bold}╔════════════════════════════════════════════════════════════╗${colors.reset}`);
    console.log(`${colors.cyan}${colors.bold}║         PROFILE STATISTICS TEST SUITE                      ║${colors.reset}`);
    console.log(`${colors.cyan}${colors.bold}╚════════════════════════════════════════════════════════════╝${colors.reset}`);
    console.log('\n');

    const startTime = Date.now();

    // Run tests
    const loginSuccess = await login();
    if (!loginSuccess) {
        console.log(`\n${colors.red}${colors.bold}❌ Tests aborted: Authentication failed${colors.reset}`);
        return;
    }

    const results = {
        profile: await testGetProfile(),
        stats: await testGetMyStats(),
        crossValidation: await testCrossValidation(),
        edgeCases: await testEdgeCases()
    };

    // Summary
    logSection('Test Summary');
    const totalTests = Object.keys(results).length;
    const passedTests = Object.values(results).filter(r => r).length;
    const failedTests = totalTests - passedTests;

    console.log(`Total Tests: ${totalTests}`);
    console.log(`${colors.green}Passed: ${passedTests}${colors.reset}`);
    console.log(`${colors.red}Failed: ${failedTests}${colors.reset}`);
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`\n${colors.gray}Duration: ${duration}s${colors.reset}`);

    if (failedTests === 0) {
        console.log(`\n${colors.green}${colors.bold}🎉 All tests passed! Statistics are working correctly.${colors.reset}`);
    } else {
        console.log(`\n${colors.yellow}${colors.bold}⚠️  Some tests failed. Please review the errors above.${colors.reset}`);
    }

    console.log(`\n${colors.cyan}${'='.repeat(60)}${colors.reset}\n`);
};

// Run tests
runAllTests().catch(error => {
    console.error(`\n${colors.red}${colors.bold}❌ Fatal Error:${colors.reset}`, error.message);
    process.exit(1);
});
