// Test Supabase connection with new credentials
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in environment variables');
  process.exit(1);
}

console.log('Supabase URL:', supabaseUrl);
console.log('Service Key Length:', supabaseServiceKey.length);

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function testConnection() {
  try {
    console.log('Testing Supabase connection...');
    
    // Test query to check if we can access the database
    const { data, error } = await supabase
      .from('user')
      .select('id, email')
      .limit(1);
    
    if (error) {
      console.error('Error connecting to Supabase:', error);
      return;
    }
    
    console.log('Connection successful!');
    console.log('User data:', data);
    
    // Test query for barangay table
    const { data: barangays, error: barangayError } = await supabase
      .from('barangay')
      .select('barangay_id, barangay_name')
      .limit(3);
    
    if (barangayError) {
      console.error('Error fetching barangays:', barangayError);
    } else {
      console.log('Barangay data:', barangays);
    }
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

testConnection();