/**
 * Test script to verify cookie flow in deployed application
 * Usage: node scripts/test-cookie-flow.js <your-railway-url>
 * Example: node scripts/test-cookie-flow.js https://mlgrc-pulse.up.railway.app
 */

const https = require('https');
const http = require('http');

const BASE_URL = process.argv[2] || 'http://localhost:3000';
const TEST_EMAIL = process.argv[3] || 'ana@example.com';
const TEST_PASSWORD = process.argv[4] || 'password123';

console.log('🧪 Testing Cookie Flow');
console.log('📍 Base URL:', BASE_URL);
console.log('📧 Test Email:', TEST_EMAIL);
console.log('');

// Parse URL
const url = new URL(BASE_URL);
const isHttps = url.protocol === 'https:';
const httpModule = isHttps ? https : http;

// Step 1: Login
function testLogin() {
  return new Promise((resolve, reject) => {
    const loginData = JSON.stringify({
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    });

    const options = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: '/api/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': loginData.length
      }
    };

    console.log('1️⃣ Testing Login API...');
    const req = httpModule.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        console.log('   Status:', res.statusCode);
        console.log('   Response:', data);
        
        const setCookieHeader = res.headers['set-cookie'];
        console.log('   Set-Cookie Header:', setCookieHeader);
        
        if (setCookieHeader) {
          const pulseTokenCookie = setCookieHeader.find(c => c.startsWith('pulse_token='));
          if (pulseTokenCookie) {
            console.log('   ✅ pulse_token cookie found!');
            
            // Extract cookie value
            const cookieMatch = pulseTokenCookie.match(/pulse_token=([^;]+)/);
            const token = cookieMatch ? cookieMatch[1] : null;
            
            if (token) {
              console.log('   Token preview:', token.substring(0, 30) + '...');
              resolve({ token, cookie: pulseTokenCookie });
            } else {
              reject(new Error('Could not extract token from cookie'));
            }
          } else {
            console.log('   ❌ pulse_token cookie NOT found in Set-Cookie header');
            reject(new Error('pulse_token cookie not set'));
          }
        } else {
          console.log('   ❌ No Set-Cookie header in response');
          reject(new Error('No Set-Cookie header'));
        }
      });
    });

    req.on('error', (error) => {
      console.error('   ❌ Login request failed:', error.message);
      reject(error);
    });

    req.write(loginData);
    req.end();
  });
}

// Step 2: Test /api/me with cookie
function testMe(token) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: '/api/me',
      method: 'GET',
      headers: {
        'Cookie': `pulse_token=${token}`
      }
    };

    console.log('');
    console.log('2️⃣ Testing /api/me with cookie...');
    const req = httpModule.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        console.log('   Status:', res.statusCode);
        console.log('   Response:', data);
        
        if (res.statusCode === 200) {
          console.log('   ✅ Successfully authenticated!');
          resolve(data);
        } else {
          console.log('   ❌ Authentication failed');
          reject(new Error('Authentication failed'));
        }
      });
    });

    req.on('error', (error) => {
      console.error('   ❌ /api/me request failed:', error.message);
      reject(error);
    });

    req.end();
  });
}

// Step 3: Test protected route (dashboard)
function testDashboard(token) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: '/dashboard',
      method: 'GET',
      headers: {
        'Cookie': `pulse_token=${token}`
      },
      // Don't follow redirects automatically
      followRedirect: false
    };

    console.log('');
    console.log('3️⃣ Testing /dashboard access...');
    const req = httpModule.request(options, (res) => {
      console.log('   Status:', res.statusCode);
      console.log('   Location:', res.headers.location || 'N/A');
      
      if (res.statusCode === 200) {
        console.log('   ✅ Dashboard accessible!');
        resolve();
      } else if (res.statusCode === 307 || res.statusCode === 308) {
        if (res.headers.location === '/login') {
          console.log('   ❌ Redirected to login - Cookie not working!');
          reject(new Error('Redirected to login'));
        } else {
          console.log('   ⚠️ Redirected to:', res.headers.location);
          resolve();
        }
      } else {
        console.log('   ❌ Unexpected status code');
        reject(new Error('Unexpected status'));
      }
    });

    req.on('error', (error) => {
      console.error('   ❌ Dashboard request failed:', error.message);
      reject(error);
    });

    req.end();
  });
}

// Run tests
async function runTests() {
  try {
    const { token } = await testLogin();
    await testMe(token);
    await testDashboard(token);
    
    console.log('');
    console.log('✅ All tests passed! Cookie flow is working correctly.');
  } catch (error) {
    console.log('');
    console.log('❌ Tests failed:', error.message);
    console.log('');
    console.log('Troubleshooting:');
    console.log('1. Check that JWT_SECRET is set in Railway environment variables');
    console.log('2. Verify the test credentials are correct');
    console.log('3. Check Railway logs for detailed error messages');
    console.log('4. Ensure the application is deployed and running');
    process.exit(1);
  }
}

runTests();
