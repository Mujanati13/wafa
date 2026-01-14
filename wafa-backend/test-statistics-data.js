// Test script for Statistics Page data flow
// Tests: Frontend → Backend → Database
// Run with: node test-statistics-data.js

import axios from 'axios';
import readline from 'readline';

const BASE_URL = 'http://localhost:5000/api';
let authToken = '';

// Color codes for console output
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

function logTest(testName, passed, details = '') {
    const status = passed ? '✓ PASS' : '✗ FAIL';
    const statusColor = passed ? colors.green : colors.red;
    log(`${status} - ${testName}`, statusColor);
    if (details) {
        log(`  Details: ${details}`, colors.yellow);
    }
}

function logData(label, data) {
    log(`${label}:`, colors.blue);
    console.log(JSON.stringify(data, null, 2));
}

// Helper to get user input
function getUserInput(question) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            rl.close();
            resolve(answer);
        });
    });
}

// Test 1: Login and get auth token
async function testLogin() {
    logSection('Test 1: User Authentication');

    try {
        const email = await getUserInput('Enter email: ');
        const password = await getUserInput('Enter password: ');

        const response = await axios.post(`${BASE_URL}/auth/login`, {
            email,
            password
        });

        if (response.data.success && response.data.data.token) {
            authToken = response.data.data.token;
            logTest('Login', true, `Token received: ${authToken.substring(0, 20)}...`);
            return true;
        }

        logTest('Login', false, 'No token received');
        return false;
    } catch (error) {
        logTest('Login', false, error.response?.data?.message || error.message);
        return false;
    }
}

// Test 2: Get User Profile
async function testUserProfile() {
    logSection('Test 2: GET /users/profile');

    try {
        const response = await axios.get(`${BASE_URL}/users/profile`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });

        if (response.data.success && response.data.data?.user) {
            const user = response.data.data.user;
            logTest('Get User Profile', true);
            logData('User Info', {
                _id: user._id,
                name: user.name || `${user.firstName} ${user.lastName}`,
                email: user.email,
                plan: user.plan,
                semesters: user.semesters,
                totalPoints: user.totalPoints,
                normalPoints: user.normalPoints,
                greenPoints: user.greenPoints,
                bluePoints: user.bluePoints
            });
            return user;
        }

        logTest('Get User Profile', false, 'Invalid response structure');
        return null;
    } catch (error) {
        logTest('Get User Profile', false, error.response?.data?.message || error.message);
        return null;
    }
}

// Test 3: Get User Stats (Mes Statistiques)
async function testUserStats() {
    logSection('Test 3: GET /users/my-stats (Mes Statistiques)');

    try {
        const response = await axios.get(`${BASE_URL}/users/my-stats`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });

        if (response.data.success && response.data.data?.stats) {
            const stats = response.data.data.stats;
            logTest('Get User Stats', true);
            
            // Check if stats have data
            const hasData = stats.examsCompleted > 0 || 
                           stats.totalQuestionsAttempted > 0 || 
                           stats.moduleProgress?.length > 0;
            
            logData('Stats Summary', {
                examsCompleted: stats.examsCompleted,
                averageScore: stats.averageScore,
                studyHours: stats.studyHours,
                rank: stats.rank,
                totalQuestionsAttempted: stats.totalQuestionsAttempted,
                totalCorrectAnswers: stats.totalCorrectAnswers,
                totalIncorrectAnswers: stats.totalIncorrectAnswers,
                moduleProgressCount: stats.moduleProgress?.length || 0
            });

            if (!hasData) {
                log('⚠ WARNING: Stats are empty - user may not have answered any questions yet', colors.yellow);
            }

            // Check module progress
            if (stats.moduleProgress && stats.moduleProgress.length > 0) {
                logData('Module Progress (First 3)', stats.moduleProgress.slice(0, 3));
            } else {
                log('⚠ No module progress data found', colors.yellow);
            }

            return stats;
        }

        logTest('Get User Stats', false, 'Invalid response structure');
        logData('Response', response.data);
        return null;
    } catch (error) {
        logTest('Get User Stats', false, error.response?.data?.message || error.message);
        if (error.response?.data) {
            logData('Error Response', error.response.data);
        }
        return null;
    }
}

// Test 4: Get All Modules
async function testGetModules() {
    logSection('Test 4: GET /modules (All Modules)');

    try {
        const response = await axios.get(`${BASE_URL}/modules`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });

        if (response.data.success) {
            const modules = response.data.data?.data || response.data.data || [];
            logTest('Get Modules', true, `Found ${modules.length} modules`);
            
            if (modules.length > 0) {
                logData('Sample Modules (First 3)', modules.slice(0, 3).map(m => ({
                    _id: m._id,
                    name: m.name,
                    semester: m.semester,
                    totalQuestions: m.totalQuestions
                })));
            } else {
                log('⚠ No modules found in database', colors.yellow);
            }

            return modules;
        }

        logTest('Get Modules', false, 'Invalid response structure');
        return [];
    } catch (error) {
        logTest('Get Modules', false, error.response?.data?.message || error.message);
        return [];
    }
}

// Test 5: Check Database Connection (via a simple API call)
async function testDatabaseConnection() {
    logSection('Test 5: Database Connection Check');

    try {
        // Try to get user profile which requires DB access
        const response = await axios.get(`${BASE_URL}/users/profile`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });

        if (response.data.success) {
            logTest('Database Connection', true, 'Database is responding');
            return true;
        }

        logTest('Database Connection', false, 'Unexpected response');
        return false;
    } catch (error) {
        logTest('Database Connection', false, error.message);
        return false;
    }
}

