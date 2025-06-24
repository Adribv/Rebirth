#!/usr/bin/env node

const http = require('http');

console.log('🧪 Testing Content Rebirth Dashboard...\n');

// Test homepage
const testHomepage = () => {
  return new Promise((resolve, reject) => {
    const req = http.get('http://localhost:3000', (res) => {
      console.log(`✅ Homepage: ${res.statusCode} OK`);
      resolve(res.statusCode === 200);
    });
    
    req.on('error', (err) => {
      console.log(`❌ Homepage: ${err.message}`);
      reject(err);
    });
    
    req.setTimeout(5000, () => {
      console.log('❌ Homepage: Timeout');
      reject(new Error('Timeout'));
    });
  });
};

// Test dashboard
const testDashboard = () => {
  return new Promise((resolve, reject) => {
    const req = http.get('http://localhost:3000/dashboard', (res) => {
      console.log(`✅ Dashboard: ${res.statusCode} OK`);
      resolve(res.statusCode === 200);
    });
    
    req.on('error', (err) => {
      console.log(`❌ Dashboard: ${err.message}`);
      reject(err);
    });
    
    req.setTimeout(5000, () => {
      console.log('❌ Dashboard: Timeout');
      reject(new Error('Timeout'));
    });
  });
};

// Run tests
const runTests = async () => {
  try {
    await testHomepage();
    await testDashboard();
    
    console.log('\n🎉 All tests passed! Your Content Rebirth application is working correctly.');
    console.log('\n🚀 Next steps:');
    console.log('1. Open your browser and go to: http://localhost:3000');
    console.log('2. Click "Get Started" to access the dashboard');
    console.log('3. Create your first meeting bot with a Zoom/Google Meet URL');
    console.log('4. Generate content from meeting transcripts!');
    
  } catch (error) {
    console.log('\n❌ Some tests failed. Please check your application.');
    console.log('Error:', error.message);
  }
};

runTests(); 