#!/usr/bin/env node

/**
 * Check authentication status
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAuth() {
  console.log('🔐 Checking authentication...\n');
  
  const { data, error } = await supabase.auth.getUser();
  
  if (error) {
    console.log('❌ Error:', error.message);
  } else if (!data.user) {
    console.log('❌ No user session found');
    console.log('💡 You need to log in through the browser first');
  } else {
    console.log('✅ User authenticated:');
    console.log(`   Email: ${data.user.email}`);
    console.log(`   ID: ${data.user.id}`);
  }
}

checkAuth().catch(console.error);
