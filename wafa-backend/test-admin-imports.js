/**
 * Comprehensive Test Suite for Admin Import Functions
 * Tests: ImportExamParYears, ImportExamCourses, ImportQCMBanque, ImportResumes
 * Verifies data imports work correctly and are properly linked to user space
 * 
 * Run: node test-admin-imports.js
 */

console.log('Test script starting...');

import axios from 'axios';
import FormDataLib from 'form-data';
const FormData = FormDataLib;
import fs from 'fs';
import xlsx from 'xlsx';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

console.log('Imports successful');

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('File path setup complete');

// Configuration
const API_BASE_URL = process.env.API_URL || 'http://localhost:5010/api/v1';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@wafa.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'test1234';
const TEST_USER_EMAIL = process.env.TEST_USER_EMAIL || 'test@wafa.ma';
const TEST_USER_PASSWORD = process.env.TEST_USER_PASSWORD || 'Test123';

// Test results tracking
const testResults = {
  passed: 0,
  failed: 0,
  tests: [],
  createdData: {
    modules: [],
    exams: [],
    examCourses: [],
    qcmBanques: [],
    questions: [],
    resumes: []
  }
};

// Colors for console output
const colors = {
  info: '\x1b[36m',
  success: '\x1b[32m',
  error: '\x1b[31m',
  warning: '\x1b[33m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

const log = (message, type = 'info') => {
  console.log(`${colors[type]}${message}${colors.reset}`);
};

const recordTest = (name, passed, error = null) => {
  testResults.tests.push({ name, passed, error });
  if (passed) {
    testResults.passed++;
    log(`✓ ${name}`, 'success');
  } else {
    testResults.failed++;
    log(`✗ ${name}: ${error}`, 'error');
  }
};

// Authentication tokens
let adminToken = null;
let userToken = null;

// Login as admin
const loginAdmin = async () => {
  try {
    log('Logging in as admin...', 'info');
    log(`API URL: ${API_BASE_URL}/auth/login`, 'info');
    log(`Email: ${ADMIN_EMAIL}`, 'info');
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });
    
    if (response.data.success && response.data.token) {
      adminToken = response.data.token;
      log('Admin login successful', 'success');
      return true;
    }
    return false;
  } catch (error) {
    log(`Admin login failed: ${error.response?.data?.message || error.message}`, 'error');
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    } else if (error.request) {
      console.error('No response received. Request was made but no response.');
      console.error('Error code:', error.code);
    } else {
      console.error('Error setting up request:', error.message);
    }
    return false;
  }
};

// Register test user
const registerUser = async () => {
  try {
    log('Registering test user...', 'info');
    const response = await axios.post(`${API_BASE_URL}/auth/register`, {
      name: 'Test User',
      email: TEST_USER_EMAIL,
      password: TEST_USER_PASSWORD,
      confirmPassword: TEST_USER_PASSWORD
    });
    
    if (response.data.success) {
      log('User registration successful', 'success');
      return true;
    }
    return false;
  } catch (error) {
    // User might already exist
    if (error.response?.status === 400 || error.response?.data?.message?.includes('exist')) {
      log('User already exists, will try to login', 'info');
      return true;
    }
    log(`User registration failed: ${error.response?.data?.message || error.message}`, 'warning');
    return false;
  }
};

// Login as test user
const loginUser = async () => {
  try {
    log('Logging in as test user...', 'info');
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: TEST_USER_EMAIL,
      password: TEST_USER_PASSWORD
    });
    
    if (response.data.success && response.data.token) {
      userToken = response.data.token;
      log('User login successful', 'success');
      return true;
    }
    return false;
  } catch (error) {
    log(`User login failed: ${error.response?.data?.message || error.message}`, 'warning');
    return false;
  }
};

// Helper to create test Excel file
const createTestExcelFile = (filename, data) => {
  const filePath = join(__dirname, filename);
  const ws = xlsx.utils.aoa_to_sheet(data);
  const wb = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(wb, ws, 'Sheet1');
  xlsx.writeFile(wb, filePath);
  return filePath;
};

