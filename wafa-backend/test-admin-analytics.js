import axios from 'axios';

const API_URL = 'http://localhost:5010/api/v1';

// Test admin analytics endpoints
async function testAdminAnalytics() {
  console.log('\n🔍 Testing Admin Analytics Endpoints...\n');

  // You'll need to get a valid admin token first
  // For now, we'll test the endpoints structure
  
  const endpoints = [
    { name: 'Dashboard Stats', url: '/admin/analytics/dashboard-stats' },
    { name: 'User Growth (30d)', url: '/admin/analytics/user-growth?period=30d' },
    { name: 'Recent Activity', url: '/admin/analytics/recent-activity?limit=5' },
    { name: 'Subscriptions', url: '/admin/analytics/subscriptions' },
    { name: 'Demographics', url: '/admin/analytics/demographics' },
    { name: 'Leaderboard', url: '/admin/analytics/leaderboard?limit=10' }
  ];

  let successCount = 0;
  let failCount = 0;

  for (const endpoint of endpoints) {
    try {
      const response = await axios.get(`${API_URL}${endpoint.url}`, {
        withCredentials: true,
        timeout: 5000
      });
      
      if (response.data.success) {
        console.log(`✅ ${endpoint.name}: OK`);
        console.log(`   Data keys:`, Object.keys(response.data.data || {}));
        successCount++;
      } else {
        console.log(`⚠️  ${endpoint.name}: Response not successful`);
        failCount++;
      }
    } catch (error) {
      if (error.response?.status === 401) {
        console.log(`🔒 ${endpoint.name}: Requires authentication (expected)`);
      } else if (error.response?.status === 403) {
        console.log(`🔒 ${endpoint.name}: Requires admin access (expected)`);
      } else {
        console.log(`❌ ${endpoint.name}: ${error.message}`);
        failCount++;
      }
    }
  }

  console.log(`\n📊 Results: ${successCount} passed, ${failCount} failed\n`);
}

// Test that the routes are registered
async function testRouteRegistration() {
  console.log('\n🔍 Testing Route Registration...\n');

  try {
    // Test base API
    const testResponse = await axios.get(`${API_URL}/test`);
    console.log('✅ Base API is reachable:', testResponse.data.message);

    // Test if analytics route exists (will return 401 but that's expected)
    try {
      await axios.get(`${API_URL}/admin/analytics/dashboard-stats`);
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        console.log('✅ Analytics route is registered (auth required)');
      } else if (error.response?.status === 404) {
        console.log('❌ Analytics route NOT found (404)');
      }
    }
  } catch (error) {
    console.log('❌ Base API not reachable:', error.message);
  }
}

// Run tests
(async () => {
  console.log('═══════════════════════════════════════════');
  console.log('  ADMIN ANALYTICS ENDPOINTS TEST SUITE');
  console.log('═══════════════════════════════════════════');
  
  await testRouteRegistration();
  await testAdminAnalytics();
  
  console.log('═══════════════════════════════════════════');
  console.log('  TEST COMPLETE');
  console.log('═══════════════════════════════════════════\n');
})();
