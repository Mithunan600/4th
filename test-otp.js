// Simple test script to check OTP endpoint

// Using built-in fetch (Node.js 18+)

async function testOTP() {
  try {
    console.log('🧪 Testing OTP endpoint...');
    
    const response = await fetch('http://localhost:5000/api/auth/send-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phone: '9876543210' })
    });

    const data = await response.json();
    
    console.log('📱 Response:', data);
    
    if (data.success) {
      console.log('✅ OTP endpoint is working!');
      if (data.mockOtp) {
        console.log('🔑 Mock OTP for testing:', data.mockOtp);
      }
    } else {
      console.log('❌ OTP endpoint failed:', data.message);
    }
    
  } catch (error) {
    console.error('💥 Error testing OTP:', error.message);
  }
}

testOTP();
