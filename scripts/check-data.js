#!/usr/bin/env node

/**
 * Quick database data checker
 * Shows what data exists for debugging
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const TEST_USER_ID = process.argv[2] || '48c5d069-4982-42c9-8c9a-dd3c47502cb4';

async function checkData() {
  console.log(`🔍 Checking data for user: ${TEST_USER_ID}\n`);

  // Check public tables
  const { data: currencies } = await supabase.from('currencies').select('*');
  console.log(`💱 Currencies: ${currencies?.length || 0}`);
  currencies?.forEach(c => console.log(`   - ${c.code}: ${c.symbol}`));

  const { data: units } = await supabase.from('units').select('*');
  console.log(`\n📏 Units: ${units?.length || 0}`);
  units?.forEach(u => console.log(`   - ${u.name} (id: ${u.id})`));

  const { data: categories } = await supabase.from('categories').select('*');
  console.log(`\n📁 Categories: ${categories?.length || 0}`);
  categories?.forEach(c => console.log(`   - ${c.name} (id: ${c.id})`));

  // Check user tables
  const { data: businesses } = await supabase
    .from('businesses')
    .select('*')
    .eq('user_id', TEST_USER_ID);
  console.log(`\n🏢 Businesses: ${businesses?.length || 0}`);
  businesses?.forEach(b => console.log(`   - ${b.name} (id: ${b.id})`));

  const { data: clients } = await supabase
    .from('clients')
    .select('*')
    .eq('user_id', TEST_USER_ID);
  console.log(`\n👥 Clients: ${clients?.length || 0}`);
  clients?.forEach(c => console.log(`   - ${c.name} (id: ${c.id})`));

  const { data: items } = await supabase
    .from('items')
    .select('*')
    .eq('user_id', TEST_USER_ID);
  console.log(`\n📦 Items: ${items?.length || 0}`);
  items?.forEach(i => console.log(`   - ${i.name}: $${i.amount} per ${i.unit_id} (id: ${i.id})`));

  const { data: invoices } = await supabase
    .from('invoices')
    .select('*')
    .eq('user_id', TEST_USER_ID);
  console.log(`\n📄 Invoices: ${invoices?.length || 0}`);
  invoices?.forEach(inv => console.log(`   - ${inv.invoice_number}: ${inv.status}`));
}

checkData().catch(console.error);
