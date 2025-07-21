#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });

console.log('🔧 Testing Environment Variables...\n');

const envVars = {
  'DATABASE_URL': process.env.DATABASE_URL,
  'OPENAI_API_KEY': process.env.OPENAI_API_KEY ? '✅ Set' : '❌ Missing',
  'MEETSTREAM_API_KEY': process.env.MEETSTREAM_API_KEY ? '✅ Set' : '❌ Missing',
  'MEETSTREAM_BASE_URL': process.env.MEETSTREAM_BASE_URL,
  'NEXT_PUBLIC_MEETSTREAM_API_KEY': process.env.NEXT_PUBLIC_MEETSTREAM_API_KEY ? '✅ Set' : '❌ Missing',
  'NEXT_PUBLIC_MEETSTREAM_BASE_URL': process.env.NEXT_PUBLIC_MEETSTREAM_BASE_URL,
};

console.log('Environment Variables Status:');
Object.entries(envVars).forEach(([key, value]) => {
  if (key.includes('API_KEY') && value !== '✅ Set' && value !== '❌ Missing') {
    console.log(`${key}: ✅ Set (${value.substring(0, 10)}...)`);
  } else {
    console.log(`${key}: ${value}`);
  }
});

console.log('\n🎯 Client-side variables (NEXT_PUBLIC_):');
console.log(`NEXT_PUBLIC_MEETSTREAM_API_KEY: ${envVars.NEXT_PUBLIC_MEETSTREAM_API_KEY}`);
console.log(`NEXT_PUBLIC_MEETSTREAM_BASE_URL: ${envVars.NEXT_PUBLIC_MEETSTREAM_BASE_URL}`);

const allSet = Object.values(envVars).every(value => value && value !== '❌ Missing');
console.log(`\n${allSet ? '✅ All environment variables are properly configured!' : '❌ Some environment variables are missing.'}`);

if (allSet) {
  console.log('\n🚀 Your Content Rebirth application should work correctly now!');
  console.log('Visit: http://localhost:3000/dashboard');
} 