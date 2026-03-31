// Test script to verify registration endpoint
const axios = require('axios');

async function testRegistration() {
  const testData = {
    username: 'newuser' + Date.now(),
    email: `newuser${Date.now()}@example.com`,
    password: 'password123',
    confirm_password: 'password123'
  };

  try {
    console.log('Testing registration endpoint...');
    console.log('Data being sent:', testData);
    
    const response = await axios.post('http://127.0.0.1:8000/auth/register/', testData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Registration successful!');
    console.log('Response:', response.data);
    
  } catch (error) {
    console.error('❌ Registration failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
      console.error('Headers:', error.response.headers);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testRegistration();
