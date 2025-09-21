// Final test for OTP endpoint
const http = require('http');

console.log('🧪 Testing OTP endpoint...');

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

const req = http.request(options, (res) => {
  console.log(`📱 Status: ${res.statusCode}`);
  console.log(`📋 Headers:`, res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('📄 Response Body:', data);
    try {
      const jsonData = JSON.parse(data);
      console.log('📄 Parsed JSON:', JSON.stringify(jsonData, null, 2));
      
      if (jsonData.success) {
        console.log('✅ OTP endpoint is working!');
        if (jsonData.mockOtp) {
          console.log('🔑 Mock OTP for testing:', jsonData.mockOtp);
        }
      } else {
        console.log('❌ OTP endpoint failed:', jsonData.message);
      }
    } catch (e) {
      console.log('❌ Failed to parse JSON:', e.message);
      console.log('📄 Raw response:', data);
    }
  });
});

req.on('error', (e) => {
  console.error('💥 Request error:', e.message);
});

req.setTimeout(5000, () => {
  console.log('⏰ Request timeout');
  req.destroy();
});

req.write(postData);
req.end();
