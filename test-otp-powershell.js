// Test OTP endpoint using PowerShell
const { exec } = require('child_process');

const command = `Invoke-WebRequest -Uri "http://localhost:5000/api/auth/send-otp" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"phone":"9876543210"}'`;

console.log('🧪 Testing OTP endpoint...');

exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error('❌ Error:', error.message);
    return;
  }
  
  if (stderr) {
    console.error('❌ Stderr:', stderr);
    return;
  }
  
  console.log('📄 Response:', stdout);
  
  // Try to parse the response
  try {
    const lines = stdout.split('\n');
    const contentLine = lines.find(line => line.includes('Content'));
    if (contentLine) {
      const jsonMatch = contentLine.match(/\{.*\}/);
      if (jsonMatch) {
        const jsonData = JSON.parse(jsonMatch[0]);
        if (jsonData.success) {
          console.log('✅ OTP endpoint is working!');
          if (jsonData.mockOtp) {
            console.log('🔑 Mock OTP for testing:', jsonData.mockOtp);
          }
        } else {
          console.log('❌ OTP endpoint failed:', jsonData.message);
        }
      }
    }
  } catch (e) {
    console.log('📄 Raw response:', stdout);
  }
});
