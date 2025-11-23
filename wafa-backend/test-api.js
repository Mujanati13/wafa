/**
 * WAFA Backend API Test Script
 * 
 * This script tests all major endpoints of the WAFA backend API
 * 
 * Usage:
 * 1. Make sure the backend server is running (npm start)
 * 2. Update the API_URL if needed
 * 3. Run: node test-api.js
 */

import axios from 'axios';
import { wrapper } from 'axios-cookiejar-support';
import { CookieJar } from 'tough-cookie';

const API_URL = 'http://localhost:3000/api/v1';

// Create cookie jar for session persistence
const jar = new CookieJar();

// Create axios instance with cookie jar for session persistence
const axiosInstance = wrapper(axios.create({
  baseURL: API_URL,
  withCredentials: true,
  jar,
  headers: {
    'Content-Type': 'application/json',
  },
}));

let testUserId = null;
let testPlaylistId = null;
let testNoteId = null;
let testModuleId = null;
let testQuestionId = null;

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const log = {
  success: (msg) => console.log(`${colors.green}✓ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}✗ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ ${msg}${colors.reset}`),
  section: (msg) => console.log(`\n${colors.cyan}${'='.repeat(60)}\n${msg}\n${'='.repeat(60)}${colors.reset}`),
};

// Test data
const testUser = {
  username: 'testuser',
  email: `test${Date.now()}@example.com`,
  password: 'Test123!@#',
  university: 'Test University',
  faculty: 'Medicine',
  currentYear: 'S3',
};

// Helper function to make authenticated requests
const apiRequest = async (method, endpoint, data = null) => {
  try {
    const config = {
      method,
      url: endpoint,
    };

    if (data) {
      config.data = data;
    }

    const response = await axiosInstance(config);
    
    // Store cookies for debugging (they're automatically handled by axios)
    if (response.headers['set-cookie']) {
      log.info(`Session cookie received from ${endpoint}`);
    }
    
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || error.message,
      status: error.response?.status,
    };
  }
};

// Test Authentication
async function testAuthentication() {
  log.section('Testing Authentication');

  // Test Registration
  log.info('Testing user registration...');
  const registerResult = await apiRequest('POST', '/auth/register', testUser, false);
  if (registerResult.success) {
    log.success('User registered successfully');
    testUserId = registerResult.data.user?.id || registerResult.data.user?._id;
    log.info(`Test user ID: ${testUserId}`);
  } else {
    log.error(`Registration failed: ${registerResult.error}`);
  }

  // Test Login
  log.info('Testing user login...');
  const loginResult = await apiRequest('POST', '/auth/login', {
    email: testUser.email,
    password: testUser.password,
  }, false);
  if (loginResult.success) {
    log.success('User logged in successfully');
    // Session cookie is captured automatically in apiRequest
  } else {
    log.error(`Login failed: ${loginResult.error}`);
    throw new Error('Authentication failed - cannot continue tests');
  }

  // Test Check Auth
  log.info('Testing check-auth endpoint...');
  const checkAuthResult = await apiRequest('GET', '/auth/check-auth');
  if (checkAuthResult.success) {
    log.success('Check-auth successful');
  } else {
    log.error(`Check-auth failed: ${checkAuthResult.error}`);
  }
}

// Test User Profile
async function testUserProfile() {
  log.section('Testing User Profile');

  // Get Profile
  log.info('Testing get profile...');
  const getProfileResult = await apiRequest('GET', '/users/profile');
  if (getProfileResult.success) {
    log.success('Profile retrieved successfully');
  } else {
    log.error(`Get profile failed: ${getProfileResult.error}`);
  }

  // Update Profile
  log.info('Testing update profile...');
  const updateProfileResult = await apiRequest('PUT', '/users/profile', {
    phone: '+212612345678',
    bio: 'Test bio for API testing',
    studentId: 'TEST123456',
  });
  if (updateProfileResult.success) {
    log.success('Profile updated successfully');
  } else {
    log.error(`Update profile failed: ${updateProfileResult.error}`);
  }
}

// Test Modules
async function testModules() {
  log.section('Testing Modules');

  // Get All Modules
  log.info('Testing get all modules...');
  const getModulesResult = await apiRequest('GET', '/modules');
  if (getModulesResult.success) {
    log.success(`Modules retrieved: ${getModulesResult.data.data?.length || 0} modules found`);
    if (getModulesResult.data.data?.length > 0) {
      testModuleId = getModulesResult.data.data[0]._id;
      log.info(`Using module ID: ${testModuleId} for further tests`);
    }
  } else {
    log.error(`Get modules failed: ${getModulesResult.error}`);
  }
}