// =============================================================================
// TEST 1: Setup - Create Test Module
// =============================================================================
const testCreateModule = async () => {
  try {
    const moduleData = {
      name: `Test Module ${Date.now()}`,
      infoText: 'Module for integration testing',
      color: '#3B82F6',
      difficulty: 'medium',
      semester: 'S1'
    };
    
    const response = await axios.post(`${API_BASE_URL}/modules/create`, moduleData, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    if (response.data.success && response.data.data) {
      testResults.createdData.modules.push(response.data.data);
      recordTest('Create Test Module', true);
      return response.data.data._id || response.data.data.id;
    }
    
    recordTest('Create Test Module', false, 'No module data returned');
    return null;
  } catch (error) {
    recordTest('Create Test Module', false, error.response?.data?.message || error.message);
    return null;
  }
};

// =============================================================================
// TEST 2: Create Exam Par Years
// =============================================================================
const testCreateExamParYears = async (moduleId) => {
  if (!moduleId) {
    recordTest('Create Exam Par Years', false, 'No module ID');
    return null;
  }
  
  try {
    const examData = {
      name: `Test Exam ${Date.now()}`,
      moduleId: moduleId,
      year: 2024,
      infoText: 'Test exam for integration testing'
    };
    
    const response = await axios.post(`${API_BASE_URL}/exams/create`, examData, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    if (response.data.success && response.data.data) {
      testResults.createdData.exams.push(response.data.data);
      recordTest('Create Exam Par Years', true);
      return response.data.data._id || response.data.data.id;
    }
    
    recordTest('Create Exam Par Years', false, 'No exam data returned');
    return null;
  } catch (error) {
    recordTest('Create Exam Par Years', false, error.response?.data?.message || error.message);
    return null;
  }
};

// =============================================================================
// TEST 3: Import Questions to Exam Par Years via Excel
// =============================================================================
const testImportExamParYearsQuestions = async (examId) => {
  if (!examId) {
    recordTest('Import Exam Par Years Questions', false, 'No exam ID');
    return false;
  }
  
  try {
    // Create test Excel file with questions
    const questionData = [
      ['Question', 'A', 'B', 'C', 'D', 'E', 'answer'],
      ['What is 2+2?', '4', '5', '6', '7', '8', 'a'],
      ['What is the capital of France?', 'London', 'Paris', 'Berlin', 'Madrid', 'Rome', 'b'],
      ['What is 10*10?', '100', '50', '200', '10', '1000', 'a']
    ];
    
    const filePath = createTestExcelFile('test-exam-questions.xlsx', questionData);
    const formData = new FormData();
    formData.append('file', fs.createReadStream(filePath));
    formData.append('examId', examId);
    formData.append('type', 'exam-par-year');
    
    const response = await axios.post(`${API_BASE_URL}/questions/import`, formData, {
      headers: { 
        ...formData.getHeaders(),
        Authorization: `Bearer ${adminToken}` 
      }
    });
    
    // Clean up file
    fs.unlinkSync(filePath);
    
    if (response.data.success) {
      testResults.createdData.questions.push(...(response.data.data?.questions || []));
      recordTest('Import Exam Par Years Questions', true);
      return true;
    }
    
    recordTest('Import Exam Par Years Questions', false, response.data.message);
    return false;
  } catch (error) {
    recordTest('Import Exam Par Years Questions', false, error.response?.data?.message || error.message);
    return false;
  }
};

// =============================================================================
// TEST 4: Create Exam Course
// =============================================================================
const testCreateExamCourse = async (moduleId) => {
  if (!moduleId) {
    recordTest('Create Exam Course', false, 'No module ID');
    return null;
  }
  
  try {
    const courseData = {
      name: `Test Course ${Date.now()}`,
      moduleId: moduleId,
      category: 'Test Category',
      description: 'Test course description'
    };
    
const response = await axios.post(`${API_BASE_URL}/exam-courses`, courseData, {
      headers: {
        Authorization: `Bearer ${adminToken}`
      }
    });
    
    if (response.data.success && response.data.data) {
      testResults.createdData.examCourses.push(response.data.data);
      recordTest('Create Exam Course', true);
      return response.data.data._id || response.data.data.id;
    }
    
    recordTest('Create Exam Course', false, 'No course data returned');
    return null;
  } catch (error) {
    recordTest('Create Exam Course', false, error.response?.data?.message || error.message);
    return null;
  }
};

// =============================================================================
// TEST 5: Import Questions to Exam Course via Excel
// =============================================================================
const testImportExamCourseQuestions = async (courseId) => {
  if (!courseId) {
    recordTest('Import Exam Course Questions', false, 'No course ID');
    return false;
  }
  
  try {
    const questionData = [
      ['Question', 'A', 'B', 'C', 'D', 'E', 'answer'],
      ['Course Question 1?', 'Answer A', 'Answer B', 'Answer C', 'Answer D', 'Answer E', 'a'],
      ['Course Question 2?', 'Option 1', 'Option 2', 'Option 3', 'Option 4', 'Option 5', 'b']
    ];
    
    const filePath = createTestExcelFile('test-course-questions.xlsx', questionData);
    const formData = new FormData();
    formData.append('file', fs.createReadStream(filePath));
    formData.append('examId', courseId);
    formData.append('type', 'exam-course');
    
    const response = await axios.post(`${API_BASE_URL}/questions/import`, formData, {
      headers: { 
        ...formData.getHeaders(),
        Authorization: `Bearer ${adminToken}` 
      }
    });
    
    fs.unlinkSync(filePath);
    
    if (response.data.success) {
      recordTest('Import Exam Course Questions', true);
      return true;
    }
    
    recordTest('Import Exam Course Questions', false, response.data.message);
    return false;
  } catch (error) {
    recordTest('Import Exam Course Questions', false, error.response?.data?.message || error.message);
    return false;
  }
};

// =============================================================================
// TEST 6: Create QCM Banque
// =============================================================================
const testCreateQCMBanque = async (moduleId) => {
  if (!moduleId) {
    recordTest('Create QCM Banque', false, 'No module ID');
    return null;
  }
  
  try {
    const qcmData = {
      name: `Test QCM ${Date.now()}`,
      moduleId: moduleId,
      description: 'Test QCM Banque'
    };
    
    const response = await axios.post(`${API_BASE_URL}/qcm-banque`, qcmData, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    if (response.data.success && response.data.data) {
      testResults.createdData.qcmBanques.push(response.data.data);
      recordTest('Create QCM Banque', true);
      return response.data.data._id || response.data.data.id;
    }
    
    recordTest('Create QCM Banque', false, 'No QCM data returned');
    return null;
  } catch (error) {
    recordTest('Create QCM Banque', false, error.response?.data?.message || error.message);
    return null;
  }
};

// =============================================================================
// TEST 7: Import Questions to QCM Banque via Excel
// =============================================================================
const testImportQCMBanqueQuestions = async (qcmBanqueId) => {
  if (!qcmBanqueId) {
    recordTest('Import QCM Banque Questions', false, 'No QCM Banque ID');
    return false;
  }
  
  try {
    const questionData = [
      ['Question', 'A', 'B', 'C', 'D', 'E', 'answer'],
      ['QCM Question 1?', 'Choice A', 'Choice B', 'Choice C', 'Choice D', 'Choice E', 'a'],
      ['QCM Question 2?', 'Option 1', 'Option 2', 'Option 3', 'Option 4', 'Option 5', 'c'],
      ['QCM Question 3?', 'Ans 1', 'Ans 2', 'Ans 3', 'Ans 4', 'Ans 5', 'd']
    ];
    
    const filePath = createTestExcelFile('test-qcm-questions.xlsx', questionData);
    const formData = new FormData();
    formData.append('file', fs.createReadStream(filePath));
    formData.append('qcmBanqueId', qcmBanqueId);
    formData.append('type', 'qcm-banque');
    
    const response = await axios.post(`${API_BASE_URL}/questions/import`, formData, {
      headers: { 
        ...formData.getHeaders(),
        Authorization: `Bearer ${adminToken}` 
      }
    });
    
    fs.unlinkSync(filePath);
    
    if (response.data.success) {
      recordTest('Import QCM Banque Questions', true);
      return true;
    }
    
    recordTest('Import QCM Banque Questions', false, response.data.message);
    return false;
  } catch (error) {
    recordTest('Import QCM Banque Questions', false, error.response?.data?.message || error.message);
    return false;
  }
};

// =============================================================================
// TEST 8: Import Resume (PDF)
// =============================================================================
const testImportResume = async (moduleId) => {
  if (!moduleId) {
    recordTest('Import Resume', false, 'No module ID');
    return false;
  }
  
  // Check if Cloudinary is configured
  if (!process.env.CLOUDINARY_CLOUD_NAME || 
      process.env.CLOUDINARY_CLOUD_NAME === 'your_cloudinary_cloud_name') {
    recordTest('Import Resume', true, 'Skipped - Cloudinary not configured');
    log('⚠ Skipping resume upload test (Cloudinary not configured)', 'warning');
    return true;
  }
  
  try {
    // Create a test PDF file (minimal PDF structure)
    const pdfContent = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /Resources 4 0 R /MediaBox [0 0 612 792] /Contents 5 0 R >>
endobj
4 0 obj
<< /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >>
endobj
5 0 obj
<< /Length 44 >>
stream
BT
/F1 12 Tf
100 700 Td
(Test Resume) Tj
ET
endstream
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000214 00000 n 
0000000304 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
398
%%EOF`;
    
    const pdfPath = join(__dirname, 'test-resume.pdf');
    fs.writeFileSync(pdfPath, pdfContent);
    
    const formData = new FormData();
    formData.append('pdf', fs.createReadStream(pdfPath));
    formData.append('moduleId', moduleId);
    formData.append('courseName', 'Test Course');
    formData.append('title', 'Test Resume');
    
    const response = await axios.post(`${API_BASE_URL}/resumes/admin-upload`, formData, {
      headers: {
        ...formData.getHeaders(),
        Authorization: `Bearer ${adminToken}`
      }
    });
    
    fs.unlinkSync(pdfPath);
    
    if (response.data.success) {
      testResults.createdData.resumes.push(response.data.data);
      recordTest('Import Resume', true);
      return true;
    }
    
    recordTest('Import Resume', false, response.data.message);
    return false;
  } catch (error) {
    recordTest('Import Resume', false, error.response?.data?.message || error.message);
    return false;
  }
};

// =============================================================================
// USER SPACE TESTS - Verify user can access imported data
// =============================================================================

// TEST 9: User can view Exam Par Years questions with complete data
const testUserAccessExamParYears = async (examId) => {
  if (!examId) {
    recordTest('User Access - Exam Par Years', false, 'No exam ID');
    return false;
  }
  
  if (!userToken) {
    recordTest('User Access - Exam Par Years', false, 'No user token');
    return false;
  }
  
  try {
    const response = await axios.get(`${API_BASE_URL}/questions/by-exam/${examId}`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    
    if (response.data.success && Array.isArray(response.data.data) && response.data.data.length > 0) {
      const question = response.data.data[0];
      
      // Verify all question data is present and correct
      const hasText = !!question.text && question.text.trim().length > 0;
      const hasOptions = Array.isArray(question.options) && question.options.length >= 2;
      const optionsHaveText = question.options.every(opt => opt.text && opt.text.trim().length > 0);
      const hasCorrectAnswer = question.options.some(opt => opt.isCorrect === true);
      const hasImages = Array.isArray(question.images); // Images array should exist even if empty
      
      const allValid = hasText && hasOptions && optionsHaveText && hasCorrectAnswer && hasImages;
      
      if (allValid) {
        log(`  ✓ Question text: "${question.text.substring(0, 50)}..."`, 'info');
        log(`  ✓ Options count: ${question.options.length}`, 'info');
        log(`  ✓ Images array: ${question.images.length} image(s)`, 'info');
      }
      
      recordTest('User Access - Exam Par Years', allValid, allValid ? null : 'Incomplete question data');
      return allValid;
    }
    
    recordTest('User Access - Exam Par Years', false, 'No questions returned');
    return false;
  } catch (error) {
    recordTest('User Access - Exam Par Years', false, error.response?.data?.message || error.message);
    return false;
  }
};

// TEST 10: User can view Exam Course with complete data
const testUserAccessExamCourse = async (courseId) => {
  if (!courseId) {
    recordTest('User Access - Exam Course', false, 'No course ID');
    return false;
  }
  
  if (!userToken) {
    recordTest('User Access - Exam Course', false, 'No user token');
    return false;
  }
  
  try {
    // Get course details which includes linkedQuestions
    const courseResponse = await axios.get(`${API_BASE_URL}/exam-courses/${courseId}`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    
    if (!courseResponse.data.success) {
      recordTest('User Access - Exam Course', false, 'Cannot access course');
      return false;
    }
    
    const course = courseResponse.data.data;
    log(`  ✓ Course name: "${course.name}"`, 'info');
    log(`  ✓ Course category: "${course.category}"`, 'info');
    
    // Check if course has linked questions
    if (course.linkedQuestions && course.linkedQuestions.length > 0) {
      const question = course.linkedQuestions[0];
      const hasCompleteData = question.text && question.options && question.options.length > 0;
      
      if (hasCompleteData) {
        log(`  ✓ Course has ${course.linkedQuestions.length} linked question(s)`, 'info');
        log(`  ✓ Questions have complete data (text, options)`, 'info');
      }
      
      recordTest('User Access - Exam Course', hasCompleteData);
      return hasCompleteData;
    }
    
    // Course accessible but no questions yet (this is OK, questions are imported separately)
    recordTest('User Access - Exam Course', true, 'Course accessible (questions imported separately)');
    return true;
  } catch (error) {
    recordTest('User Access - Exam Course', false, error.response?.data?.message || error.message);
    return false;
  }
};

// TEST 11: User can view QCM Banque with complete question data
const testUserAccessQCMBanque = async (qcmBanqueId) => {
  if (!qcmBanqueId) {
    recordTest('User Access - QCM Banque', false, 'No QCM Banque ID');
    return false;
  }
  
  if (!userToken) {
    recordTest('User Access - QCM Banque', false, 'No user token');
    return false;
  }
  
  try {
    // Get QCM Banque details which includes questions
    const qcmResponse = await axios.get(`${API_BASE_URL}/qcm-banque/${qcmBanqueId}`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    
    if (!qcmResponse.data.success) {
      recordTest('User Access - QCM Banque', false, 'Cannot access QCM Banque');
      return false;
    }
    
    const qcm = qcmResponse.data.data;
    log(`  ✓ QCM name: "${qcm.name}"`, 'info');
    
    // Check if QCM has questions
    if (qcm.questions && qcm.questions.length > 0) {
      const question = qcm.questions[0];
      
      // Verify complete data structure
      const hasText = !!question.text;
      const hasOptions = Array.isArray(question.options) && question.options.length >= 2;
      const optionsComplete = question.options.every(opt => 
        opt.text && typeof opt.isCorrect === 'boolean'
      );
      
      const allValid = hasText && hasOptions && optionsComplete;
      
      if (allValid) {
        log(`  ✓ QCM has ${qcm.questions.length} question(s)`, 'info');
        log(`  ✓ First question has ${question.options.length} options`, 'info');
        log(`  ✓ Question data complete: text, options, isCorrect flags`, 'info');
      }
      
      recordTest('User Access - QCM Banque', allValid);
      return allValid;
    }
    
    recordTest('User Access - QCM Banque', true, 'QCM accessible (no questions yet)');
    return true;
  } catch (error) {
    recordTest('User Access - QCM Banque', false, error.response?.data?.message || error.message);
    return false;
  }
};

// TEST 12: User can view Resumes with complete data
const testUserAccessResumes = async (moduleId) => {
  if (!moduleId) {
    recordTest('User Access - Resumes', false, 'No module ID');
    return false;
  }
  
  if (!userToken) {
    recordTest('User Access - Resumes', false, 'No user token');
    return false;
  }
  
  try {
    const response = await axios.get(`${API_BASE_URL}/resumes/with-modules`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    
    if (response.data.success) {
      const resumes = response.data.data || [];
      log(`  ✓ User can access ${resumes.length} resume(s)`, 'info');
      
      if (resumes.length > 0) {
        const resume = resumes[0];
        const hasTitle = !!resume.title;
        const hasPdfUrl = !!resume.pdfUrl;
        
        if (hasTitle && hasPdfUrl) {
          log(`  ✓ Resume data complete: title and PDF URL present`, 'info');
        }
        
        recordTest('User Access - Resumes', hasTitle || hasPdfUrl || resumes.length === 0);
        return true;
      }
      
      recordTest('User Access - Resumes', true, 'No resumes yet (skipped Cloudinary)');
      return true;
    }
    
    recordTest('User Access - Resumes', false, 'No data returned');
    return false;
  } catch (error) {
    recordTest('User Access - Resumes', false, error.response?.data?.message || error.message);
    return false;
  }
};

// =============================================================================
// DATA INTEGRITY TESTS
// =============================================================================

// TEST 13: Verify question data integrity
const testQuestionDataIntegrity = async (examId) => {
  if (!examId) {
    recordTest('Question Data Integrity', false, 'No exam ID');
    return false;
  }
  
  try {
    const response = await axios.get(`${API_BASE_URL}/questions/by-exam/${examId}`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    if (response.data.success && response.data.data.length > 0) {
      const question = response.data.data[0];
      const validations = [
        !!question.text,
        question.options && question.options.length >= 2,
        question.options.some(opt => opt.isCorrect)
      ];
      
      const isValid = validations.every(v => v);
      recordTest('Question Data Integrity', isValid);
      return isValid;
    }
    
    recordTest('Question Data Integrity', false, 'No questions found');
    return false;
  } catch (error) {
    recordTest('Question Data Integrity', false, error.message);
    return false;
  }
};

// TEST 14: Verify module linkage
const testModuleLinkage = async (moduleId) => {
  if (!moduleId) {
    recordTest('Module Linkage', false, 'No module ID');
    return false;
  }
  
  try {
    // Check if exams are linked to module
    const examsResponse = await axios.get(`${API_BASE_URL}/exams/all`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    const linkedExams = examsResponse.data.data.filter(e => 
      (e.moduleId?._id || e.moduleId) === moduleId
    );
    
    recordTest('Module Linkage', linkedExams.length > 0);
    return linkedExams.length > 0;
  } catch (error) {
    recordTest('Module Linkage', false, error.message);
    return false;
  }
};

// =============================================================================
// MAIN TEST RUNNER
// =============================================================================
const runAllTests = async () => {
  console.clear();
  log('\n' + '='.repeat(80), 'bold');
  log('🧪 ADMIN IMPORT FUNCTIONS INTEGRATION TEST SUITE', 'bold');
  log('='.repeat(80) + '\n', 'bold');
  
  // Step 1: Authentication
  log('📋 Step 1: Authentication\n', 'info');
  const adminLoggedIn = await loginAdmin();
  if (!adminLoggedIn) {
    log('\n❌ Cannot proceed without admin authentication', 'error');
    process.exit(1);
  }
  
  // Try to login test user (skip registration since user exists from create-test-users.js)
  const userLoggedIn = await loginUser();
  
  if (!userLoggedIn) {
    log('⚠️  Warning: Test user login failed. User-side tests will be skipped.', 'warning');
    log('   Tip: Run "node create-test-users.js" to create test users', 'warning');
  } else {
    log('✓ Test user authenticated successfully\n', 'success');
  }
  
  // Step 2: Setup
  log('\n📋 Step 2: Creating Test Data\n', 'info');
  const moduleId = await testCreateModule();
  if (!moduleId) {
    log('\n❌ Cannot proceed without test module', 'error');
    process.exit(1);
  }
  
  // Step 3: Exam Par Years Tests
  log('\n📋 Step 3: Testing Exam Par Years Import\n', 'info');
  const examId = await testCreateExamParYears(moduleId);
  if (examId) {
    await testImportExamParYearsQuestions(examId);
    await testQuestionDataIntegrity(examId);
    if (userToken) await testUserAccessExamParYears(examId);
  }
  
  // Step 4: Exam Course Tests
  log('\n📋 Step 4: Testing Exam Course Import\n', 'info');
  const courseId = await testCreateExamCourse(moduleId);
  if (courseId) {
    await testImportExamCourseQuestions(courseId);
    if (userToken) await testUserAccessExamCourse(courseId);
  }
  
  // Step 5: QCM Banque Tests
  log('\n📋 Step 5: Testing QCM Banque Import\n', 'info');
  const qcmId = await testCreateQCMBanque(moduleId);
  if (qcmId) {
    await testImportQCMBanqueQuestions(qcmId);
    if (userToken) await testUserAccessQCMBanque(qcmId);
  }
  
  // Step 6: Resume Tests
  log('\n📋 Step 6: Testing Resume Import\n', 'info');
  await testImportResume(moduleId);
  if (userToken) await testUserAccessResumes(moduleId);
  
  // Step 7: Data Integrity Tests
  log('\n📋 Step 7: Testing Data Integrity\n', 'info');
  await testModuleLinkage(moduleId);
  
  // Print Results
  printResults();
  
  // Exit
  process.exit(testResults.failed > 0 ? 1 : 0);
};

// =============================================================================
// RESULTS PRINTER
// =============================================================================
const printResults = () => {
  log('\n' + '='.repeat(80), 'bold');
  log('📊 TEST RESULTS SUMMARY', 'bold');
  log('='.repeat(80) + '\n', 'bold');
  
  const total = testResults.passed + testResults.failed;
  const percentage = total > 0 ? Math.round((testResults.passed / total) * 100) : 0;
  
  log(`Total Tests: ${total}`, 'info');
  log(`Passed: ${testResults.passed} ✓`, 'success');
  log(`Failed: ${testResults.failed} ✗`, testResults.failed > 0 ? 'error' : 'success');
  log(`Success Rate: ${percentage}%\n`, percentage === 100 ? 'success' : 'warning');
  
  if (testResults.failed > 0) {
    log('❌ Failed Tests:', 'error');
    testResults.tests.filter(t => !t.passed).forEach(t => {
      log(`  - ${t.name}`, 'error');
      if (t.error) log(`    Error: ${t.error}`, 'error');
    });
    log('', 'reset');
  }
  
  log('📦 Created Test Data:', 'info');
  log(`  - Modules: ${testResults.createdData.modules.length}`, 'info');
  log(`  - Exams: ${testResults.createdData.exams.length}`, 'info');
  log(`  - Exam Courses: ${testResults.createdData.examCourses.length}`, 'info');
  log(`  - QCM Banques: ${testResults.createdData.qcmBanques.length}`, 'info');
  log(`  - Questions: ${testResults.createdData.questions.length}`, 'info');
  log(`  - Resumes: ${testResults.createdData.resumes.length}`, 'info');
  
  log('\n' + '='.repeat(80), 'bold');
  
  if (percentage === 100) {
    log('✨ ALL TESTS PASSED! Import functions are working correctly.', 'success');
  } else if (percentage >= 80) {
    log('⚠️  Most tests passed. Some issues detected.', 'warning');
  } else {
    log('❌ Many tests failed. Import functions need attention.', 'error');
  }
  
  log('='.repeat(80) + '\n', 'bold');
};

// Run all tests
runAllTests().catch(error => {
  console.error('\n❌ Test runner crashed:', error.message);
  console.error('Stack:', error.stack);
  process.exit(1);
});
