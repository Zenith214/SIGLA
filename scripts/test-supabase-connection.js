// Test Supabase connection
require('dotenv').config({ path: '.env.local' });
console.log('🔍 Testing Supabase Connection...\n');

// Test 1: Environment variables
console.log('1. Environment Variables:');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✅ Set' : '❌ Missing');
console.log('SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing');
console.log('SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing');

// Test 2: Parse connection string
if (process.env.DATABASE_URL) {
  try {
    const url = new URL(process.env.DATABASE_URL);
    console.log('\n2. Connection String Parsed:');
    console.log('Host:', url.hostname);
    console.log('Port:', url.port);
    console.log('Database:', url.pathname.substring(1));
    console.log('Username:', url.username);
    console.log('Password:', url.password ? '✅ Present' : '❌ Missing');
  } catch (error) {
    console.log('\n2. ❌ Invalid DATABASE_URL format');
  }
}

// Test 3: Try Supabase client
console.log('\n3. Testing Supabase Client...');
try {
  const { createClient } = require('@supabase/supabase-js');
  
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    
    console.log('✅ Supabase client created successfully');
    
    // Try a simple query
    supabase
      .from('barangay')
      .select('count')
      .limit(1)
      .then(({ data, error }) => {
        if (error) {
          console.log('❌ Supabase query failed:', error.message);
          if (error.message.includes('relation "barangay" does not exist')) {
            console.log('💡 This is expected - tables not created yet');
            console.log('✅ Connection to Supabase is working!');
          }
        } else {
          console.log('✅ Supabase query successful:', data);
        }
      })
      .catch(err => {
        console.log('❌ Network error:', err.message);
      });
  } else {
    console.log('❌ Missing Supabase environment variables');
  }
} catch (error) {
  console.log('❌ Error creating Supabase client:', error.message);
}

// Test 4: Check if project is ready
console.log('\n4. Project Status Check:');
console.log('If you see connection errors above:');
console.log('• Check your Supabase dashboard');
console.log('• Ensure project status is GREEN (not orange/red)');
console.log('• Wait 2-3 minutes if project was just created');
console.log('• Verify password in DATABASE_URL is correct');