// Test Exams
async function testExams() {
  log.section('Testing Exams');

  if (!testModuleId) {
    log.error('No module ID available for testing exams');
    return;
  }

  // Get All Exams
  log.info('Testing get all exams...');
  const getExamsResult = await apiRequest('GET', '/exams/all');
  if (getExamsResult.success) {
    const exams = getExamsResult.data.data || [];
    log.success(`Exams retrieved: ${exams.length} exams found`);
    
    if (exams.length > 0) {
      const testExam = exams[0];
      log.info(`Using exam ID: ${testExam._id} for further tests`);
      
      // Test Get Questions by Exam
      log.info('Testing get questions by exam...');
      const getQuestionsResult = await apiRequest('GET', `/questions/by-exam/${testExam._id}`);
      if (getQuestionsResult.success) {
        const questions = getQuestionsResult.data.data || [];
        log.success(`Questions retrieved: ${questions.length} questions found`);
        if (questions.length > 0) {
          testQuestionId = questions[0]._id;
          log.info(`Using question ID: ${testQuestionId} for further tests`);
        }
      } else {
        log.error(`Get questions failed: ${getQuestionsResult.error}`);
      }
    }
  } else {
    log.error(`Get exams failed: ${getExamsResult.error}`);
  }
}

// Test Playlists
async function testPlaylists() {
  log.section('Testing Playlists');

  // Create Playlist
  log.info('Testing create playlist...');
  const createPlaylistResult = await apiRequest('POST', '/playlists', {
    title: 'Test Playlist',
    description: 'This is a test playlist',
    questionIds: testQuestionId ? [testQuestionId] : [],
  });
  if (createPlaylistResult.success) {
    log.success('Playlist created successfully');
    // Handle different possible response structures
    testPlaylistId = createPlaylistResult.data.playlist?._id || createPlaylistResult.data.data?._id || createPlaylistResult.data._id;
    if (!testPlaylistId) {
      log.error('Could not extract playlist ID from response');
    }
  } else {
    log.error(`Create playlist failed: ${createPlaylistResult.error}`);
  }

  // Get All Playlists
  log.info('Testing get all playlists...');
  const getPlaylistsResult = await apiRequest('GET', '/playlists');
  if (getPlaylistsResult.success) {
    log.success(`Playlists retrieved: ${getPlaylistsResult.data.playlists?.length || 0} playlists found`);
  } else {
    log.error(`Get playlists failed: ${getPlaylistsResult.error}`);
  }

  // Remove Question from Playlist (to test adding it back)
  if (testPlaylistId && testQuestionId) {
    log.info('Testing remove question from playlist...');
    const removeQuestionResult = await apiRequest('DELETE', `/playlists/${testPlaylistId}/questions/${testQuestionId}`);
    if (removeQuestionResult.success) {
      log.success('Question removed from playlist successfully');
    } else {
      log.error(`Remove question failed: ${removeQuestionResult.error}`);
    }

    // Add Question to Playlist
    log.info('Testing add question to playlist...');
    const addQuestionResult = await apiRequest('POST', `/playlists/${testPlaylistId}/questions`, {
      questionId: testQuestionId,
    });
    if (addQuestionResult.success) {
      log.success('Question added to playlist successfully');
    } else {
      log.error(`Add question to playlist failed: ${addQuestionResult.error}`);
    }
  }

  // Get Playlist by ID
  if (testPlaylistId) {
    log.info('Testing get playlist by ID...');
    const getPlaylistResult = await apiRequest('GET', `/playlists/${testPlaylistId}`);
    if (getPlaylistResult.success) {
      log.success('Playlist retrieved by ID successfully');
    } else {
      log.error(`Get playlist by ID failed: ${getPlaylistResult.error}`);
    }
  }
}

// Test Notes
async function testNotes() {
  log.section('Testing Notes');

  if (!testQuestionId) {
    log.error('No question ID available for testing notes');
    return;
  }

  // Create Note
  log.info('Testing create note...');
  const createNoteResult = await apiRequest('POST', '/notes', {
    questionId: testQuestionId,
    title: 'Test Note',
    content: 'This is a test note for the question. It contains important information.',
  });
  if (createNoteResult.success) {
    log.success('Note created successfully');
    testNoteId = createNoteResult.data.note?._id || createNoteResult.data.data?._id || createNoteResult.data._id;
    if (!testNoteId) {
      log.error('Could not extract note ID from response');
    }
  } else {
    log.error(`Create note failed: ${createNoteResult.error}`);
  }

  // Get All Notes
  log.info('Testing get all notes...');
  const getNotesResult = await apiRequest('GET', '/notes');
  if (getNotesResult.success) {
    log.success(`Notes retrieved: ${getNotesResult.data.notes?.length || 0} notes found`);
  } else {
    log.error(`Get notes failed: ${getNotesResult.error}`);
  }

  // Update Note
  if (testNoteId) {
    log.info('Testing update note...');
    const updateNoteResult = await apiRequest('PUT', `/notes/${testNoteId}`, {
      title: 'Updated Test Note',
      content: 'This is an updated test note with new content.',
      isPinned: true,
    });
    if (updateNoteResult.success) {
      log.success('Note updated successfully');
    } else {
      log.error(`Update note failed: ${updateNoteResult.error}`);
    }
  }
}

