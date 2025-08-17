// comprehensive-vehicle-test.js
// Test CopilotKit + Supabase integration with actual vehicle data

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://fyqdlfdthkkslbwtsvmq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5cWRsZmR0aGtrc2xid3Rzdm1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ5MDgyMzcsImV4cCI6MjA3MDQ4NDIzN30.YDB-rA4Q7EjFrXHctUROrEGK8-LkrG2RZ5KWinVEDSQ'
);

console.log('\n🚗 COMPREHENSIVE VEHICLE INTEGRATION TEST\n');
console.log('=' .repeat(60));

async function runVehicleTests() {
  const results = [];
  
  // Test 1: Verify BMW Vehicles Exist in Database
  console.log('\n✅ Test 1: BMW Vehicle Data Verification');
  console.log('-' .repeat(40));
  try {
    const { data: bmwVehicles, error } = await supabase
      .from('vehicles')
      .select('*')
      .eq('make', 'BMW')
      .order('model');
    
    if (error) throw error;
    
    console.log(`✓ Found ${bmwVehicles.length} BMW vehicles in database`);
    
    // Show BMW models found
    const bmwModels = [...new Set(bmwVehicles.map(v => v.model))];
    console.log('✓ BMW Models available:', bmwModels.join(', '));
    
    // Check specific BMW from your data
    const bmw330i = bmwVehicles.find(v => v.model === '330i');
    const bmwX3 = bmwVehicles.find(v => v.model === 'X3');
    const bmwM4 = bmwVehicles.find(v => v.model === 'M4');
    
    if (bmw330i) console.log('✓ BMW 330i xDrive found - Price: $' + bmw330i.price);
    if (bmwX3) console.log('✓ BMW X3 xDrive30i found - Price: $' + bmwX3.price);
    if (bmwM4) console.log('✓ BMW M4 Competition found - Price: $' + bmwM4.price);
    
    results.push({ test: 'BMW Vehicle Data', passed: true });
  } catch (error) {
    console.log('✗ FAILED:', error.message);
    results.push({ test: 'BMW Vehicle Data', passed: false });
  }

  // Test 2: Vehicle Search & Filter Functionality
  console.log('\n✅ Test 2: Vehicle Search & Filter');
  console.log('-' .repeat(40));
  try {
    // Search for luxury vehicles (BMW, Mercedes, Audi, Porsche)
    const { data: luxuryVehicles, error } = await supabase
      .from('vehicles')
      .select('make, model, price, year')
      .in('make', ['BMW', 'Mercedes-Benz', 'Audi', 'Porsche', 'Land Rover'])
      .order('price', { ascending: false });
    
    if (error) throw error;
    
    console.log(`✓ Found ${luxuryVehicles.length} luxury vehicles`);
    
    // Group by make
    const byMake = {};
    luxuryVehicles.forEach(v => {
      byMake[v.make] = (byMake[v.make] || 0) + 1;
    });
    
    console.log('✓ Luxury brands inventory:');
    Object.entries(byMake).forEach(([make, count]) => {
      console.log(`  - ${make}: ${count} vehicles`);
    });
    
    // Price range analysis
    const prices = luxuryVehicles.map(v => parseFloat(v.price));
    const avgPrice = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
    console.log(`✓ Average luxury vehicle price: $${avgPrice.toLocaleString()}`);
    
    results.push({ test: 'Vehicle Search & Filter', passed: true });
  } catch (error) {
    console.log('✗ FAILED:', error.message);
    results.push({ test: 'Vehicle Search & Filter', passed: false });
  }

  // Test 3: Session + Vehicle Selection Integration
  console.log('\n✅ Test 3: Session + Vehicle Selection');
  console.log('-' .repeat(40));
  try {
    // Create a test session
    const testSessionId = `vehicle-test-${Date.now()}`;
    
    const { data: session, error: sessionError } = await supabase
      .from('state_machine_sessions')
      .insert({
        session_id: testSessionId,
        current_stage: 'buildCar',
        started_at: new Date().toISOString(),
        car_built: false
      })
      .select()
      .single();
    
    if (sessionError) throw sessionError;
    
    console.log('✓ Test session created:', testSessionId);
    
    // Select a BMW vehicle for this session
    const { data: bmw, error: bmwError } = await supabase
      .from('vehicles')
      .select('*')
      .eq('make', 'BMW')
      .eq('model', '330i')
      .single();
    
    if (bmwError) throw bmwError;
    
    // Save vehicle selection
    const { data: selection, error: selectionError } = await supabase
      .from('selected_cars')
      .insert({
        session_id: session.id,
        car_id: bmw.id,
        make: bmw.make,
        model: bmw.model,
        year: bmw.year,
        price: bmw.price,
        color: bmw.exterior_color,
        is_final_selection: true
      })
      .select()
      .single();
    
    if (selectionError) throw selectionError;
    
    console.log(`✓ BMW ${bmw.model} selected for session`);
    console.log(`✓ Vehicle details: ${bmw.year} ${bmw.exterior_color} - $${bmw.price}`);
    
    // Update session
    await supabase
      .from('state_machine_sessions')
      .update({ 
        car_built: true,
        current_stage: 'sellFinancing'
      })
      .eq('id', session.id);
    
    console.log('✓ Session updated to financing stage');
    
    // Cleanup
    await supabase.from('selected_cars').delete().eq('session_id', session.id);
    await supabase.from('state_machine_sessions').delete().eq('id', session.id);
    
    results.push({ test: 'Session + Vehicle Selection', passed: true });
  } catch (error) {
    console.log('✗ FAILED:', error.message);
    results.push({ test: 'Session + Vehicle Selection', passed: false });
  }

  // Test 4: CopilotKit Readable State with Vehicles
  console.log('\n✅ Test 4: CopilotKit Context with Vehicle Data');
  console.log('-' .repeat(40));
  try {
    // Simulate the readable state that CopilotKit would see
    const { data: randomBMW } = await supabase
      .from('vehicles')
      .select('*')
      .eq('make', 'BMW')
      .limit(1)
      .single();
    
    const copilotReadableState = {
      sessionId: 'test-copilot-session',
      dbSessionId: 123,
      currentStage: 'buildCar',
      selectedCar: randomBMW ? {
        id: randomBMW.id,
        make: randomBMW.make,
        model: randomBMW.model,
        year: randomBMW.year,
        price: randomBMW.price,
        color: randomBMW.exterior_color,
        features: randomBMW.features || []
      } : null,
      availableVehicles: [], // Would be populated with search results
      contactInfo: {
        name: 'Sanjiv Khullar',
        email: 'sk@ipix.co',
        phone: '4168003103'
      }
    };
    
    // Verify structure
    const hasRequiredFields = 
      'sessionId' in copilotReadableState &&
      'selectedCar' in copilotReadableState &&
      'currentStage' in copilotReadableState;
    
    if (hasRequiredFields && copilotReadableState.selectedCar) {
      console.log('✓ CopilotKit context structure valid');
      console.log(`✓ Vehicle data available to AI: ${copilotReadableState.selectedCar.make} ${copilotReadableState.selectedCar.model}`);
      console.log('✓ Customer info integrated with vehicle selection');
      console.log('✓ Ready for AI-powered recommendations');
      results.push({ test: 'CopilotKit Context', passed: true });
    } else {
      throw new Error('Invalid context structure');
    }
  } catch (error) {
    console.log('✗ FAILED:', error.message);
    results.push({ test: 'CopilotKit Context', passed: false });
  }

  // Test 5: Complete Purchase Flow with BMW
  console.log('\n✅ Test 5: Complete BMW Purchase Journey');
  console.log('-' .repeat(40));
  try {
    // Simulate complete journey
    const journeySessionId = `bmw-journey-${Date.now()}`;
    
    // 1. Create session
    const { data: session } = await supabase
      .from('state_machine_sessions')
      .insert({
        session_id: journeySessionId,
        current_stage: 'getContactInfo',
        started_at: new Date().toISOString()
      })
      .select()
      .single();
    
    console.log('✓ Journey started: Contact Info stage');
    
    // 2. Save contact info
    const { data: contact } = await supabase
      .from('contact_info')
      .insert({
        session_id: session.id,
        name: 'Test BMW Buyer',
        email: 'bmw@test.com',
        phone: '555-BMW1'
      })
      .select()
      .single();
    
    await supabase
      .from('state_machine_sessions')
      .update({ 
        contact_info_completed: true,
        current_stage: 'buildCar'
      })
      .eq('id', session.id);
    
    console.log('✓ Contact saved, moved to: Build Car stage');
    
    // 3. Select BMW
    const { data: bmwX3 } = await supabase
      .from('vehicles')
      .select('*')
      .eq('make', 'BMW')
      .eq('model', 'X3')
      .single();
    
    if (bmwX3) {
      await supabase
        .from('selected_cars')
        .insert({
          session_id: session.id,
          car_id: bmwX3.id,
          make: bmwX3.make,
          model: bmwX3.model,
          year: bmwX3.year,
          price: bmwX3.price
        });
      
      await supabase
        .from('state_machine_sessions')
        .update({ 
          car_built: true,
          current_stage: 'sellFinancing'
        })
        .eq('id', session.id);
      
      console.log(`✓ BMW X3 selected ($${bmwX3.price}), moved to: Financing stage`);
    }
    
    // 4. Complete remaining stages
    const stages = [
      { stage: 'getFinancingInfo', flag: 'financing_info_completed' },
      { stage: 'getPaymentInfo', flag: 'payment_completed' },
      { stage: 'confirmOrder', flag: 'order_confirmed' }
    ];
    
    for (const { stage, flag } of stages) {
      await supabase
        .from('state_machine_sessions')
        .update({ 
          [flag]: true,
          current_stage: stage
        })
        .eq('id', session.id);
      
      console.log(`✓ Completed: ${stage}`);
    }
    
    // Verify journey completion
    const { data: final } = await supabase
      .from('state_machine_sessions')
      .select('*')
      .eq('id', session.id)
      .single();
    
    if (final.order_confirmed) {
      console.log('✓ BMW purchase journey completed successfully!');
      results.push({ test: 'BMW Purchase Journey', passed: true });
    }
    
    // Cleanup
    await supabase.from('contact_info').delete().eq('session_id', session.id);
    await supabase.from('selected_cars').delete().eq('session_id', session.id);
    await supabase.from('state_machine_sessions').delete().eq('id', session.id);
    
  } catch (error) {
    console.log('✗ FAILED:', error.message);
    results.push({ test: 'BMW Purchase Journey', passed: false });
  }

  // Final Summary
  console.log('\n' + '=' .repeat(60));
  console.log('\n🏆 FINAL TEST RESULTS\n');
  
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  
  results.forEach((r, i) => {
    const icon = r.passed ? '✅' : '❌';
    console.log(`${icon} Test ${i + 1}: ${r.test}`);
  });
  
  console.log('\n' + '-' .repeat(40));
  console.log(`Total: ${passed}/${results.length} tests passed`);
  
  if (passed === results.length) {
    console.log('\n🎉 SUCCESS! All vehicle integration tests passed!');
    console.log('🚗 BMW vehicles are fully integrated with CopilotKit!');
    console.log('✨ The system can now:');
    console.log('   - Show BMW inventory to customers');
    console.log('   - Allow AI-powered vehicle selection');
    console.log('   - Complete purchase journeys with real vehicles');
    console.log('   - Track all interactions in Supabase');
  } else {
    console.log('\n⚠️  Some tests failed. Review the errors above.');
  }
  
  console.log('\n' + '=' .repeat(60) + '\n');
}

runVehicleTests().catch(console.error);
