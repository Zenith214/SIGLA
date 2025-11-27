// Test login API directly
require('dotenv').config({ path: '.env.local' });
console.log('🧪 Testing Login API...\n');

async function testLogin() {
  try {
    console.log('Testing login with admin credentials...');
    
    const response = await fetch('http://localhost:3000/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@sigla.com',
        password: 'password'
      })
    });
    
    console.log('Response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Login successful!');
      console.log('User data:', data.user);
      console.log('Role:', data.role);
    } else {
      const errorData = await response.text();
      console.log('❌ Login failed');
      console.log('Error response:', errorData);
    }
    
  } catch (error) {
    console.log('💥 Network error:', error.message);
  }
}

async function testDatabaseConnection() {
  console.log('Testing direct database connection...');
  
  try {
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    const { data: users, error } = await supabase
      .from('user')
      .select('*')
      .eq('email', 'admin@sigla.com');
    
    if (error) {
      console.log('❌ Database error:', error.message);
    } else {
      console.log('✅ Database connection working');
      console.log('Admin user found:', users.length > 0 ? 'Yes' : 'No');
      if (users.length > 0) {
        console.log('User details:', {
          id: users[0].id,
          email: users[0].email,
          firstName: users[0].firstName,
          role: users[0].role
        });
      }
    }
    
  } catch (error) {
    console.log('💥 Database connection error:', error.message);
  }
}

async function runTests() {
  await testDatabaseConnection();
  console.log('\n' + '='.repeat(50) + '\n');
  await testLogin();
}

runTests();