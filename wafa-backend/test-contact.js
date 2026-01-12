import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const API_URL = process.env.API_URL || 'http://localhost:5010/api/v1';

const testContactEndpoints = async () => {
  try {
    console.log('=== TESTING CONTACT ENDPOINTS ===\n');

    // Test 1: Send a contact message (Public endpoint - should work)
    console.log('TEST 1: Sending contact message...');
    const messageData = {
      name: 'Test User',
      email: 'test@example.com',
      subject: 'Test Subject',
      message: 'This is a test message from the contact form.'
    };

    const sendResponse = await axios.post(`${API_URL}/contact`, messageData);
    console.log('✓ Message sent successfully');
    console.log('Response:', JSON.stringify(sendResponse.data, null, 2));
    const messageId = sendResponse.data?.data?._id;
    console.log('Message ID:', messageId);

    // Test 2: Try to fetch messages without authentication (should fail)
    console.log('\n\nTEST 2: Fetching messages without auth...');
    try {
      const fetchNoAuth = await axios.get(`${API_URL}/contact`);
      console.log('✗ ERROR: Should have been rejected but got:', fetchNoAuth.status);
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        console.log('✓ Correctly rejected unauthorized request');
        console.log('Status:', err.response.status);
        console.log('Message:', err.response?.data?.message);
      } else {
        console.log('✗ Unexpected error:', err.message);
      }
    }

    // Test 3: Check database directly
    console.log('\n\nTEST 3: Checking database for stored message...');
    try {
      const mongoose = (await import('mongoose')).default;
      await mongoose.connect(process.env.MONGO_URL);
      const Contact = (await import('./models/contactModel.js')).default;
      
      const storedMessages = await Contact.find().sort({ createdAt: -1 }).limit(3);
      console.log('✓ Messages in database:');
      storedMessages.forEach((msg, idx) => {
        console.log(`  ${idx + 1}. From: ${msg.name} (${msg.email})`);
        console.log(`     Subject: ${msg.subject}`);
        console.log(`     Status: ${msg.status}`);
        console.log(`     Created: ${msg.createdAt}`);
        console.log();
      });

      await mongoose.disconnect();
    } catch (dbErr) {
      console.log('Error connecting to database:', dbErr.message);
    }

    console.log('\n=== TESTS COMPLETED ===');
  } catch (error) {
    console.error('Test error:', error.message);
    console.error('Full error:', error);
    if (error.response?.data) {
      console.error('Response data:', error.response.data);
    }
  }
};

testContactEndpoints();
