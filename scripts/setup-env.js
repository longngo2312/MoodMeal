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
  console.log('🚀 MoodMeal Environment Setup\n');
  
  const envPath = path.join(process.cwd(), '.env');
  const envExamplePath = path.join(process.cwd(), '.env.example');
  
  // Check if .env already exists
  if (fs.existsSync(envPath)) {
    const overwrite = await question('⚠️  .env file already exists. Overwrite? (y/N): ');
    if (overwrite.toLowerCase() !== 'y') {
      console.log('✅ Setup cancelled. Existing .env file preserved.');
      rl.close();
      return;
    }
  }
  
  console.log('📝 Please provide your Supabase credentials:');
  console.log('   You can find these at: https://supabase.com/dashboard/project/[your-project]/settings/api\n');
  
  const supabaseUrl = await question('🔗 Supabase Project URL: ');
  const supabaseAnonKey = await question('🔑 Supabase Anon Key: ');
  
  // Validate inputs
  if (!supabaseUrl || !supabaseAnonKey) {
    console.log('❌ Error: Both URL and Anon Key are required.');
    rl.close();
    return;
  }
  
  if (!supabaseUrl.startsWith('https://') || !supabaseUrl.includes('.supabase.co')) {
    console.log('❌ Error: Invalid Supabase URL format. Should be: https://your-project-id.supabase.co');
    rl.close();
    return;
  }
  
  // Create .env content
  const envContent = `# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=${supabaseUrl}
EXPO_PUBLIC_SUPABASE_ANON_KEY=${supabaseAnonKey}

# Generated on ${new Date().toISOString()}
`;
  
  try {
    fs.writeFileSync(envPath, envContent);
    console.log('\n✅ Environment file created successfully!');
    console.log('📁 Location:', envPath);
    console.log('\n🔒 Security reminder:');
    console.log('   - Never commit .env files to version control');
    console.log('   - The .env file is already in .gitignore');
    console.log('\n🚀 Next steps:');
    console.log('   1. Set up your Supabase database tables (see README.md)');
    console.log('   2. Run: npm start');
    console.log('\n📖 For GitHub Actions setup, see: ENVIRONMENT_SETUP.md');
  } catch (error) {
    console.log('❌ Error creating .env file:', error.message);
  }
  
  rl.close();
}

// Run the setup
setupEnvironment().catch(console.error);
