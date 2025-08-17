// check-schema.js
// Check actual database schema

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://fyqdlfdthkkslbwtsvmq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5cWRsZmR0aGtrc2xid3Rzdm1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ5MDgyMzcsImV4cCI6MjA3MDQ4NDIzN30.YDB-rA4Q7EjFrXHctUROrEGK8-LkrG2RZ5KWinVEDSQ'
);

async function checkSchema() {
  console.log('\n📊 Checking Database Schema\n');
  console.log('=' .repeat(50));
  
  // Test what works with car_sales_sessions
  console.log('\n1. Testing car_sales_sessions table:');
  try {
    const { data, error } = await supabase
      .from('car_sales_sessions')
      .select('*')
      .limit(1);
    
    if (!error && data) {
      console.log('✅ Table exists');
      if (data.length > 0) {
        console.log('Columns found:', Object.keys(data[0]));
      } else {
        // Insert a test record to see structure
        const { data: test, error: testError } = await supabase
          .from('car_sales_sessions')
          .insert({
            session_id: `schema-test-${Date.now()}`,
            current_stage: 'getContactInfo',
            started_at: new Date().toISOString()
          })
          .select()
          .single();
        
        if (!testError) {
          console.log('Columns:', Object.keys(test));
          // Cleanup
          await supabase.from('car_sales_sessions').delete().eq('id', test.id);
        }
      }
    }
  } catch (e) {
    console.log('❌ Error:', e.message);
  }
  
  // Check state_machine_sessions (alternative table name)
  console.log('\n2. Testing state_machine_sessions table:');
  try {
    const { data, error } = await supabase
      .from('state_machine_sessions')
      .select('*')
      .limit(1);
    
    if (!error) {
      console.log('✅ Table exists');
      if (data && data.length > 0) {
        console.log('Columns found:', Object.keys(data[0]));
      }
    }
  } catch (e) {
    console.log('❌ Not found');
  }
  
  // Check contact_info table
  console.log('\n3. Testing contact_info table:');
  try {
    const { data, error } = await supabase
      .from('contact_info')
      .select('*')
      .limit(1);
    
    if (!error) {
      console.log('✅ Table exists');
      if (data && data.length > 0) {
        console.log('Sample data:', data[0]);
      }
    }
  } catch (e) {
    console.log('❌ Error:', e.message);
  }
  
  console.log('\n' + '=' .repeat(50));
}

checkSchema();
