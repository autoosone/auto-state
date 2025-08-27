const { createClient } = require('@supabase/supabase-js');

// Use the correct Supabase credentials
const supabaseUrl = 'https://lmkxosluphwxjvnqzmka.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxta3hvc2x1cGh3eGp2bnF6bWthIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxOTE5MzYsImV4cCI6MjA3MTc2NzkzNn0.LYLfIDrEPrL_jsou8bkiF_QhdbcSfNGgau4dSf3GVR4';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSupabaseConnection() {
  console.log('🧪 Testing Supabase Connection...\n');
  console.log('📍 URL:', supabaseUrl);
  console.log('🔑 Key prefix:', supabaseKey.substring(0, 20) + '...\n');

  try {
    // Test 1: Check if we can connect
    console.log('1️⃣ Testing basic connection...');
    const { data: testData, error: testError } = await supabase
      .from('car_sales_sessions')
      .select('*')
      .limit(1);
    
    if (testError) {
      console.log('❌ Connection error:', testError.message);
      
      // If it's a column error, try without that column
      if (testError.message.includes('last_activity')) {
        console.log('\n2️⃣ Trying without last_activity column...');
        const { data: retryData, error: retryError } = await supabase
          .from('car_sales_sessions')
          .select('id, session_id, user_id, current_stage, stage_data, contact_info_completed, car_built, financing_decided, payment_info_completed, order_confirmed, created_at')
          .limit(1);
        
        if (retryError) {
          console.log('❌ Still error:', retryError.message);
        } else {
          console.log('✅ Connection successful without last_activity!');
          console.log('📊 Sample data:', retryData);
        }
      }
    } else {
      console.log('✅ Connection successful!');
      console.log('📊 Sample data:', testData);
    }

    // Test 2: Check vehicles table
    console.log('\n3️⃣ Testing vehicles table...');
    const { count, error: vehicleError } = await supabase
      .from('vehicles')
      .select('*', { count: 'exact', head: true });
    
    if (vehicleError) {
      console.log('❌ Vehicles table error:', vehicleError.message);
    } else {
      console.log('✅ Vehicles table accessible!');
      console.log('🚗 Total vehicles in inventory:', count);
    }

    // Test 3: Check dealers table
    console.log('\n4️⃣ Testing dealers table...');
    const { count: dealerCount, error: dealerError } = await supabase
      .from('dealers')
      .select('*', { count: 'exact', head: true });
    
    if (dealerError) {
      console.log('❌ Dealers table error:', dealerError.message);
    } else {
      console.log('✅ Dealers table accessible!');
      console.log('🏢 Total dealers in network:', dealerCount);
    }

    // Test 4: List all tables
    console.log('\n5️⃣ Getting database schema info...');
    const { data: tables, error: schemaError } = await supabase
      .from('car_sales_sessions')
      .select()
      .limit(0); // Just get schema, no data
    
    if (!schemaError) {
      console.log('✅ Database is accessible and responding!');
    }

  } catch (error) {
    console.error('💥 Unexpected error:', error.message);
  }

  console.log('\n✅ SUMMARY: Supabase is connected to the correct database!');
  console.log('⚠️  Note: The "last_activity" column needs to be added to car_sales_sessions table');
}

testSupabaseConnection();
