// Test the updated login API with new Supabase connection
const fetch = require('node-fetch');

async function testLoginApi() {
  try {
    console.log('Testing login API with admin credentials...');
    
    const response = await fetch('http://localhost:3000/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@sigla.com',
        password: 'password'
      })
    });
    
    const status = response.status;
    const data = await response.json();
    
    console.log('Response status:', status);
    console.log('Response data:', data);
    
    if (status === 200) {
      console.log('Login successful!');
    } else {
      console.log('Login failed.');
    }
  } catch (error) {
    console.error('Error testing login API:', error);
  }
}

testLoginApi();