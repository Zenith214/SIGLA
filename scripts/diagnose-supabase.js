// Comprehensive Supabase Diagnostics
require('dotenv').config({ path: '.env.local' });
console.log('🔍 Supabase Project Diagnostics\n');

async function runDiagnostics() {
  console.log('='.repeat(50));
  console.log('1. ENVIRONMENT CHECK');
  console.log('='.repeat(50));
  
  const dbUrl = process.env.DATABASE_URL;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  console.log('DATABASE_URL:', dbUrl ? '✅ Present' : '❌ Missing');
  console.log('SUPABASE_URL:', supabaseUrl ? '✅ Present' : '❌ Missing');
  console.log('ANON_KEY:', anonKey ? '✅ Present' : '❌ Missing');
  
  if (dbUrl) {
    try {
      const url = new URL(dbUrl);
      console.log('\nDatabase Connection Details:');
      console.log('Host:', url.hostname);
      console.log('Port:', url.port);
      console.log('Database:', url.pathname.substring(1));
      console.log('Username:', url.username);
      console.log('Password:', url.password ? `✅ ${url.password.length} chars` : '❌ Missing');
    } catch (e) {
      console.log('❌ Invalid DATABASE_URL format');
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('2. NETWORK CONNECTIVITY TEST');
  console.log('='.repeat(50));
  
  if (supabaseUrl) {
    try {
      console.log('Testing HTTPS connection to Supabase...');
      const response = await fetch(supabaseUrl + '/rest/v1/', {
        headers: {
          'apikey': anonKey,
          'Authorization': `Bearer ${anonKey}`
        }
      });
      
      console.log('HTTP Status:', response.status);
      console.log('Response OK:', response.ok ? '✅' : '❌');
      
      if (response.ok) {
        console.log('✅ Supabase API is reachable');
      } else {
        console.log('❌ Supabase API error');
        const text = await response.text();
        console.log('Error:', text.substring(0, 200));
      }
    } catch (error) {
      console.log('❌ Network error:', error.message);
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('3. DATABASE CONNECTION TEST');
  console.log('='.repeat(50));
  
  try {
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(supabaseUrl, anonKey);
    
    console.log('Testing database query...');
    const { data, error } = await supabase
      .from('_realtime_schema_migrations')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('Query Error:', error.message);
      
      if (error.message.includes('does not exist')) {
        console.log('💡 This might be normal - checking system tables...');
        
        // Try a different system query
        const { data: data2, error: error2 } = await supabase.rpc('version');
        if (error2) {
          console.log('System Query Error:', error2.message);
        } else {
          console.log('✅ Database is responding to system queries');
        }
      }
    } else {
      console.log('✅ Database query successful');
    }
  } catch (error) {
    console.log('❌ Client error:', error.message);
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('4. RECOMMENDATIONS');
  console.log('='.repeat(50));
  
  console.log('\nIf your project has been orange for over 1 hour:');
  console.log('');
  console.log('🔄 OPTION 1: Restart the project');
  console.log('   • Go to Supabase dashboard');
  console.log('   • Settings → General');
  console.log('   • Look for "Restart project" or "Pause/Resume"');
  console.log('');
  console.log('🆕 OPTION 2: Create a new project');
  console.log('   • Delete current project');
  console.log('   • Create new project with same name');
  console.log('   • Use same password');
  console.log('   • Update connection string');
  console.log('');
  console.log('📞 OPTION 3: Check Supabase status');
  console.log('   • Visit: https://status.supabase.com');
  console.log('   • Check for ongoing incidents');
  console.log('');
  console.log('💳 OPTION 4: Check account status');
  console.log('   • Billing → Usage');
  console.log('   • Ensure account is in good standing');
  
  console.log('\n' + '='.repeat(50));
  console.log('5. ALTERNATIVE: USE DIFFERENT DATABASE');
  console.log('='.repeat(50));
  
  console.log('\nIf Supabase continues to have issues:');
  console.log('• Railway.app (PostgreSQL)');
  console.log('• Neon.tech (PostgreSQL)');
  console.log('• PlanetScale (MySQL - would need schema changes)');
  console.log('• Aiven.io (PostgreSQL)');
}

runDiagnostics().catch(console.error);