#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const envContent = `# MongoDB (replace content_rebirth with your preferred DB name if needed)
DATABASE_URL="mongodb+srv://jeyadeepak2005:TimeBeast1012005@cluster0.4i2q2kb.mongodb.net/content_rebirth?retryWrites=true&w=majority&appName=Cluster0"

# Meetstream.ai (for meeting transcripts) - Server-side
MEETSTREAM_API_KEY="ms_H3XjWL4qeh0X9GqshgbZT9ku3MnBnI04"
MEETSTREAM_BASE_URL="https://api.meetstream.ai"

# Meetstream.ai (for meeting transcripts) - Client-side
NEXT_PUBLIC_MEETSTREAM_API_KEY="ms_H3XjWL4qeh0X9GqshgbZT9ku3MnBnI04"
NEXT_PUBLIC_MEETSTREAM_BASE_URL="https://api.meetstream.ai"
`;

const envPath = path.join(__dirname, '.env.local');

try {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env.local file updated successfully!');
  console.log('📁 File location:', envPath);
  console.log('\n🚀 Next steps:');
  console.log('1. Restart your development server: npm run dev');
  console.log('2. Visit: http://localhost:3000');
  console.log('3. Go to dashboard and create your first meeting bot!');
} catch (error) {
  console.error('❌ Error updating .env.local file:', error.message);
  console.log('\n📝 Please update the file manually with the following content:');
  console.log('\n' + envContent);
} 