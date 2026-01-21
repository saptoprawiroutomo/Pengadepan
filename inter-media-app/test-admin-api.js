const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/inter-media-app');

async function testAdminUsersAPI() {
  try {
    await new Promise((resolve) => {
      mongoose.connection.once('open', resolve);
    });

    console.log('🧪 Testing Admin Users API...\n');

    // Test data
    const testUser = {
      name: 'Test User API',
      email: 'testapi@example.com',
      password: '123456',
      role: 'customer',
      phone: '081234567890',
      address: 'Test Address'
    };

    console.log('📤 Sending POST request to create user...');
    console.log('Data:', { ...testUser, password: '[HIDDEN]' });

    // Simulate API call
    const response = await fetch('https://bookish-yodel-7xg75gj4pgvhp64g-3000.app.github.dev/api/admin/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Note: In real test, we'd need session cookie
      },
      body: JSON.stringify(testUser)
    });

    console.log('📥 Response status:', response.status);
    console.log('📥 Response ok:', response.ok);

    const responseText = await response.text();
    console.log('📥 Raw response:', responseText.substring(0, 200) + '...');

    if (response.ok) {
      try {
        const data = JSON.parse(responseText);
        console.log('✅ User created successfully!');
        console.log('📋 User ID:', data._id);
        console.log('📋 User email:', data.email);
      } catch (e) {
        console.log('⚠️ Response is not JSON');
      }
    } else {
      try {
        const errorData = JSON.parse(responseText);
        console.log('❌ API Error:', errorData.error);
      } catch (e) {
        console.log('❌ Non-JSON error response');
      }
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testAdminUsersAPI();
