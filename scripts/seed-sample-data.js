#!/usr/bin/env node

/**
 * Sample Data Seeder for Invoice Builder
 * Creates test businesses, clients, items, currencies, units, and categories
 * 
 * Usage: node scripts/seed-sample-data.js
 */

const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  console.error('   Required: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Use service role key to bypass RLS policies
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Get user ID from command line argument or use default
const TEST_USER_ID = process.argv[2] || '00000000-0000-0000-0000-000000000001';

console.log(`📝 Using user ID: ${TEST_USER_ID}`);
console.log('💡 To use a different user ID, run: node scripts/seed-sample-data.js YOUR-USER-ID\n');

async function seedData() {
  console.log('🌱 Starting to seed sample data...\n');

  try {
    // 1. Create sample currencies (public table - no user_id)
    console.log('💱 Creating currencies...');
    const { data: currencies, error: currenciesError } = await supabase
      .from('currencies')
      .upsert([
        { code: 'USD', symbol: '$', text: 'US Dollar', format: 'en-US', subunit: 100, is_archived: 0 },
        { code: 'EUR', symbol: '€', text: 'Euro', format: 'de-DE', subunit: 100, is_archived: 0 },
        { code: 'GBP', symbol: '£', text: 'British Pound', format: 'en-GB', subunit: 100, is_archived: 0 },
      ], { onConflict: 'code', ignoreDuplicates: false })
      .select();

    if (currenciesError) {
      console.error('❌ Currency error:', currenciesError);
    } else {
      console.log(`✅ Created ${currencies?.length || 0} currencies`);
    }

    // 2. Create sample units (public table - no user_id)
    console.log('\n📏 Creating units...');
    const { data: units, error: unitsError } = await supabase
      .from('units')
      .upsert([
        { name: 'hours', is_archived: 0 },
        { name: 'pcs', is_archived: 0 },
        { name: 'days', is_archived: 0 },
      ], { onConflict: 'name', ignoreDuplicates: false })
      .select();

    if (unitsError) {
      console.error('❌ Units error:', unitsError);
    } else {
      console.log(`✅ Created ${units?.length || 0} units`);
    }

    // 3. Create sample categories (public table - no user_id)
    console.log('\n📁 Creating categories...');
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .upsert([
        { name: 'Design Services', is_archived: 0 },
        { name: 'Development', is_archived: 0 },
        { name: 'Consulting', is_archived: 0 },
      ], { onConflict: 'name', ignoreDuplicates: false })
      .select();

    if (categoriesError) {
      console.error('❌ Categories error:', categoriesError);
    } else {
      console.log(`✅ Created ${categories?.length || 0} categories`);
    }

    // 4. Create sample business
    console.log('\n🏢 Creating sample business...');
    const { data: businesses, error: businessError } = await supabase
      .from('businesses')
      .insert([
        {
          user_id: TEST_USER_ID,
          name: 'Acme Corporation LLC',
          short_name: 'AC',
          email: 'billing@acme-corp.com',
          phone: '+1 (555) 123-4567',
          address: '123 Business St\nSuite 100\nSan Francisco, CA 94102',
          website: 'www.acme-corp.com',
          role: 'CEO & Founder',
          payment_information: 'Bank: First National Bank\nAccount: 1234567890\nRouting: 987654321',
          is_archived: 0,
        },
        {
          user_id: TEST_USER_ID,
          name: 'TechStart Innovations',
          short_name: 'TS',
          email: 'hello@techstart.io',
          phone: '+1 (555) 987-6543',
          address: '456 Startup Ave\nBuilding B\nAustin, TX 78701',
          website: 'www.techstart.io',
          role: 'CTO',
          payment_information: 'PayPal: payments@techstart.io\nVenmo: @techstart',
          is_archived: 0,
        }
      ])
      .select();

    if (businessError) {
      console.error('❌ Business error:', businessError);
    } else {
      console.log(`✅ Created ${businesses?.length || 0} businesses`);
    }

    // 5. Create sample clients
    console.log('\n👥 Creating sample clients...');
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .insert([
        {
          user_id: TEST_USER_ID,
          name: 'GlobalTech Industries',
          short_name: 'GT',
          email: 'accounts@globaltech.com',
          phone: '+1 (555) 234-5678',
          address: '789 Enterprise Blvd\nNew York, NY 10001',
          code: 'CLI-001',
          is_archived: 0,
        },
        {
          user_id: TEST_USER_ID,
          name: 'StartupHub Inc',
          short_name: 'SH',
          email: 'finance@startuphub.com',
          phone: '+1 (555) 345-6789',
          address: '321 Innovation Drive\nSan Jose, CA 95110',
          code: 'CLI-002',
          is_archived: 0,
        },
        {
          user_id: TEST_USER_ID,
          name: 'Creative Agency Co',
          short_name: 'CA',
          email: 'billing@creativeagency.com',
          phone: '+1 (555) 456-7890',
          address: '654 Design Lane\nLos Angeles, CA 90001',
          code: 'CLI-003',
          is_archived: 0,
        }
      ])
      .select();

    if (clientsError) {
      console.error('❌ Clients error:', clientsError);
    } else {
      console.log(`✅ Created ${clients?.length || 0} clients`);
    }

    // 6. Create sample items
    console.log('\n📦 Creating sample items...');
    const hoursUnitId = units?.[0]?.id || 1; // hours
    const pcsUnitId = units?.[1]?.id || 2; // pcs
    const designCategoryId = categories?.[0]?.id || 1; // Design Services
    const devCategoryId = categories?.[1]?.id || 2; // Development
    const consultingCategoryId = categories?.[2]?.id || 3; // Consulting

    const { data: items, error: itemsError } = await supabase
      .from('items')
      .insert([
        {
          user_id: TEST_USER_ID,
          name: 'Website Design',
          amount: '150.00',
          unit_id: hoursUnitId,
          category_id: designCategoryId,
          description: 'Custom website design including mockups and revisions',
          is_archived: 0,
        },
        {
          user_id: TEST_USER_ID,
          name: 'Logo Design',
          amount: '500.00',
          unit_id: pcsUnitId,
          category_id: designCategoryId,
          description: 'Brand identity design with 3 concepts and unlimited revisions',
          is_archived: 0,
        },
        {
          user_id: TEST_USER_ID,
          name: 'Development (Frontend)',
          amount: '125.00',
          unit_id: hoursUnitId,
          category_id: devCategoryId,
          description: 'Frontend development using React/Next.js',
          is_archived: 0,
        },
        {
          user_id: TEST_USER_ID,
          name: 'Consulting Session',
          amount: '200.00',
          unit_id: hoursUnitId,
          category_id: consultingCategoryId,
          description: 'Strategic consulting and business planning',
          is_archived: 0,
        }
      ])
      .select();

    if (itemsError) {
      console.error('❌ Items error:', itemsError);
    } else {
      console.log(`✅ Created ${items?.length || 0} items`);
    }

    console.log('\n✨ Sample data seeded successfully!\n');
    console.log('📊 Summary:');
    console.log(`   - ${currencies?.length || 0} currencies`);
    console.log(`   - ${units?.length || 0} units`);
    console.log(`   - ${categories?.length || 0} categories`);
    console.log(`   - ${businesses?.length || 0} businesses`);
    console.log(`   - ${clients?.length || 0} clients`);
    console.log(`   - ${items?.length || 0} items\n`);
    
    console.log('🎯 Next steps:');
    console.log('   1. Refresh your browser to see the data');
    console.log('   2. Try creating an invoice with the sample data');
    console.log('   3. Remember to re-enable authentication in middleware.ts\n');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  }
}

// Run the seeder
seedData();
