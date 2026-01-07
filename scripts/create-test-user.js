#!/usr/bin/env node

/**
 * Create Test User for Invoice Builder
 * Creates a test user account to use for seeding data
 * 
 * Usage: node scripts/create-test-user.js
 */

const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const TEST_EMAIL = 'test@invoice-builder.com';
const TEST_PASSWORD = 'TestPassword123!';

async function createTestUser() {
  console.log('👤 Creating test user...\n');

  try {
    // Try to sign up
    const { data, error } = await supabase.auth.signUp({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    });

    if (error) {
      if (error.message.includes('already registered')) {
        console.log('ℹ️  User already exists, attempting to sign in...\n');
        
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: TEST_EMAIL,
          password: TEST_PASSWORD,
        });

        if (signInError) {
          console.error('❌ Sign in error:', signInError.message);
          process.exit(1);
        }

        console.log('✅ Signed in successfully!');
        console.log(`📧 Email: ${TEST_EMAIL}`);
        console.log(`🔑 Password: ${TEST_PASSWORD}`);
        console.log(`👤 User ID: ${signInData.user?.id}\n`);
        
        console.log('🎯 Next step:');
        console.log(`   Run: node scripts/seed-sample-data.js ${signInData.user?.id}\n`);
        
        return signInData.user?.id;
      } else {
        console.error('❌ Signup error:', error.message);
        process.exit(1);
      }
    }

    console.log('✅ Test user created successfully!');
    console.log(`📧 Email: ${TEST_EMAIL}`);
    console.log(`🔑 Password: ${TEST_PASSWORD}`);
    console.log(`👤 User ID: ${data.user?.id}\n`);
    
    console.log('📝 Note: You may need to confirm the email if email confirmation is enabled.');
    console.log('\n🎯 Next step:');
    console.log(`   Run: node scripts/seed-sample-data.js ${data.user?.id}\n`);
    
    return data.user?.id;

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  }
}

// Run the function
createTestUser();
