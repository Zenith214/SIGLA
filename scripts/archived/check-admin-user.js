// Check if admin user exists in Supabase database
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

async function checkAdminUser() {
  try {
    console.log('Checking for admin user in database...');
    
    // Check if admin user exists
    const { data, error } = await supabase
      .from('user')
      .select('*')
      .eq('email', 'admin@sigla.com')
      .single();
    
    if (error) {
      console.error('Error checking admin user:', error);
      return;
    }
    
    if (data) {
      console.log('Admin user found:', data);
      console.log('Password hash:', data.password);
    } else {
      console.log('Admin user not found in database');
    }
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

checkAdminUser();