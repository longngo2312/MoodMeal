#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function setupEnvironment() {
  console.log('MoodMeal Environment Setup\n');

  const envPath = path.join(process.cwd(), '.env');

  if (fs.existsSync(envPath)) {
    const overwrite = await question('.env file already exists. Overwrite? (y/N): ');
    if (overwrite.toLowerCase() !== 'y') {
      console.log('Setup cancelled. Existing .env file preserved.');
      rl.close();
      return;
    }
  }

  console.log('Please provide your API configuration:\n');

  const apiUrl = await question('API URL (default: http://localhost:3000/api): ');

  const envContent = `# MoodMeal API Configuration
EXPO_PUBLIC_API_URL=${apiUrl || 'http://localhost:3000/api'}

# Generated on ${new Date().toISOString()}
`;

  try {
    fs.writeFileSync(envPath, envContent);
    console.log('\nEnvironment file created successfully!');
    console.log('Location:', envPath);
    console.log('\nNext steps:');
    console.log('   1. cd backend && npm install');
    console.log('   2. npm run dev (start the backend)');
    console.log('   3. cd .. && npm start (start the app)');
  } catch (error) {
    console.log('Error creating .env file:', error.message);
  }

  rl.close();
}

setupEnvironment().catch(console.error);
