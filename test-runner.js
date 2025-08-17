// test-runner.js
// Command-line test runner for CopilotKit + Supabase integration

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fyqdlfdthkkslbwtsvmq.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5cWRsZmR0aGtrc2xid3Rzdm1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ5MDgyMzcsImV4cCI6MjA3MDQ4NDIzN30.YDB-rA4Q7EjFrXHctUROrEGK8-LkrG2RZ5KWinVEDSQ';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('\n🧪 Running CopilotKit + Supabase Integration Tests\n');
console.log('=' .repeat(50));

async function runTests() {
  const results = [];
  
  // Test 1: Database Connection
  console.log('\n📝 Test 1: Database Connection');
  try {
    const { data, error } = await supabase
      .from('car_sales_sessions')
      .select('count')
      .limit(1);
    
    if (error) throw error;
    console.log('✅ PASSED - Database connected successfully');
    results.push({ test: 1, passed: true });
  } catch (error) {
    console.log('❌ FAILED -', error.message);
    results.push({ test: 1, passed: false });
  }

  // Test 2: Session Creation
  console.log('\n📝 Test 2: Session Creation');
  try {
    const testSessionId = `cli-test-${Date.now()}`;
    const { data, error } = await supabase
      .from('car_sales_sessions')
      .insert({
        session_id: testSessionId,
        current_stage: 'getContactInfo',
        started_at: new Date().toISOString(),
        is_active: true
      })
      .select()
      .single();
    
    if (error) throw error;
    console.log('✅ PASSED - Session created:', testSessionId);
    
    // Cleanup
    await supabase.from('car_sales_sessions').delete().eq('id', data.id);
    results.push({ test: 2, passed: true });
  } catch (error) {
    console.log('❌ FAILED -', error.message);
    results.push({ test: 2, passed: false });
  }

  // Test 3: State Synchronization
  console.log('\n📝 Test 3: State Synchronization');
  try {
    const testSessionId = `cli-sync-${Date.now()}`;
    
    // Create session
    const { data: session, error: createError } = await supabase
      .from('car_sales_sessions')
      .insert({
        session_id: testSessionId,
        current_stage: 'getContactInfo',
        started_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (createError) throw createError;
    
    // Update stage
    const { error: updateError } = await supabase
      .from('car_sales_sessions')
      .update({ 
        current_stage: 'buildCar',
        last_activity: new Date().toISOString()
      })
      .eq('id', session.id);
    
    if (updateError) throw updateError;
    
    // Verify
    const { data: updated, error: fetchError } = await supabase
      .from('car_sales_sessions')
      .select('current_stage')
      .eq('id', session.id)
      .single();
    
    if (fetchError) throw fetchError;
    
    if (updated.current_stage === 'buildCar') {
      console.log('✅ PASSED - Stage synced: getContactInfo → buildCar');
      results.push({ test: 3, passed: true });
    } else {
      throw new Error('Stage not updated');
    }
    
    // Cleanup
    await supabase.from('car_sales_sessions').delete().eq('id', session.id);
  } catch (error) {
    console.log('❌ FAILED -', error.message);
    results.push({ test: 3, passed: false });
  }

  // Test 4: Data Persistence
  console.log('\n📝 Test 4: Data Persistence');
  try {
    // Create session
    const { data: session, error: sessionError } = await supabase
      .from('car_sales_sessions')
      .insert({
        session_id: `cli-persist-${Date.now()}`,
        current_stage: 'getContactInfo',
        started_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (sessionError) throw sessionError;
    
    // Save contact
    const { data: contact, error: contactError } = await supabase
      .from('contact_information')
      .insert({
        session_id: session.id,
        name: 'CLI Test User',
        email: 'cli@test.com',
        phone: '555-CLI1',
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (contactError) throw contactError;
    
    // Update session
    const { error: updateError } = await supabase
      .from('car_sales_sessions')
      .update({ 
        contact_info_completed: true,
        current_stage: 'buildCar'
      })
      .eq('id', session.id);
    
    if (updateError) throw updateError;
    
    console.log('✅ PASSED - Data persisted and session updated');
    results.push({ test: 4, passed: true });
    
    // Cleanup
    await supabase.from('contact_information').delete().eq('session_id', session.id);
    await supabase.from('car_sales_sessions').delete().eq('id', session.id);
  } catch (error) {
    console.log('❌ FAILED -', error.message);
    results.push({ test: 4, passed: false });
  }

  // Test 5: Table Structure
  console.log('\n📝 Test 5: Table Structure & Relationships');
  try {
    // Check if we can query with relationships
    const { data, error } = await supabase
      .from('car_sales_sessions')
      .select(`
        id,
        session_id,
        current_stage,
        contact_information (
          name,
          email
        )
      `)
      .limit(1);
    
    if (error) throw error;
    
    console.log('✅ PASSED - Table relationships working');
    results.push({ test: 5, passed: true });
  } catch (error) {
    console.log('❌ FAILED -', error.message);
    results.push({ test: 5, passed: false });
  }

  // Summary
  console.log('\n' + '=' .repeat(50));
  console.log('\n📊 TEST SUMMARY\n');
  
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  
  console.log(`✅ Passed: ${passed}/5`);
  console.log(`❌ Failed: ${failed}/5`);
  
  if (passed === 5) {
    console.log('\n🎉 All tests passed! Integration is working perfectly!');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the errors above.');
  }
  
  console.log('\n' + '=' .repeat(50) + '\n');
  
  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(console.error);
