// Simple test for OTP endpoint
const http = require('http');

const postData = JSON.stringify({
  phone: '9876543210'
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/send-otp',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

console.log('🧪 Testing OTP endpoint...');

const req = http.request(options, (res) => {
  console.log(`📱 Status: ${res.statusCode}`);
  console.log(`📋 Headers:`, res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('📄 Response:', data);
    try {
      const jsonData = JSON.parse(data);
      if (jsonData.success) {
        console.log('✅ OTP endpoint is working!');
        if (jsonData.mockOtp) {
          console.log('🔑 Mock OTP for testing:', jsonData.mockOtp);
        }
      } else {
        console.log('❌ OTP endpoint failed:', jsonData.message);
      }
    } catch (e) {
      console.log('❌ Invalid JSON response:', data);
    }
  });
});

req.on('error', (e) => {
  console.error('💥 Request error:', e.message);
});

req.write(postData);
req.end();