// Test Contact
async function testContact() {
  log.section('Testing Contact');

  log.info('Testing create contact message...');
  const createContactResult = await apiRequest('POST', '/contact', {
    name: 'Test User',
    email: testUser.email,
    subject: 'Test Subject',
    message: 'This is a test contact message.',
  });
  if (createContactResult.success) {
    log.success('Contact message created successfully');
  } else {
    log.error(`Create contact message failed: ${createContactResult.error}`);
  }
}

// Test Report Questions
async function testReportQuestions() {
  log.section('Testing Report Questions');

  if (!testQuestionId) {
    log.error('No question ID available for testing report');
    return;
  }

  log.info('Testing report question...');
  log.info(`Test data - userId: ${testUserId}, questionId: ${testQuestionId}`);
  const reportResult = await apiRequest('POST', '/report-questions/create', {
    userId: testUserId,
    questionId: testQuestionId,
    details: 'This is a test report - the question seems to have an incorrect answer or unclear wording',
  });
  if (reportResult.success) {
    log.success('Question reported successfully');
  } else {
    log.error(`Report question failed: ${reportResult.error}`);
    if (reportResult.fullError) {
      console.log('Full error details:', JSON.stringify(reportResult.fullError, null, 2));
    }
  }
}

// Test Explanations
async function testExplanations() {
  log.section('Testing Explanations');

  log.info('Testing get explanations...');
  const getExplanationsResult = await apiRequest('GET', '/explanations');
  if (getExplanationsResult.success) {
    log.success(`Explanations retrieved: ${getExplanationsResult.data.data?.length || 0} explanations found`);
  } else {
    log.error(`Get explanations failed: ${getExplanationsResult.error}`);
  }
}

// Test Resumes
async function testResumes() {
  log.section('Testing Resumes');

  log.info('Testing get resumes...');
  const getResumesResult = await apiRequest('GET', '/resumes');
  if (getResumesResult.success) {
    log.success(`Resumes retrieved: ${getResumesResult.data.data?.length || 0} resumes found`);
  } else {
    log.error(`Get resumes failed: ${getResumesResult.error}`);
  }
}

// Cleanup - Delete Test Data
async function cleanup() {
  log.section('Cleanup - Deleting Test Data');

  // Delete Note
  if (testNoteId) {
    log.info('Deleting test note...');
    const deleteNoteResult = await apiRequest('DELETE', `/notes/${testNoteId}`);
    if (deleteNoteResult.success) {
      log.success('Test note deleted');
    } else {
      log.error(`Delete note failed: ${deleteNoteResult.error}`);
    }
  }

  // Delete Playlist
  if (testPlaylistId) {
    log.info('Deleting test playlist...');
    const deletePlaylistResult = await apiRequest('DELETE', `/playlists/${testPlaylistId}`);
    if (deletePlaylistResult.success) {
      log.success('Test playlist deleted');
    } else {
      log.error(`Delete playlist failed: ${deletePlaylistResult.error}`);
    }
  }

  log.info('Test data cleanup completed');
  log.info(`Test user (${testUser.email}) can be manually deleted from database if needed`);
}

// Main test runner
async function runAllTests() {
  console.log(`${colors.cyan}
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║           WAFA Backend API Test Suite                     ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
${colors.reset}`);

  log.info(`API URL: ${API_URL}`);
  log.info(`Starting tests at: ${new Date().toLocaleString()}`);

  try {
    await testAuthentication();
    await testUserProfile();
    await testModules();
    await testExams();
    await testPlaylists();
    await testNotes();
    await testContact();
    await testReportQuestions();
    await testExplanations();
    await testResumes();
    await cleanup();

    log.section('Test Summary');
    log.success('All tests completed!');
    log.info('Check the output above for any failures');

  } catch (error) {
    log.error(`Test suite failed: ${error.message}`);
    console.error(error);
  }

  console.log(`\n${colors.cyan}Test suite finished at: ${new Date().toLocaleString()}${colors.reset}\n`);
}

// Run tests
runAllTests();