// Test 6: Check Chart Data Formation
async function testChartDataFormation(stats) {
    logSection('Test 6: Chart Data Formation (Analyse de Performance)');

    if (!stats) {
        logTest('Chart Data', false, 'No stats available');
        return;
    }

    // Test Module Progress Chart Data
    if (stats.moduleProgress && stats.moduleProgress.length > 0) {
        const chartData = stats.moduleProgress.slice(0, 6).map(mp => ({
            name: mp.moduleName?.substring(0, 12) || 'Unknown',
            completed: mp.correctAnswers || 0,
            pending: (mp.questionsAttempted || 0) - (mp.correctAnswers || 0)
        }));
        
        logTest('Module Progress Chart', true, `${chartData.length} data points`);
        logData('Chart Data Sample', chartData);
    } else {
        logTest('Module Progress Chart', false, 'No module progress data available');
        log('  This is why charts appear empty', colors.yellow);
    }

    // Test Performance Trend
    const hasHistoricalData = stats.weeklyActivity && stats.weeklyActivity.length > 0;
    if (hasHistoricalData) {
        logTest('Performance Trend Data', true, `${stats.weeklyActivity.length} activities`);
    } else {
        logTest('Performance Trend Data', false, 'No weekly activity data');
        log('  Charts will show with 0 values', colors.yellow);
    }

    // Test Completion Data
    const totalQuestions = stats.totalQuestionsAttempted || 0;
    const hasQuestionData = totalQuestions > 0;
    
    if (hasQuestionData) {
        logTest('Completion Rate Data', true, `${totalQuestions} questions attempted`);
        logData('Completion Stats', {
            total: totalQuestions,
            correct: stats.totalCorrectAnswers || 0,
            incorrect: stats.totalIncorrectAnswers || 0
        });
    } else {
        logTest('Completion Rate Data', false, 'No questions attempted yet');
        log('  Pie chart will show "Aucune donnée"', colors.yellow);
    }
}

// Test 7: Verify Data Consistency
async function testDataConsistency(user, stats, modules) {
    logSection('Test 7: Data Consistency Check');

    if (!user || !stats || !modules) {
        logTest('Data Consistency', false, 'Missing required data');
        return;
    }

    // Check if user's semesters match available modules
    const userSemesters = user.semesters || [];
    const userModules = modules.filter(m => userSemesters.includes(m.semester));
    
    logTest('Semester-Module Match', true, `${userModules.length} modules match user's semesters`);
    
    // Check if stats reflect actual module access
    const statsModuleIds = (stats.moduleProgress || []).map(mp => mp.moduleId?.toString());
    const availableModuleIds = userModules.map(m => m._id?.toString());
    
    const statsForAvailableModules = statsModuleIds.filter(id => 
        availableModuleIds.includes(id)
    ).length;
    
    logTest('Stats-Module Consistency', 
        statsForAvailableModules === statsModuleIds.length,
        `${statsForAvailableModules}/${statsModuleIds.length} stats match available modules`
    );

    // Check plan restrictions
    if (user.plan === 'Free' && userSemesters.length === 0) {
        log('⚠ WARNING: Free user with no semesters - should select free semester', colors.yellow);
    }
}

// Main test execution
async function runAllTests() {
    log('\n' + '█'.repeat(60), colors.bright);
    log('  STATISTICS PAGE DATA FLOW TEST', colors.bright + colors.cyan);
    log('  Testing: Frontend → Backend → Database', colors.bright + colors.cyan);
    log('█'.repeat(60) + '\n', colors.bright);

    // Test 1: Login
    const loginSuccess = await testLogin();
    if (!loginSuccess) {
        log('\n❌ Login failed. Cannot continue tests.', colors.red);
        process.exit(1);
    }

    // Test 2: User Profile
    const user = await testUserProfile();
    
    // Test 3: User Stats
    const stats = await testUserStats();
    
    // Test 4: Modules
    const modules = await testGetModules();
    
    // Test 5: Database
    await testDatabaseConnection();
    
    // Test 6: Chart Data
    await testChartDataFormation(stats);
    
    // Test 7: Consistency
    await testDataConsistency(user, stats, modules);

    // Final Summary
    logSection('Test Summary');
    
    if (stats && (stats.examsCompleted > 0 || stats.totalQuestionsAttempted > 0)) {
        log('✓ User has activity data - statistics should display correctly', colors.green);
    } else {
        log('⚠ User has no activity yet - statistics will be empty', colors.yellow);
        log('  Solution: User needs to answer some questions first', colors.yellow);
    }

    if (stats && stats.moduleProgress && stats.moduleProgress.length > 0) {
        log('✓ Module progress data exists - charts should display', colors.green);
    } else {
        log('⚠ No module progress - charts will show empty state', colors.yellow);
    }

    log('\n' + '█'.repeat(60), colors.bright);
    log('  TEST COMPLETED', colors.bright + colors.green);
    log('█'.repeat(60) + '\n', colors.bright);
}

// Run the tests
runAllTests().catch(error => {
    log('\n❌ Test execution failed:', colors.red);
    console.error(error);
    process.exit(1);
});
