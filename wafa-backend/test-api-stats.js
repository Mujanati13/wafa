// Test the /users/my-stats API endpoint directly
import axios from 'axios';

const BASE_URL = 'http://localhost:5010/api';

// Test with a real token (you need to login first)
const TEST_TOKEN = 'YOUR_TOKEN_HERE'; // Replace with actual token

async function testMyStats() {
    try {
        console.log('Testing GET /users/my-stats...\n');
        
        const response = await axios.get(`${BASE_URL}/users/my-stats`, {
            headers: {
                Authorization: `Bearer ${TEST_TOKEN}`
            }
        });

        if (response.data.success) {
            const stats = response.data.data.stats;
            
            console.log('✓ API Response successful\n');
            console.log('Overall Stats:');
            console.log(`  Total Questions: ${stats.totalQuestionsAttempted || 0}`);
            console.log(`  Correct: ${stats.totalCorrectAnswers || 0}`);
            console.log(`  Incorrect: ${stats.totalIncorrectAnswers || 0}`);
            console.log(`  Average: ${stats.averageScore || 0}%\n`);
            
            console.log('Weekly Activity:');
            if (stats.weeklyActivity && stats.weeklyActivity.length > 0) {
                console.log(`  ✓ ${stats.weeklyActivity.length} days of data`);
                stats.weeklyActivity.slice(0, 3).forEach(activity => {
                    console.log(`    ${activity.date}: ${activity.questionsAttempted} questions`);
                });
            } else {
                console.log('  ✗ No weekly activity data');
            }
            
            console.log('\nModule Progress:');
            if (stats.moduleProgress && stats.moduleProgress.length > 0) {
                console.log(`  ✓ ${stats.moduleProgress.length} modules`);
                stats.moduleProgress.slice(0, 3).forEach(mp => {
                    console.log(`    ${mp.moduleName}: ${mp.questionsAttempted} attempted`);
                });
            } else {
                console.log('  ✗ No module progress');
            }
            
            console.log('\n✓ Test completed successfully');
        }
    } catch (error) {
        console.error('✗ Error:', error.response?.data?.message || error.message);
        console.log('\nTo use this test:');
        console.log('1. Login to get a token');
        console.log('2. Replace TEST_TOKEN in the script');
        console.log('3. Run: node test-api-stats.js');
    }
}

testMyStats();
