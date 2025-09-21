// Simple test for health endpoint
const http = require('http');

console.log('🧪 Testing health endpoint...');

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/health',
  method: 'GET'
};

const req = http.request(options, (res) => {
  console.log(`📱 Status: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('📄 Response:', data);
  });
});

req.on('error', (e) => {
  console.error('💥 Request error:', e.message);
  console.log('💡 Make sure the server is running on port 5000');
});

req.end();
